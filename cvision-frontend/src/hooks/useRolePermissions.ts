import { useAuth } from '@/contexts/AuthContext'

export function useRolePermissions() {
  const { user, hasRole, hasAnyRole, hasAllRoles } = useAuth()

  const isAdmin = () => hasRole('Admin')
  const isUser = () => hasRole('User')
  const isModerator = () => hasRole('Moderator')
  
  const canManageUsers = () => hasAnyRole(['Admin', 'Moderator'])
  const canViewReports = () => hasAnyRole(['Admin', 'Moderator', 'Analyst'])
  const canEditContent = () => hasAnyRole(['Admin', 'Moderator', 'Editor'])
  
  const hasMultipleRoles = () => (user?.roles?.length || 0) > 1
  const getAllRoles = () => user?.roles || []
  const getPrimaryRole = () => user?.roles?.[0] || null

  return {
    // Role checks
    hasRole,
    hasAnyRole,
    hasAllRoles,
    
    // Specific role checks
    isAdmin,
    isUser,
    isModerator,
    
    // Permission checks
    canManageUsers,
    canViewReports,
    canEditContent,
    
    // Utility functions
    hasMultipleRoles,
    getAllRoles,
    getPrimaryRole,
    
    // Raw user data
    user
  }
}