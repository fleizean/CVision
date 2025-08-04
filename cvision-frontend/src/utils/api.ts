class ApiClient {
  private baseURL = 'http://localhost:5117/api'
  private refreshPromise: Promise<boolean> | null = null

  private async refreshToken(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this.performRefresh()
    const result = await this.refreshPromise
    this.refreshPromise = null
    return result
  }

  private async performRefresh(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) return false

      const response = await fetch(`${this.baseURL}/auths/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      })

      const data = await response.json()

      if (data.StatusCode === 200 && data.Data?.AccessToken) {
        localStorage.setItem('token', data.Data.AccessToken)
        localStorage.setItem('refreshToken', data.Data.RefreshToken)
        return true
      }

      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      return false
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token')
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    }

    let response = await fetch(`${this.baseURL}${endpoint}`, config)

    // If unauthorized and we have a refresh token, try to refresh
    if (response.status === 401 && localStorage.getItem('refreshToken')) {
      const refreshSuccess = await this.refreshToken()
      
      if (refreshSuccess) {
        // Retry the original request with new token
        const newToken = localStorage.getItem('token')
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${newToken}`,
        }
        response = await fetch(`${this.baseURL}${endpoint}`, config)
      } else {
        // Refresh failed, redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        throw new Error('Authentication failed')
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()