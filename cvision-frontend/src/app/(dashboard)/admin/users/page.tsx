'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/presentation/components/ui/Button'
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  UserCheck, 
  UserX, 
  Mail, 
  Calendar,
  ArrowLeft,
  Shield,
  User,
  Edit,
  Trash2,
  Key,
  UserPlus,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { userRepository, SystemUser } from '@/infrastructure/repositories/UserRepository'
import { roleRepository, Role } from '@/infrastructure/repositories/RoleRepository'

// Remove the local SystemUser interface since we're importing it from the repository

export default function AdminUsersPage() {
  const [users, setUsers] = useState<SystemUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<SystemUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const { apiCall } = useAuth()

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await userRepository.getUsers(0, 100) // Fetch first 100 users
      setUsers(result.users)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const rolesResult = await roleRepository.getRoles()
      setRoles(rolesResult)
    } catch (err) {
      console.error('Error fetching roles:', err)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.Surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.UserName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => 
        user.Roles.some(role => role.toLowerCase() === roleFilter.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.IsActive : !user.IsActive
      )
    }

    setFilteredUsers(filtered)
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const result = await userRepository.toggleUserStatus(userId)
      
      if (result.success && result.isActive !== undefined) {
        // Update local state
        setUsers(users.map(user => 
          user.Id === userId ? { ...user, IsActive: result.isActive ?? false } : user
        ))
      } else {
        console.error('Failed to toggle user status')
      }
    } catch (err) {
      console.error('Error toggling user status:', err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleEditUser = (user: SystemUser) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedUser(null)
  }

  const handleSaveUser = async (updatedUser: { name: string, surname: string, email: string }) => {
    if (!selectedUser) return

    try {
      // For now, we'll just update the name, surname, and email
      // Role management can be added later with proper role selection
      const result = await userRepository.updateUser(selectedUser.Id, {
        Name: updatedUser.name,
        Surname: updatedUser.surname,
        Email: updatedUser.email,
        RoleId: '00000000-0000-0000-0000-000000000000' // Placeholder - would need role management
      })

      if (result.success) {
        // Update local state
        setUsers(users.map(user => 
          user.Id === selectedUser.Id 
            ? { ...user, Name: updatedUser.name, Surname: updatedUser.surname, Email: updatedUser.email }
            : user
        ))
        handleCloseEditModal()
        
        // Refresh the filtered users as well
        fetchUsers()
      } else {
        console.error('Failed to update user:', result.message)
        alert('Failed to update user: ' + result.message)
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error updating user. Please try again.')
    }
  }

  const handleResetPassword = async (user: SystemUser) => {
    if (!confirm(`Are you sure you want to reset password for ${user.Name} ${user.Surname}?`)) {
      return
    }

    try {
      const result = await userRepository.resetUserPassword(user.Id)
      if (result.success) {
        alert(`Password reset successfully! Temporary password: ${result.temporaryPassword}`)
      } else {
        alert('Failed to reset password: ' + result.message)
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Error resetting password. Please try again.')
    }
  }

  const handleSendResetEmail = async (user: SystemUser) => {
    try {
      const result = await userRepository.sendPasswordResetEmail(user.Id)
      if (result.success) {
        alert(`Password reset email sent to ${user.Email}`)
      } else {
        alert('Failed to send password reset email: ' + result.message)
      }
    } catch (error) {
      console.error('Error sending password reset email:', error)
      alert('Error sending password reset email. Please try again.')
    }
  }

  const handleCreateUser = async (userData: { name: string, surname: string, email: string, password: string }) => {
    try {
      const result = await userRepository.createUser({
        Name: userData.name,
        Surname: userData.surname,
        Email: userData.email,
        Password: userData.password
      })

      if (result.success) {
        alert('User created successfully!')
        setIsCreateModalOpen(false)
        fetchUsers() // Refresh the user list
      } else {
        alert('Failed to create user: ' + result.message)
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Error creating user. Please try again.')
    }
  }

  const handleRoleManagement = (user: SystemUser) => {
    setSelectedUser(user)
    setIsRoleModalOpen(true)
  }

  const handleAssignRole = async (userId: string, roleName: string) => {
    try {
      const result = await roleRepository.assignRoleToUser({ UserId: userId, RoleName: roleName })
      if (result.success) {
        alert('Role assigned successfully!')
        fetchUsers() // Refresh to show updated roles
      } else {
        alert('Failed to assign role: ' + result.message)
      }
    } catch (error) {
      console.error('Error assigning role:', error)
      alert('Error assigning role. Please try again.')
    }
  }

  const handleRemoveRole = async (userId: string, roleName: string) => {
    try {
      const result = await roleRepository.removeRoleFromUser({ UserId: userId, RoleName: roleName })
      if (result.success) {
        alert('Role removed successfully!')
        fetchUsers() // Refresh to show updated roles
      } else {
        alert('Failed to remove role: ' + result.message)
      }
    } catch (error) {
      console.error('Error removing role:', error)
      alert('Error removing role. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading users...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                User Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage system users and their permissions
              </p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">User Management Actions</h2>
            <Button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filteredUsers.length} of {users.length} users
              </span>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    CV Files
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredUsers.map((user) => (
                  <tr key={user.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {/* User Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.Name} {user.Surname}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.Email}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            @{user.UserName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {user.Roles.map((role, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              role === 'Admin'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}
                          >
                            {role === 'Admin' && <Shield className="h-3 w-3 mr-1" />}
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.IsActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {user.IsActive ? (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <UserX className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>

                    {/* CV Files Count */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.CvFilesCount}
                    </td>

                    {/* Last Login */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.LastLogin ? formatDate(user.LastLogin) : 'Never'}
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.CreatedAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleUserStatus(user.Id, user.IsActive)}
                          title={user.IsActive ? 'Deactivate User' : 'Activate User'}
                        >
                          {user.IsActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleEditUser(user)}
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleResetPassword(user)}
                          title="Reset Password"
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleSendResetEmail(user)}
                          title="Send Password Reset Email"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleRoleManagement(user)}
                          title="Manage Roles"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No users found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No users have been registered yet'}
              </p>
            </div>
          )}
        </div>

        {/* Edit User Modal */}
        {isEditModalOpen && selectedUser && (
          <EditUserModal 
            user={selectedUser}
            onClose={handleCloseEditModal}
            onSave={handleSaveUser}
          />
        )}

        {/* Create User Modal */}
        {isCreateModalOpen && (
          <CreateUserModal 
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreateUser}
          />
        )}

        {/* Role Management Modal */}
        {isRoleModalOpen && selectedUser && (
          <RoleManagementModal 
            user={selectedUser}
            roles={roles}
            onClose={() => {
              setIsRoleModalOpen(false)
              setSelectedUser(null)
            }}
            onAssignRole={handleAssignRole}
            onRemoveRole={handleRemoveRole}
          />
        )}
      </div>
    </div>
  )
}

