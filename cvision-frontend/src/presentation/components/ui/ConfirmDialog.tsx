'use client'

import { ReactNode } from 'react'
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'
import { Button } from './Button'

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string | ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'success' | 'info'
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  isLoading = false
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <XCircle className="h-12 w-12 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />
      case 'info':
        return <Info className="h-12 w-12 text-blue-500" />
      default:
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />
    }
  }

  const getButtonColor = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
      case 'success':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
      default:
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm()
    }
  }

  const handleCancel = () => {
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        <div className="p-6">
          {/* Icon and Title */}
          <div className="flex items-center justify-center mb-4">
            {getIcon()}
          </div>
          
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
            <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {typeof message === 'string' ? (
                <p>{message}</p>
              ) : (
                message
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {cancelText}
            </Button>
            
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`w-full sm:w-auto text-white ${getButtonColor()} ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Loading...
                </div>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}