'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/presentation/components/ui/Button'
import { FileText, Calendar, Clock, CheckCircle, AlertCircle, Trash2, Eye, Upload, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface CVFile {
  Id: string
  FileName: string
  FileType: string
  AnalysisStatus: string
  UploadedAt: string
  HasAnalysis: boolean
  AnalysisScore?: number
}

export default function CVAnalysisHistoryPage() {
  const [files, setFiles] = useState<CVFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false)
  const [recentlyCompleted, setRecentlyCompleted] = useState<Set<string>>(new Set())
  const { apiCall } = useAuth()
  const router = useRouter()
  
  // Auto-refresh logic
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    fetchFiles()
    
    // Start auto-refresh if there are pending/processing files
    return () => {
      isMountedRef.current = false
      stopAutoRefresh()
    }
  }, [])

  // Check if there are any files that need monitoring
  const hasPendingFiles = files.some(file => 
    file.AnalysisStatus === 'Pending' || file.AnalysisStatus === 'Processing'
  )

  // Start/stop auto-refresh based on pending files
  useEffect(() => {
    if (hasPendingFiles && !intervalRef.current) {
      startAutoRefresh()
    } else if (!hasPendingFiles && intervalRef.current) {
      stopAutoRefresh()
    }
  }, [hasPendingFiles])

  const startAutoRefresh = () => {
    if (intervalRef.current) return
    
    setIsAutoRefreshing(true)
    intervalRef.current = setInterval(() => {
      fetchFiles(true) // Silent refresh
    }, 5000) // Refresh every 5 seconds
  }

  const stopAutoRefresh = () => {
    setIsAutoRefreshing(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const fetchFiles = async (silent: boolean = false) => {
    try {
      if (!silent) {
        setIsLoading(true)
        setError(null)
      }
      
      const response = await apiCall('http://localhost:5117/api/cvfiles/my-files')
      const result = await response.json()

      if (result.StatusCode === 200 && result.Data && isMountedRef.current) {
        // Store previous files for comparison
        const previousFiles = files
        const newFiles = result.Data

        // Check for status changes to show notifications or animations
        if (silent && previousFiles.length > 0) {
          newFiles.forEach((newFile: CVFile) => {
            const oldFile = previousFiles.find(f => f.Id === newFile.Id)
            if (oldFile && oldFile.AnalysisStatus !== newFile.AnalysisStatus) {
              console.log(`CV ${newFile.FileName} status changed: ${oldFile.AnalysisStatus} → ${newFile.AnalysisStatus}`)
              
              // Show a brief visual feedback for status change
              if (newFile.AnalysisStatus === 'Completed') {
                console.log(`✅ Analysis completed for ${newFile.FileName}`)
                // Add to recently completed set for animation
                setRecentlyCompleted(prev => new Set([...prev, newFile.Id]))
                // Remove from recently completed after animation duration
                setTimeout(() => {
                  setRecentlyCompleted(prev => {
                    const newSet = new Set(prev)
                    newSet.delete(newFile.Id)
                    return newSet
                  })
                }, 2000)
              }
            }
          })
        }

        setFiles(newFiles)
      } else {
        if (!silent) {
          setError(result.Message || 'Failed to fetch files')
        }
      }
    } catch (err) {
      console.error('Fetch files error:', err)
      if (!silent) {
        setError('An error occurred while fetching files')
      }
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this CV?')) return

    try {
      const response = await apiCall(`http://localhost:5117/api/cvfiles/${fileId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.StatusCode === 200) {
        setFiles(files.filter(f => f.Id !== fileId))
      } else {
        alert(result.Message || 'Failed to delete file')
      }
    } catch (err) {
      console.error('Delete file error:', err)
      alert('An error occurred while deleting the file')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your CV files...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              CV Analysis History
            </h1>
            <div className="flex items-center space-x-2">
              <p className="text-gray-600 dark:text-gray-400">
                View and manage your uploaded CV files and their analysis results
              </p>
              {isAutoRefreshing && (
                <div className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>Auto-updating...</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => fetchFiles()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/cv-analysis/upload">
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload New CV
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {files.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No CV files uploaded yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get started by uploading your first CV for analysis
            </p>
            <Link href="/cv-analysis/upload">
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First CV
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {files.map((file) => (
              <div
                key={file.Id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 ${
                  (file.HasAnalysis || file.AnalysisStatus.toLowerCase() === 'completed') 
                    ? 'cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600' 
                    : ''
                } ${
                  recentlyCompleted.has(file.Id) 
                    ? 'animate-pulse border-green-400 dark:border-green-500 shadow-lg shadow-green-100 dark:shadow-green-900/20' 
                    : ''
                }`}
                onClick={() => {
                  if (file.HasAnalysis || file.AnalysisStatus.toLowerCase() === 'completed') {
                    router.push(`/cv-analysis/results/${file.Id}`)
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <FileText className="h-8 w-8 text-blue-500 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {file.FileName}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(file.AnalysisStatus)}`}>
                          {file.AnalysisStatus}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(file.UploadedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(file.AnalysisStatus)}
                          <span>File Type: {file.FileType?.toUpperCase() || 'Unknown'}</span>
                        </div>
                        {file.HasAnalysis && file.AnalysisScore && (
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">Score: {file.AnalysisScore}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {(file.HasAnalysis || file.AnalysisStatus.toLowerCase() === 'completed') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/cv-analysis/results/${file.Id}`)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Analysis
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteFile(file.Id)
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {file.AnalysisStatus.toLowerCase() === 'pending' && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      Your CV is being analyzed. This usually takes a few minutes.
                    </p>
                  </div>
                )}

                {file.AnalysisStatus.toLowerCase() === 'completed' && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
                    <p className="text-sm text-green-600 dark:text-green-400">
                      ✅ Analysis completed successfully! Click anywhere on this card or the "View Analysis" button to see detailed results.
                      {recentlyCompleted.has(file.Id) && (
                        <span className="ml-2 font-semibold animate-bounce">🎉 Just completed!</span>
                      )}
                    </p>
                  </div>
                )}

                {file.AnalysisStatus.toLowerCase() === 'failed' && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Analysis failed. Please try uploading the file again or contact support.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}