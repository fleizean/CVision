'use client'

import { useRolePermissions } from '@/hooks/useRolePermissions'

interface RoleBadgeProps {
  className?: string
  showAllRoles?: boolean
}

export function RoleBadge({ className = '', showAllRoles = false }: RoleBadgeProps) {
  const { getAllRoles, getPrimaryRole } = useRolePermissions()

  const roles = getAllRoles()
  
  if (roles.length === 0) {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 ${className}`}>
        No Role
      </span>
    )
  }

  if (!showAllRoles) {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ${className}`}>
        {getPrimaryRole()}
        {roles.length > 1 && (
          <span className="ml-1 px-1 bg-blue-200 dark:bg-blue-800 rounded text-[10px]">
            +{roles.length - 1}
          </span>
        )}
      </span>
    )
  }

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {roles.map((role, index) => (
        <span 
          key={role} 
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            index === 0 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}
        >
          {role}
        </span>
      ))}
    </div>
  )
}