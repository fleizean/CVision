'use client'

import { useAuth } from '@/contexts/AuthContext'
import { ReactNode } from 'react'

interface RoleGuardProps {
  children: ReactNode
  requiredRole?: string
  requiredRoles?: string[]
  requireAll?: boolean
  fallback?: ReactNode
}

export function RoleGuard({ 
  children, 
  requiredRole, 
  requiredRoles, 
  requireAll = false, 
  fallback = null 
}: RoleGuardProps) {
  const { hasRole, hasAnyRole, hasAllRoles } = useAuth()

  let hasPermission = false

  if (requiredRole) {
    hasPermission = hasRole(requiredRole)
  } else if (requiredRoles) {
    hasPermission = requireAll 
      ? hasAllRoles(requiredRoles)
      : hasAnyRole(requiredRoles)
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>
}