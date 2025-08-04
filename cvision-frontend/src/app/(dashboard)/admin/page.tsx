'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Shield, 
  Activity,
  TrendingUp,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/Button'
import Link from 'next/link'
import { activityRepository, Activity as ActivityType } from '@/infrastructure/repositories/ActivityRepository'
import { userRepository } from '@/infrastructure/repositories/UserRepository'
import { jobProfileRepository } from '@/infrastructure/repositories/JobProfileRepository'
import { cvFileRepository } from '@/infrastructure/repositories/CVFileRepository'

interface DashboardStats {
  totalUsers: number
  totalCVFiles: number
  completedAnalyses: number
  pendingAnalyses: number
  failedAnalyses: number
  totalJobProfiles: number
  avgAnalysisScore: number
  recentActivity: ActivityType[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, apiCall } = useAuth()

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true)
      
      // Fetch data from multiple APIs in parallel
      const [usersResult, recentActivity, jobProfilesResult, cvFileStats] = await Promise.all([
        userRepository.getUsers(0, 1000), // Get all users to count
        activityRepository.getRecentActivities(6),
        jobProfileRepository.getJobProfiles(0, 1000), // Get all job profiles to count
        cvFileRepository.getCVFileStats() // Get real CV file statistics by status
      ])

      // Calculate average score from completed files (mock for now - would need actual analysis data)
      const avgAnalysisScore = 73.5; // This could be calculated from actual analysis results if available
      
      setStats({
        totalUsers: usersResult.users.length,
        totalCVFiles: cvFileStats.totalFiles,
        completedAnalyses: cvFileStats.completedFiles,
        pendingAnalyses: cvFileStats.pendingFiles,
        failedAnalyses: cvFileStats.failedFiles,
        totalJobProfiles: jobProfilesResult.jobProfiles.length,
        avgAnalysisScore: avgAnalysisScore,
        recentActivity: recentActivity
      })
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      setError('Failed to load dashboard statistics')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Error Loading Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'Failed to load dashboard statistics'}
            </p>
            <Button onClick={fetchDashboardStats}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'UserRegistered':
        return <Users className="h-4 w-4 text-purple-500" />
      case 'UserLogin':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'UserLogout':
        return <XCircle className="h-4 w-4 text-gray-500" />
      case 'CVFileUploaded':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'CVAnalysisStarted':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'CVAnalysisCompleted':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'CVAnalysisFailed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'JobProfileCreated':
        return <Settings className="h-4 w-4 text-orange-500" />
      case 'JobProfileUpdated':
        return <Settings className="h-4 w-4 text-blue-500" />
      case 'JobProfileDeleted':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'CVMatchingPerformed':
        return <BarChart3 className="h-4 w-4 text-indigo-500" />
      case 'UserStatusChanged':
        return <Users className="h-4 w-4 text-amber-500" />
      case 'FileDeleted':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'SystemMaintenance':
        return <Settings className="h-4 w-4 text-gray-500" />
      case 'SecurityAlert':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                System overview and management
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Link href="/admin/users">
              <Button variant="outline" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Manage Users</span>
              </Button>
            </Link>
            <Link href="/admin/cv-files">
              <Button variant="outline" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>CV Files</span>
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="outline" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>System Settings</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalUsers.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          {/* Total CV Files */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">CV Files</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalCVFiles.toLocaleString()}
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </div>

          {/* Job Profiles */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Job Profiles</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalJobProfiles.toLocaleString()}
                </p>
              </div>
              <Database className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          {/* Average Score */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Analysis Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.avgAnalysisScore}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Analysis Status */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Analysis Overview
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Completed */}
                <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">Completed</p>
                    <p className="text-xl font-bold text-green-700 dark:text-green-300">
                      {stats.completedAnalyses.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Pending */}
                <div className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending</p>
                    <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                      {stats.pendingAnalyses.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Failed */}
                <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-sm text-red-600 dark:text-red-400">Failed</p>
                    <p className="text-xl font-bold text-red-700 dark:text-red-300">
                      {stats.failedAnalyses.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Recent Activity
              </h2>
              
              <div className="space-y-4">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.Id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.Type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {activity.Description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {activity.UserName && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            by {activity.UserName}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {activity.TimeAgo}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Link href="/admin/activity">
                  <Button variant="outline" className="w-full">
                    View All Activity
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}