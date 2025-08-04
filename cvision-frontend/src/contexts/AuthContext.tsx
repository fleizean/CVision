'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserFromToken, isTokenExpired } from '@/utils/jwt'

interface User {
  id: string
  email: string
  name: string
  surname: string
  roles: string[]
  
  // Backward compatibility
  roleName?: string | null
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  refreshToken: () => Promise<boolean>
  apiCall: (url: string, options?: RequestInit) => Promise<Response>
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  hasAllRoles: (roles: string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  const isAuthenticated = !!user

  useEffect(() => {
    setMounted(true)
    // Quick check for token existence first
    const token = localStorage.getItem('token')
    if (!token) {
      setIsLoading(false)
      return
    }
    
    // Check if token is expired
    if (isTokenExpired(token)) {
      // Try to refresh token immediately
      const refreshTokenValue = localStorage.getItem('refreshToken')
      if (refreshTokenValue) {
        refreshToken().then(() => {
          setIsLoading(false)
        })
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        setIsLoading(false)
      }
      return
    }
    
    // If token is valid, try to get user data from token
    const userData = getUserFromToken(token)
    if (userData) {
      setUser(userData)
      setIsLoading(false)
      // Still verify with server but don't wait for it
      checkAuthStatus(0, true)
    } else {
      // If can't decode token, do full auth check
      checkAuthStatus()
    }
  }, [])

  const checkAuthStatus = async (retryCount = 0, silent = false) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Checking auth status with token:', token)
      if (!token) {
        if (!silent) setIsLoading(false)
        return
      }

      // Verify token with backend
      const response = await fetch('http://localhost:5117/api/auths/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json();
        console.log('Auth check response:', data)
        if (data.StatusCode === 200) {
          const userData = {
            id: data.Data.Id,
            email: data.Data.Email,
            name: data.Data.Name,
            surname: data.Data.Surname,
            roles: data.Data.Roles || [],
            roleName: data.Data.RoleName || null // Backward compatibility
          }
          setUser(userData)
          console.log('User data set:', userData);
        } else {
          // Try to refresh token before logging out (only once)
          if (retryCount === 0) {
            console.log('Auth failed, attempting token refresh...')
            const refreshSuccess = await refreshToken()
            if (refreshSuccess) {
              // Retry with new token
              await checkAuthStatus(1, silent)
            } else {
              logout()
            }
          } else {
            logout()
          }
        }
      } else if (response.status === 401) {
        // Token expired or invalid, try to refresh (only once)
        if (retryCount === 0) {
          console.log('Token expired, attempting refresh...')
          const refreshSuccess = await refreshToken()
          if (refreshSuccess) {
            // Retry with new token
            await checkAuthStatus(1, silent)
          } else {
            logout()
          }
        } else {
          logout()
        }
      } else {
        logout()
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Try refresh token before logout (only once)
      if (retryCount === 0) {
        const refreshSuccess = await refreshToken()
        if (!refreshSuccess) {
          logout()
        } else {
          // Retry after refresh
          await checkAuthStatus(1, silent)
        }
      } else {
        logout()
      }
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch('http://localhost:5117/api/auths/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.StatusCode === 200 && data.Data?.AccessToken) {
        localStorage.setItem('token', data.Data.AccessToken)
        localStorage.setItem('refreshToken', data.Data.RefreshToken)
        
        // After successful login, get user data from the /me endpoint
        await checkAuthStatus()

        return { success: true }
      } else if (data.StatusCode === 403) {
        // Account suspended
        return { success: false, message: data.Message || 'Your account has been suspended by the administrator.' }
      } else if (data.StatusCode === 404) {
        // User not found
        return { success: false, message: 'Invalid email or password.' }
      } else if (data.StatusCode === 401) {
        // Invalid credentials
        return { success: false, message: 'Invalid email or password.' }
      } else {
        return { success: false, message: data.Message || 'Login failed. Please try again.' }
      }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, message: 'Network error. Please check your connection and try again.' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    setUser(null)
    router.push('/login')
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken')
      if (!refreshTokenValue) return false

      const response = await fetch('http://localhost:5117/api/auths/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue })
      })

      const data = await response.json()

      if (data.StatusCode === 200 && data.Data?.AccessToken) {
        localStorage.setItem('token', data.Data.AccessToken)
        localStorage.setItem('refreshToken', data.Data.RefreshToken)
        console.log('Token refreshed successfully')
        return true
      }

      logout()
      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      return false
    }
  }

  // API wrapper with automatic token refresh
  const apiCall = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = localStorage.getItem('token')
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    }

    let response = await fetch(url, { ...options, headers })

    // If unauthorized and we have a refresh token, try to refresh
    if (response.status === 401 && localStorage.getItem('refreshToken')) {
      console.log('API call unauthorized, attempting token refresh...')
      const refreshSuccess = await refreshToken()
      
      if (refreshSuccess) {
        // Retry the original request with new token
        const newToken = localStorage.getItem('token')
        const newHeaders = {
          ...headers,
          ...(newToken && { 'Authorization': `Bearer ${newToken}` }),
        }
        response = await fetch(url, { ...options, headers: newHeaders })
      }
    }

    return response
  }

  // Role utility functions
  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) || false
  }

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => user?.roles?.includes(role)) || false
  }

  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every(role => user?.roles?.includes(role)) || false
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
    apiCall,
    hasRole,
    hasAnyRole,
    hasAllRoles
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}