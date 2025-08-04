'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileUploadForm } from '@/presentation/components/forms/FileUploadForm'
import { useAuth } from '@/contexts/AuthContext'
import { CheckCircle, ArrowRight, Clock, FileText, RefreshCw, AlertCircle, Eye } from 'lucide-react'
import { Button } from '@/presentation/components/ui/Button'
import { useStatusPolling } from '@/hooks/useStatusPolling'

interface UploadResponse {
  FileId: string
  FileName: string
  FileType: string
  AnalysisStatus: string
  UploadedAt: string
  AnalysisScore?: number
}

export default function CVUploadPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<UploadResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { refreshToken } = useAuth()
  const router = useRouter()

  // Real-time status polling
  const {
    status,
    cvData,
    isPolling,
    isCompleted,
    isFailed,
    isPending,
    isProcessing,
    error: pollingError,
    resetPolling
  } = useStatusPolling(
    uploadedFile?.FileId || '',
    uploadedFile?.AnalysisStatus || 'Pending',
    {
      enabled: !!uploadedFile,
      interval: 3000, // Poll every 3 seconds
      maxAttempts: 60 // Stop after 3 minutes
    }
  )

  const handleFileUpload = async (file: File, description?: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (description) {
        formData.append('description', description)
      }
      

      // Use a custom FormData upload function with token refresh support
      const uploadWithRefresh = async (): Promise<Response> => {
        const token = localStorage.getItem('token')
        let response = await fetch('http://localhost:5117/api/cvfiles/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })

        // If unauthorized and we have a refresh token, try to refresh
        if (response.status === 401 && localStorage.getItem('refreshToken')) {
          console.log('Upload unauthorized, attempting token refresh...')
          const refreshSuccess = await refreshToken()
          
          if (refreshSuccess) {
            // Retry with new token
            const newToken = localStorage.getItem('token')
            response = await fetch('http://localhost:5117/api/cvfiles/upload', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${newToken}`
              },
              body: formData
            })
          }
        }

        return response
      }

      const response = await uploadWithRefresh()
      const result = await response.json()

      if (result.StatusCode === 201 && result.Data) {
        setUploadedFile(result.Data)
        return true
      } else {
        setError(result.Message || 'Upload failed')
        return false
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('An error occurred while uploading the file')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewFiles = () => {
    router.push('/cv-analysis/history')
  }

  const handleAnalyzeAnother = () => {
    setUploadedFile(null)
    setError(null)
  }

  const handleViewResults = () => {
    if (uploadedFile?.FileId) {
      router.push(`/cv-analysis/results/${uploadedFile.FileId}`)
    }
  }

  // Get current status (use polling status if available, otherwise use uploaded file status)
  const currentStatus = status || uploadedFile?.AnalysisStatus || 'Pending'
  const currentCvData = cvData || uploadedFile

  // Status styling helper
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Completed':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          text: 'Analysis Completed',
          bgColor: 'bg-green-50 dark:bg-green-950/20',
          textColor: 'text-green-700 dark:text-green-300',
          borderColor: 'border-green-200 dark:border-green-800'
        }
      case 'Processing':
        return {
          icon: <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />,
          text: 'Processing CV...',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          textColor: 'text-blue-700 dark:text-blue-300',
          borderColor: 'border-blue-200 dark:border-blue-800'
        }
      case 'Failed':
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          text: 'Analysis Failed',
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          textColor: 'text-red-700 dark:text-red-300',
          borderColor: 'border-red-200 dark:border-red-800'
        }
      default: // Pending
        return {
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          text: 'Waiting for Analysis',
          bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
          textColor: 'text-yellow-700 dark:text-yellow-300',
          borderColor: 'border-yellow-200 dark:border-yellow-800'
        }
    }
  }

  const statusDisplay = getStatusDisplay(currentStatus)

  if (uploadedFile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            {/* Dynamic Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                {currentStatus === 'Completed' ? (
                  <CheckCircle className="h-16 w-16 text-green-500" />
                ) : currentStatus === 'Failed' ? (
                  <AlertCircle className="h-16 w-16 text-red-500" />
                ) : currentStatus === 'Processing' ? (
                  <RefreshCw className="h-16 w-16 text-blue-500 animate-spin" />
                ) : (
                  <Clock className="h-16 w-16 text-yellow-500" />
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {currentStatus === 'Completed' ? 'Analysis Complete!' : 
                 currentStatus === 'Failed' ? 'Analysis Failed' : 
                 currentStatus === 'Processing' ? 'Processing Your CV...' : 
                 'Upload Successful!'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {currentStatus === 'Completed' ? 'Your CV analysis is ready to view' : 
                 currentStatus === 'Failed' ? 'There was an issue analyzing your CV' : 
                 currentStatus === 'Processing' ? 'Please wait while we analyze your CV' : 
                 'Your CV has been uploaded and is being processed'}
                {isPolling && currentStatus !== 'Completed' && currentStatus !== 'Failed' && (
                  <span className="ml-2 text-sm">
                    (Auto-refreshing...)
                  </span>
                )}
              </p>
            </div>

            {/* File Details */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
              <div className="flex items-start space-x-4">
                <FileText className="h-8 w-8 text-blue-500 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {uploadedFile.FileName}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>File Type: {uploadedFile.FileType?.toUpperCase() || 'Unknown'}</p>
                    <p>Uploaded: {new Date(uploadedFile.UploadedAt).toLocaleString()}</p>
                    
                    {/* Dynamic Status Display */}
                    <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full border ${statusDisplay.bgColor} ${statusDisplay.borderColor}`}>
                      {statusDisplay.icon}
                      <span className={`font-medium ${statusDisplay.textColor}`}>
                        {statusDisplay.text}
                      </span>
                    </div>

                    {/* Analysis Score (if completed) */}
                    {currentStatus === 'Completed' && currentCvData?.AnalysisScore && (
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-gray-600 dark:text-gray-400">Analysis Score:</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {currentCvData.AnalysisScore}/100
                        </span>
                      </div>
                    )}

                    {/* Polling Status */}
                    {pollingError && (
                      <div className="text-red-500 text-xs mt-1">
                        {pollingError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                What's Next?
              </h3>
              <div className="space-y-3 text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Your CV is being analyzed for keywords and structure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Analysis results will be available shortly</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>You'll receive recommendations for improvement</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* View Results Button (only if completed) */}
              {currentStatus === 'Completed' && (
                <Button
                  onClick={handleViewResults}
                  className="flex-1"
                  size="lg"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  <span className="whitespace-nowrap text-sm">Analysis Results</span>
                </Button>
              )}
              
              {/* View History Button */}
              <Button
                onClick={handleViewFiles}
                variant={currentStatus === 'Completed' ? 'outline' : 'primary'}
                className="flex-1"
                size="lg"
              >
                <ArrowRight className="h-4 w-4 mr-1" />
                <span className="whitespace-nowrap text-sm">Analysis History</span>
              </Button>
              
              {/* Upload Another Button */}
              <Button
                onClick={handleAnalyzeAnother}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <FileText className="h-4 w-4 mr-1" />
                <span className="whitespace-nowrap text-sm">Upload Another</span>
              </Button>

              {/* Retry Button (only if failed) */}
              {currentStatus === 'Failed' && (
                <Button
                  onClick={resetPolling}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  <span className="whitespace-nowrap text-sm">Retry</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Upload Your CV
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Upload your CV to get detailed analysis, keyword matching, and improvement suggestions
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <FileUploadForm
            onFileUpload={handleFileUpload}
            isLoading={isLoading}
            acceptedTypes={['.pdf', '.doc', '.docx']}
            maxSizeInMB={10}
          />

          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 font-medium">Error</p>
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="ml-3 font-semibold text-gray-900 dark:text-white">
                Smart Analysis
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Advanced parsing technology extracts and analyzes your CV content for comprehensive insights.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="ml-3 font-semibold text-gray-900 dark:text-white">
                Keyword Matching
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Compare your CV against job requirements and identify missing keywords and skills.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <ArrowRight className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="ml-3 font-semibold text-gray-900 dark:text-white">
                Recommendations
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Get personalized suggestions to improve your CV and increase your chances of getting hired.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}