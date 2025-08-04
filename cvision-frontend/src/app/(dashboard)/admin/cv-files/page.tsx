'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/presentation/components/ui/Button'
import { 
  FileText, 
  Search, 
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  RefreshCw,
  Eye,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { cvFileRepository, CVFile } from '@/infrastructure/repositories/CVFileRepository'
import { ConfirmDialog } from '@/presentation/components/ui/ConfirmDialog'

export default function AdminCVFilesPage() {
  const [cvFiles, setCvFiles] = useState<CVFile[]>([])
  const [filteredFiles, setFilteredFiles] = useState<CVFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string | React.ReactNode
    onConfirm: () => void
    variant?: 'danger' | 'warning' | 'success' | 'info'
    confirmText?: string
    isLoading?: boolean
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} })
  const { apiCall } = useAuth()

  useEffect(() => {
    fetchCVFiles()
  }, [])

  useEffect(() => {
    filterFiles()
  }, [cvFiles, searchTerm, statusFilter, typeFilter])

  const fetchCVFiles = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await cvFileRepository.getAllFilesWithUserInfo()
      setCvFiles(result)
    } catch (err) {
      console.error('Error fetching CV files:', err)
      setError('Failed to load CV files')
    } finally {
      setIsLoading(false)
    }
  }

  const filterFiles = () => {
    let filtered = cvFiles

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(file => 
        file.FileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.ParsedText?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(file => 
        file.AnalysisStatus.toLowerCase() === statusFilter.toLowerCase()
      )
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(file => 
        file.FileType.toLowerCase() === typeFilter.toLowerCase()
      )
    }

    setFilteredFiles(filtered)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'Pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'Failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'Failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getFileTypeIcon = (fileType: string) => {
    const lowerType = fileType.toLowerCase()
    if (lowerType === 'pdf') {
      return <FileText className="h-5 w-5 text-red-500" />
    } else if (lowerType === 'docx' || lowerType === 'doc') {
      return <FileText className="h-5 w-5 text-blue-500" />
    }
    return <FileText className="h-5 w-5 text-gray-500" />
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

  const handleDeleteFile = (fileId: string, fileName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete CV File',
      message: (
        <div>
          <p>Are you sure you want to delete this CV file?</p>
          <p className="font-semibold mt-2 text-gray-900 dark:text-white">"{fileName}"</p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
            This action cannot be undone.
          </p>
        </div>
      ),
      variant: 'danger',
      confirmText: 'Delete File',
      onConfirm: () => confirmDeleteFile(fileId, fileName)
    })
  }

  const confirmDeleteFile = async (fileId: string, fileName: string) => {
    setConfirmDialog(prev => ({ ...prev, isLoading: true }))
    
    try {
      // TODO: Implement file deletion API call when available
      // await cvFileRepository.deleteFile(fileId)
      
      // For now, just simulate the deletion
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      // Remove from local state
      setCvFiles(prev => prev.filter(file => file.Id !== fileId))
      
      // Show success message
      setConfirmDialog({
        isOpen: true,
        title: 'File Deleted',
        message: `"${fileName}" has been successfully deleted.`,
        variant: 'success',
        confirmText: 'OK',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false }))
      })
    } catch (error) {
      console.error('Error deleting file:', error)
      setConfirmDialog({
        isOpen: true,
        title: 'Delete Failed',
        message: 'Failed to delete the file. Please try again.',
        variant: 'danger',
        confirmText: 'OK',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false }))
      })
    }
  }

  const handleViewFile = (file: CVFile) => {
    // TODO: Navigate to CV analysis results page or open file viewer
    // For now, show file details
    setConfirmDialog({
      isOpen: true,
      title: 'CV File Details',
      message: (
        <div className="text-left space-y-2">
          <div><strong>File Name:</strong> {file.FileName}</div>
          <div><strong>File Type:</strong> {file.FileType.replace('.', '').toUpperCase()}</div>
          <div><strong>Status:</strong> {file.AnalysisStatus}</div>
          <div><strong>Upload Date:</strong> {formatDate(file.UploadedAt)}</div>
          <div><strong>User:</strong> {file.UserFullName || 'Unknown User'}</div>
          <div><strong>Email:</strong> {file.UserEmail || 'No email'}</div>
          {file.AnalysisScore && (
            <div><strong>Analysis Score:</strong> {file.AnalysisScore}%</div>
          )}
        </div>
      ),
      variant: 'info',
      confirmText: 'Close',
      onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false }))
    })
  }

  const handleRetryAnalysis = (fileId: string, fileName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Retry Analysis',
      message: (
        <div>
          <p>Do you want to retry the analysis for this CV file?</p>
          <p className="font-semibold mt-2 text-gray-900 dark:text-white">"{fileName}"</p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
            This will restart the CV analysis process.
          </p>
        </div>
      ),
      variant: 'info',
      confirmText: 'Retry Analysis',
      onConfirm: () => confirmRetryAnalysis(fileId, fileName)
    })
  }

  const confirmRetryAnalysis = async (fileId: string, fileName: string) => {
    setConfirmDialog(prev => ({ ...prev, isLoading: true }))
    
    try {
      // TODO: Implement retry analysis API call when available
      // await cvFileRepository.retryAnalysis(fileId)
      
      // For now, simulate the retry and update status to Pending
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      // Update local state to show Pending status
      setCvFiles(prev => prev.map(file => 
        file.Id === fileId 
          ? { ...file, AnalysisStatus: 'Pending' as const }
          : file
      ))
      
      // Show success message
      setConfirmDialog({
        isOpen: true,
        title: 'Analysis Restarted',
        message: `Analysis for "${fileName}" has been restarted and is now pending.`,
        variant: 'success',
        confirmText: 'OK',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false }))
      })
    } catch (error) {
      console.error('Error retrying analysis:', error)
      setConfirmDialog({
        isOpen: true,
        title: 'Retry Failed',
        message: 'Failed to restart the analysis. Please try again.',
        variant: 'danger',
        confirmText: 'OK',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false }))
      })
    }
  }

  const uniqueFileTypes = [...new Set(cvFiles.map(f => f.FileType))]
  const statusStats = {
    completed: cvFiles.filter(f => f.AnalysisStatus === 'Completed').length,
    pending: cvFiles.filter(f => f.AnalysisStatus === 'Pending').length,
    failed: cvFiles.filter(f => f.AnalysisStatus === 'Failed').length
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading CV files...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Error Loading CV Files
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <Button onClick={fetchCVFiles}>
              Try Again
            </Button>
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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  CV Files Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Monitor and manage uploaded CV files and their analysis status
                </p>
              </div>
            </div>
            <Button onClick={fetchCVFiles} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Files</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {cvFiles.length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {statusStats.completed}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {statusStats.pending}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {statusStats.failed}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
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
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            {/* File Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {uniqueFileTypes.map((type) => (
                <option key={type} value={type}>
                  {type.toUpperCase()}
                </option>
              ))}
            </select>

            {/* Results Count */}
            <div className="flex items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filteredFiles.length} of {cvFiles.length} files
              </span>
            </div>
          </div>
        </div>

        {/* Files Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No CV files found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No CV files have been uploaded yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredFiles.map((file) => (
                    <tr key={file.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {/* File Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-4">
                            {getFileTypeIcon(file.FileType)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {file.FileName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {file.Id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* User Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {file.UserFullName || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {file.UserEmail || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(file.AnalysisStatus)}`}>
                          {getStatusIcon(file.AnalysisStatus)}
                          <span className="ml-1">{file.AnalysisStatus}</span>
                        </span>
                      </td>

                      {/* File Type */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          {file.FileType.replace('.', '').toUpperCase()}
                        </span>
                      </td>

                      {/* Analysis Score */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {file.AnalysisScore !== null ? (
                          <div className="flex items-center">
                            <span className="font-medium">{file.AnalysisScore}%</span>
                            <div className="ml-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${file.AnalysisScore}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* Upload Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(file.UploadedAt)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewFile(file)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {file.AnalysisStatus === 'Failed' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRetryAnalysis(file.Id, file.FileName)}
                              title="Retry Analysis"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteFile(file.Id, file.FileName)}
                            title="Delete File"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          variant={confirmDialog.variant}
          confirmText={confirmDialog.confirmText}
          isLoading={confirmDialog.isLoading}
        />
      </div>
    </div>
  )
}