// Modal Components
interface EditUserModalProps {
  user: SystemUser
  onClose: () => void
  onSave: (user: { name: string, surname: string, email: string }) => void
}

interface CreateUserModalProps {
  onClose: () => void
  onSave: (user: { name: string, surname: string, email: string, password: string }) => void
}

interface RoleManagementModalProps {
  user: SystemUser
  roles: Role[]
  onClose: () => void
  onAssignRole: (userId: string, roleName: string) => void
  onRemoveRole: (userId: string, roleName: string) => void
}

function EditUserModal({ user, onClose, onSave }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    name: user.Name,
    surname: user.Surname,
    email: user.Email
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Edit User
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Surname
              </label>
              <input
                type="text"
                value={formData.surname}
                onChange={(e) => handleChange('surname', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function CreateUserModal({ onClose, onSave }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Create New User
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Surname
              </label>
              <input
                type="text"
                value={formData.surname}
                onChange={(e) => handleChange('surname', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                minLength={6}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Create User
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function RoleManagementModal({ user, roles, onClose, onAssignRole, onRemoveRole }: RoleManagementModalProps) {
  const [selectedRole, setSelectedRole] = useState('')

  const availableRoles = roles.filter(role => !user.Roles.includes(role.Name))

  const handleAssignRole = () => {
    if (selectedRole) {
      onAssignRole(user.Id, selectedRole)
      setSelectedRole('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Manage Roles for {user.Name} {user.Surname}
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          {/* Current Roles */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Roles
            </h4>
            <div className="space-y-2">
              {user.Roles.length > 0 ? (
                user.Roles.map((role, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <span className="text-sm text-gray-900 dark:text-white">{role}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRemoveRole(user.Id, role)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No roles assigned</p>
              )}
            </div>
          </div>

          {/* Assign New Role */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assign New Role
            </h4>
            <div className="flex space-x-2">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a role</option>
                {availableRoles.map((role) => (
                  <option key={role.Id} value={role.Name}>
                    {role.Name}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleAssignRole}
                disabled={!selectedRole}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Assign
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}