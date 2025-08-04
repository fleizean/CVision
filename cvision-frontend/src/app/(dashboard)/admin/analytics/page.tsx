'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/presentation/components/ui/Button'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  ArrowLeft,
  Users,
  FileText,
  Target,
  Calendar,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

interface AnalyticsData {
  overview: {
    totalUsers: number
    totalCVFiles: number
    totalAnalyses: number
    avgAnalysisScore: number
    userGrowthRate: number
    fileUploadRate: number
  }
  analysisStats: {
    completed: number
    pending: number
    failed: number
    avgProcessingTime: number
  }
  userActivity: {
    activeUsers: number
    newUsersThisMonth: number
    returningUsers: number
  }
  scoreDistribution: {
    excellent: number // 90-100
    good: number      // 75-89
    average: number   // 60-74
    poor: number      // 0-59
  }
  monthlyData: {
    month: string
    users: number
    uploads: number
    analyses: number
  }[]
  topKeywords: {
    keyword: string
    count: number
  }[]
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<string>('30days')
  const { apiCall } = useAuth()

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // TODO: Replace with actual API call
      // const response = await apiCall(`http://localhost:5117/api/admin/analytics?range=${timeRange}`)
      // const result = await response.json()
      
      // Mock data for now
      const mockAnalytics: AnalyticsData = {
        overview: {
          totalUsers: 1250,
          totalCVFiles: 5420,
          totalAnalyses: 4890,
          avgAnalysisScore: 73.5,
          userGrowthRate: 12.5,
          fileUploadRate: 8.3
        },
        analysisStats: {
          completed: 4350,
          pending: 285,
          failed: 255,
          avgProcessingTime: 145 // seconds
        },
        userActivity: {
          activeUsers: 892,
          newUsersThisMonth: 124,
          returningUsers: 768
        },
        scoreDistribution: {
          excellent: 15,
          good: 35,
          average: 35,
          poor: 15
        },
        monthlyData: [
          { month: 'Jan', users: 980, uploads: 420, analyses: 380 },
          { month: 'Feb', users: 1050, uploads: 520, analyses: 480 },
          { month: 'Mar', users: 1120, uploads: 680, analyses: 620 },
          { month: 'Apr', users: 1180, uploads: 750, analyses: 720 },
          { month: 'May', users: 1250, uploads: 820, analyses: 780 }
        ],
        topKeywords: [
          { keyword: 'JavaScript', count: 1240 },
          { keyword: 'React', count: 980 },
          { keyword: 'Python', count: 875 },
          { keyword: 'Node.js', count: 720 },
          { keyword: 'TypeScript', count: 650 },
          { keyword: 'AWS', count: 590 },
          { keyword: 'Docker', count: 520 },
          { keyword: 'MongoDB', count: 480 }
        ]
      }
      
      setAnalytics(mockAnalytics)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatProcessingTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getGrowthIcon = (rate: number) => {
    if (rate > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    } else if (rate < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />
    }
    return <Activity className="h-4 w-4 text-gray-500" />
  }

  const getGrowthColor = (rate: number) => {
    if (rate > 0) {
      return 'text-green-600 dark:text-green-400'
    } else if (rate < 0) {
      return 'text-red-600 dark:text-red-400'
    }
    return 'text-gray-600 dark:text-gray-400'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Error Loading Analytics
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'Failed to load analytics data'}
            </p>
            <Button onClick={fetchAnalytics}>
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
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  System performance and usage statistics
                </p>
              </div>
            </div>
            
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="1year">Last year</option>
            </select>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-blue-500" />
              <div className={`flex items-center space-x-1 ${getGrowthColor(analytics.overview.userGrowthRate)}`}>
                {getGrowthIcon(analytics.overview.userGrowthRate)}
                <span className="text-sm font-medium">
                  {analytics.overview.userGrowthRate > 0 ? '+' : ''}{analytics.overview.userGrowthRate}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.overview.totalUsers.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
            </div>
          </div>

          {/* Total CV Files */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-8 w-8 text-green-500" />
              <div className={`flex items-center space-x-1 ${getGrowthColor(analytics.overview.fileUploadRate)}`}>
                {getGrowthIcon(analytics.overview.fileUploadRate)}
                <span className="text-sm font-medium">
                  {analytics.overview.fileUploadRate > 0 ? '+' : ''}{analytics.overview.fileUploadRate}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.overview.totalCVFiles.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">CV Files</p>
            </div>
          </div>

          {/* Total Analyses */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-8 w-8 text-purple-500" />
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatProcessingTime(analytics.analysisStats.avgProcessingTime)} avg
                </span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.overview.totalAnalyses.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Analyses Completed</p>
            </div>
          </div>

          {/* Average Score */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full" 
                  style={{ width: `${analytics.overview.avgAnalysisScore}%` }}
                ></div>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.overview.avgAnalysisScore}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Analysis Status */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Analysis Status Distribution
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Completed */}
                <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">Completed</p>
                    <p className="text-xl font-bold text-green-700 dark:text-green-300">
                      {analytics.analysisStats.completed.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Pending */}
                <div className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending</p>
                    <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                      {analytics.analysisStats.pending.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Failed */}
                <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-sm text-red-600 dark:text-red-400">Failed</p>
                    <p className="text-xl font-bold text-red-700 dark:text-red-300">
                      {analytics.analysisStats.failed.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                User Activity
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active Users</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {analytics.userActivity.activeUsers.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">New This Month</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    +{analytics.userActivity.newUsersThisMonth.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Returning Users</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {analytics.userActivity.returningUsers.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Score Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Score Distribution
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Excellent (90-100%)</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${analytics.scoreDistribution.excellent}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                    {analytics.scoreDistribution.excellent}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Good (75-89%)</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${analytics.scoreDistribution.good}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                    {analytics.scoreDistribution.good}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Average (60-74%)</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${analytics.scoreDistribution.average}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                    {analytics.scoreDistribution.average}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Poor (0-59%)</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${analytics.scoreDistribution.poor}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                    {analytics.scoreDistribution.poor}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Keywords */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Most Common Keywords
            </h2>
            
            <div className="space-y-3">
              {analytics.topKeywords.map((item, index) => (
                <div key={item.keyword} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-4">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.keyword}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(item.count / analytics.topKeywords[0].count) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}