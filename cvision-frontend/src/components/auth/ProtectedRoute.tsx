'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { LoadingScreen, LoadingStep } from '@/components/ui/LoadingScreen'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: string
  requiredRoles?: string[]
  requireAll?: boolean
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredRoles, 
  requireAll = false,
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasRole, hasAnyRole, hasAllRoles } = useAuth()
  const router = useRouter()
  
  // Control our own loading state
  const [localLoading, setLocalLoading] = useState(true)
  
  // Define loading steps for authentication verification
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>([
    { id: 'verify-auth', message: 'Verifying authentication status', status: 'pending' },
    { id: 'check-session', message: 'Checking session validity', status: 'pending' },
    { id: 'validate-permissions', message: 'Validating permissions', status: 'pending' }
  ])

  // Manually trigger loading sequence when component mounts
  useEffect(() => {
    // Always run through our loading sequence
    setLocalLoading(true)
    
    // Start authentication verification immediately
    setLoadingSteps(steps => 
      steps.map(step => 
        step.id === 'verify-auth' ? { ...step, status: 'loading' } : step
      )
    )
    
    // First step: Auth verification
    setTimeout(() => {
      setLoadingSteps(steps => 
        steps.map(step => 
          step.id === 'verify-auth' ? { ...step, status: isAuthenticated ? 'completed' : 'error' } : step
        )
      )
      
      if (!isAuthenticated) {
        // If not authenticated, mark other steps as not needed
        setLoadingSteps(steps => 
          steps.map(step => 
            step.id !== 'verify-auth' ? { ...step, status: 'pending' } : step
          )
        )
        setTimeout(() => setLocalLoading(false), 1000)
        return
      }
      
      // Second step: Session check
      setLoadingSteps(steps => 
        steps.map(step => 
          step.id === 'check-session' ? { ...step, status: 'loading' } : step
        )
      )
      
      setTimeout(() => {
        // We're using isAuthenticated as a proxy for session validity
        setLoadingSteps(steps => 
          steps.map(step => 
            step.id === 'check-session' ? { ...step, status: 'completed' } : step
          )
        )
        
        // Third step: Permissions check
        if (requiredRole || requiredRoles) {
          setLoadingSteps(steps => 
            steps.map(step => 
              step.id === 'validate-permissions' ? { ...step, status: 'loading' } : step
            )
          )
          
          setTimeout(() => {
            let hasPermission = true
            
            if (requiredRole) {
              hasPermission = hasRole(requiredRole)
            } else if (requiredRoles) {
              hasPermission = requireAll 
                ? hasAllRoles(requiredRoles)
                : hasAnyRole(requiredRoles)
            }
            
            setLoadingSteps(steps => 
              steps.map(step => 
                step.id === 'validate-permissions' 
                  ? { ...step, status: hasPermission ? 'completed' : 'error' }
                  : step
              )
            )
            
            // Complete the loading sequence
            setTimeout(() => setLocalLoading(false), 1000)
          }, 800)
        } else {
          // No permission checks needed
          setLoadingSteps(steps => 
            steps.map(step => 
              step.id === 'validate-permissions' ? { ...step, status: 'completed' } : step
            )
          )
          
          // Complete the loading sequence
          setTimeout(() => setLocalLoading(false), 1000)
        }
      }, 800)
    }, 800)
  }, [isAuthenticated, isLoading, requiredRole, requiredRoles, hasRole, hasAllRoles, hasAnyRole])

  // Handle redirect logic separately from loading animation
  useEffect(() => {
    if (!isLoading && !localLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo)
        return
      }

      if (isAuthenticated) {
        let hasPermission = true

        if (requiredRole) {
          hasPermission = hasRole(requiredRole)
        } else if (requiredRoles) {
          hasPermission = requireAll 
            ? hasAllRoles(requiredRoles)
            : hasAnyRole(requiredRoles)
        }

        if (!hasPermission) {
          router.push('/unauthorized')
        }
      }
    }
  }, [isAuthenticated, isLoading, localLoading, requiredRole, requiredRoles, requireAll, redirectTo, router, hasRole, hasAnyRole, hasAllRoles])

  if (isLoading || localLoading) {
    return (
      <LoadingScreen 
        message={`Verifying access${user ? ` for ${user.name || user.email}` : ''}...`}
        loadingSteps={loadingSteps}
        minDisplayTime={0}
      />
    )
  }

  if (!isAuthenticated) {
    return null
  }

  let hasPermission = true

  if (requiredRole) {
    hasPermission = hasRole(requiredRole)
  } else if (requiredRoles) {
    hasPermission = requireAll 
      ? hasAllRoles(requiredRoles)
      : hasAnyRole(requiredRoles)
  }

  return hasPermission ? <>{children}</> : null
}