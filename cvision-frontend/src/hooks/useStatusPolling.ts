'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface CVStatus {
  Id: string
  FileName: string
  AnalysisStatus: string
  HasAnalysis: boolean
  AnalysisScore?: number
  UpdatedAt: string
}

interface UseStatusPollingOptions {
  interval?: number // Polling interval in ms (default: 3000)
  maxAttempts?: number // Max attempts before stopping (default: 60)
  enabled?: boolean // Whether polling is enabled
}

export function useStatusPolling(
  cvId: string, 
  initialStatus: string = 'Pending',
  options: UseStatusPollingOptions = {}
) {
  const { 
    interval = 3000, 
    maxAttempts = 60, 
    enabled = true 
  } = options

  const [status, setStatus] = useState<string>(initialStatus)
  const [cvData, setCvData] = useState<CVStatus | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const { apiCall } = useAuth()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  const fetchStatus = async () => {
    if (!enabled || !cvId || attempts >= maxAttempts) {
      return
    }

    try {
      setError(null)
      const response = await apiCall(`http://localhost:5117/api/cvfiles/${cvId}`)
      const result = await response.json()

      if (result.StatusCode === 200 && result.Data && isMountedRef.current) {
        const cvData: CVStatus = result.Data
        setCvData(cvData)
        setStatus(cvData.AnalysisStatus)
        setAttempts(prev => prev + 1)

        // Stop polling if status is completed or failed
        if (cvData.AnalysisStatus === 'Completed' || cvData.AnalysisStatus === 'Failed') {
          stopPolling()
        }
      }
    } catch (err) {
      console.error('Status polling error:', err)
      setError('Failed to check CV status')
      setAttempts(prev => prev + 1)
    }
  }

  const startPolling = () => {
    if (!enabled || intervalRef.current) return
    
    setIsPolling(true)
    setAttempts(0)
    
    // Immediate first fetch
    fetchStatus()
    
    // Set up interval for subsequent fetches
    intervalRef.current = setInterval(() => {
      fetchStatus()
    }, interval)
  }

  const stopPolling = () => {
    setIsPolling(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const resetPolling = () => {
    stopPolling()
    setAttempts(0)
    setError(null)
    if (enabled) {
      startPolling()
    }
  }

  // Start polling when component mounts and conditions are met
  useEffect(() => {
    isMountedRef.current = true
    
    if (enabled && cvId && (status === 'Pending' || status === 'Processing')) {
      startPolling()
    }

    return () => {
      isMountedRef.current = false
      stopPolling()
    }
  }, [cvId, enabled, initialStatus])

  // Stop polling when max attempts reached
  useEffect(() => {
    if (attempts >= maxAttempts) {
      stopPolling()
    }
  }, [attempts, maxAttempts])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [])

  return {
    status,
    cvData,
    isPolling,
    attempts,
    maxAttempts,
    error,
    startPolling,
    stopPolling,
    resetPolling,
    isCompleted: status === 'Completed',
    isFailed: status === 'Failed',
    isPending: status === 'Pending',
    isProcessing: status === 'Processing',
  }
}