'use client'

import { useState, useRef } from 'react'
import { Button } from '@/presentation/components/ui/Button'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'

interface FileUploadFormProps {
  onFileUpload: (file: File, description?: string) => Promise<boolean>
  isLoading?: boolean
  acceptedTypes?: string[]
  maxSizeInMB?: number
}

export function FileUploadForm({ 
  onFileUpload, 
  isLoading = false, 
  acceptedTypes = ['.pdf', '.doc', '.docx'],
  maxSizeInMB = 10
}: FileUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizeInMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeInMB}MB`
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedTypes.includes(fileExtension || '')) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`
    }

    return null
  }

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setSelectedFile(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    const success = await onFileUpload(selectedFile, description)
    if (success) {
      setSelectedFile(null)
      setDescription('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
            : error
            ? 'border-red-300 bg-red-50 dark:bg-red-950/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />

        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <File className="h-8 w-8 text-blue-500" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  disabled={isLoading}
                  className="z-20 relative" // Add this to raise the button above the input
                >
                  <X className="h-4 w-4" />
                </Button>

              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              {error ? (
                <AlertCircle className="h-12 w-12 text-red-500" />
              ) : (
                <Upload className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {error ? 'Upload Error' : 'Upload your CV'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {error ? error : `Drag and drop your CV here, or click to browse`}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Supported formats: {acceptedTypes.join(', ')} (Max {maxSizeInMB}MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Description Input */}
      {selectedFile && (
        <div className="mt-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description for this CV..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
            rows={3}
            disabled={isLoading}
          />
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && (
        <div className="mt-6">
          <Button
            onClick={handleUpload}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </div>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload CV
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}