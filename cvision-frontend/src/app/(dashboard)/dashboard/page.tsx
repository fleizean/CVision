'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Upload,
  Eye,
  Calendar,
  Users,
  Target,
  Award,
  BarChart3,
  Activity
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/Button'
import Link from 'next/link'

interface DashboardStats {
  totalCVs: number
  completedAnalyses: number
  pendingAnalyses: number
  averageScore: number | null
  recentActivity: ActivityItem[]
  weeklyStats: WeeklyStats[]
}

interface ActivityItem {
  id: string
  fileName: string
  action: string
  timestamp: string
  status: string
  score?: number
}

interface WeeklyStats {
  date: string
  uploads: number
  analyses: number
}

export default function DashboardPage() {
  const { user, apiCall } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch user's CV files
      const filesResponse = await apiCall('http://localhost:5117/api/cvfiles/my-files')
      const filesResult = await filesResponse.json()

      if (filesResult.StatusCode === 200 && filesResult.Data) {
        const files = filesResult.Data
        
        // Calculate statistics
        const totalCVs = files.length
        const completedAnalyses = files.filter((f: any) => f.AnalysisStatus === 'Completed').length
        const pendingAnalyses = files.filter((f: any) => f.AnalysisStatus === 'Pending' || f.AnalysisStatus === 'Processing').length
        
        // Calculate average score
        const completedWithScores = files.filter((f: any) => f.AnalysisStatus === 'Completed' && f.AnalysisScore && f.AnalysisScore > 0)
        const averageScore = completedWithScores.length > 0 
          ? Math.round(completedWithScores.reduce((sum: number, f: any) => sum + f.AnalysisScore, 0) / completedWithScores.length)
          : null

        // Create recent activity
        const recentActivity: ActivityItem[] = files
          .sort((a: any, b: any) => new Date(b.UploadedAt).getTime() - new Date(a.UploadedAt).getTime())
          .slice(0, 5)
          .map((file: any) => ({
            id: file.Id,
            fileName: file.FileName,
            action: 'uploaded',
            timestamp: file.UploadedAt,
            status: file.AnalysisStatus,
            score: file.AnalysisScore
          }))

        // Create weekly stats (mock data for now)
        const weeklyStats: WeeklyStats[] = generateWeeklyStats(files)

        setStats({
          totalCVs,
          completedAnalyses,
          pendingAnalyses,
          averageScore,
          recentActivity,
          weeklyStats
        })
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err)
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const generateWeeklyStats = (files: any[]): WeeklyStats[] => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date
    }).reverse()

    return last7Days.map(date => {
      const dayFiles = files.filter(file => {
        const fileDate = new Date(file.UploadedAt)
        return fileDate.toDateString() === date.toDateString()
      })
      
      return {
        date: date.toISOString().split('T')[0],
        uploads: dayFiles.length,
        analyses: dayFiles.filter(f => f.AnalysisStatus === 'Completed').length
      }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 dark:text-green-400'
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'processing':
        return 'text-blue-600 dark:text-blue-400'
      case 'failed':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'processing':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name ? `${user.name} ${user.surname}` : user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's an overview of your CV analysis journey
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Link href="/cv-analysis/upload">
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload New CV
            </Button>
          </Link>
          <Link href="/cv-analysis/history">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View History
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total CVs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total CVs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCVs}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            {/* Completed Analyses */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedAnalyses}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            {/* Pending Analyses */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingAnalyses}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            {/* Average Score */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Score</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.averageScore !== null ? `${stats.averageScore}%` : '--'}
                    </p>
                    {stats.averageScore === null && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">No scores yet</p>
                    )}
                  </div>
                  {stats.averageScore !== null && (
                    <div className="mt-1">
                      <div className={`text-xs font-medium ${
                        stats.averageScore >= 80 ? 'text-green-600 dark:text-green-400' :
                        stats.averageScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {stats.averageScore >= 80 ? 'Excellent' :
                         stats.averageScore >= 60 ? 'Good' :
                         'Needs Improvement'}
                      </div>
                    </div>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  stats.averageScore !== null 
                    ? stats.averageScore >= 80 
                      ? 'bg-green-100 dark:bg-green-900/20' 
                      : stats.averageScore >= 60 
                        ? 'bg-yellow-100 dark:bg-yellow-900/20'
                        : 'bg-red-100 dark:bg-red-900/20'
                    : 'bg-gray-100 dark:bg-gray-900/20'
                }`}>
                  <Target className={`h-6 w-6 ${
                    stats.averageScore !== null 
                      ? stats.averageScore >= 80 
                        ? 'text-green-600 dark:text-green-400' 
                        : stats.averageScore >= 60 
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`} />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                <Activity className="h-5 w-5 text-gray-400" />
              </div>
              
              {stats.recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No activity yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Upload your first CV to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex-shrink-0">
                        {getStatusIcon(activity.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {activity.fileName}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className={`text-xs ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </p>
                          {activity.score && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              • Score: {activity.score}%
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <p className="text-xs text-gray-400">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weekly Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Overview</h3>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                {stats.weeklyStats.map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-900 dark:text-white">
                        {day.uploads} uploads
                      </span>
                      <span className="text-green-600 dark:text-green-400">
                        {day.analyses} completed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {stats.weeklyStats.every(day => day.uploads === 0) && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No activity this week</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Ready to improve your CV?</h3>
                <p className="text-blue-100">
                  Upload a new CV and get instant feedback with our AI-powered analysis
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-3">
                <Link href="/cv-analysis/upload">
                  <Button variant="outline" className="bg-white text-blue-600 hover:bg-gray-50 border-white dark:border-gray-700 dark:bg-gray-800 dark:text-blue-400">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload CV
                  </Button>
                </Link>
                <Link href="/cv-analysis/history">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    View All Results
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}