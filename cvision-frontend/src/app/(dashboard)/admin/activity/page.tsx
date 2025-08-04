'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Activity,
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  ArrowLeft,
  Filter,
  Calendar,
  Search
} from 'lucide-react'
import { Button } from '@/presentation/components/ui/Button'
import Link from 'next/link'
import { activityRepository, Activity as ActivityType } from '@/infrastructure/repositories/ActivityRepository'

export default function AdminActivityPage() {
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 50

  const { user } = useAuth()

  useEffect(() => {
    fetchActivities()
  }, [page])

  useEffect(() => {
    filterActivities()
  }, [activities, searchTerm, typeFilter])

  const fetchActivities = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await activityRepository.getActivities(page + 1, pageSize) // API uses 1-based pagination
      
      if (page === 0) {
        setActivities(result)
      } else {
        setActivities(prev => [...prev, ...result])
      }
      
      setHasMore(result.length === pageSize)
    } catch (err) {
      console.error('Error fetching activities:', err)
      setError('Failed to load activities')
    } finally {
      setIsLoading(false)
    }
  }

  const filterActivities = () => {
    let filtered = activities

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.Description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.UserName && activity.UserName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(activity => activity.Type === typeFilter)
    }

    setFilteredActivities(filtered)
  }

  const loadMore = () => {
    setPage(prev => prev + 1)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'UserRegistered':
        return <Users className="h-5 w-5 text-purple-500" />
      case 'UserLogin':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'UserLogout':
        return <XCircle className="h-5 w-5 text-gray-500" />
      case 'CVFileUploaded':
        return <FileText className="h-5 w-5 text-blue-500" />
      case 'CVAnalysisStarted':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'CVAnalysisCompleted':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'CVAnalysisFailed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'JobProfileCreated':
        return <Settings className="h-5 w-5 text-orange-500" />
      case 'JobProfileUpdated':
        return <Settings className="h-5 w-5 text-blue-500" />
      case 'JobProfileDeleted':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'CVMatchingPerformed':
        return <BarChart3 className="h-5 w-5 text-indigo-500" />
      case 'UserStatusChanged':
        return <Users className="h-5 w-5 text-amber-500" />
      case 'FileDeleted':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'SystemMaintenance':
        return <Settings className="h-5 w-5 text-gray-500" />
      case 'SecurityAlert':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'UserRegistered':
      case 'UserLogin':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'UserLogout':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      case 'CVFileUploaded':
      case 'CVAnalysisCompleted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'CVAnalysisStarted':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'CVAnalysisFailed':
      case 'FileDeleted':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'JobProfileCreated':
      case 'JobProfileUpdated':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'CVMatchingPerformed':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      case 'SecurityAlert':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const uniqueActivityTypes = [...new Set(activities.map(a => a.Type))]

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Error Loading Activities
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <Button onClick={() => {
              setPage(0)
              fetchActivities()
            }}>
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
          
          <div className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                System Activity Log
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor all system activities and user actions
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Activity Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Activity Types</option>
              {uniqueActivityTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {/* Results Count */}
            <div className="flex items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredActivities.length} activities
              </span>
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {isLoading && page === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading activities...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No activities found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || typeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No activities have been recorded yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-600">
              {filteredActivities.map((activity) => (
                <div key={activity.Id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.Type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.Description}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityTypeColor(activity.Type)}`}>
                          {activity.Type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        {activity.UserName && (
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{activity.UserName}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{activity.TimeAgo}</span>
                        </div>
                        {activity.IpAddress && (
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {activity.IpAddress}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && !isLoading && filteredActivities.length > 0 && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-600">
              <Button 
                onClick={loadMore} 
                variant="outline" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More Activities'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}