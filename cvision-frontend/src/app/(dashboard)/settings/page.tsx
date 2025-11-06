'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/presentation/components/ui/Button'
import { 
    Bell, 
    Shield, 
    Lock, 
    Save, 
    X,
    AlertCircle,
    CheckCircle,
    Trash2,
    Eye,
    EyeOff,
    Download,
    ToggleLeft,
    ToggleRight
} from 'lucide-react'
import { userRepository } from '@/infrastructure/repositories/UserRepository'

interface UserSettings {
    emailNotifications: boolean
    newAnalysisAlerts: boolean
    marketingEmails: boolean
    dataSharing: boolean
    accountPrivacy: 'public' | 'private'
    downloadFormat: 'pdf' | 'docx' | 'json'
    autoDeleteOldAnalyses: boolean
}

const defaultSettings: UserSettings = {
    emailNotifications: true,
    newAnalysisAlerts: true,
    marketingEmails: false,
    dataSharing: false,
    accountPrivacy: 'private',
    downloadFormat: 'pdf',
    autoDeleteOldAnalyses: false
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<UserSettings>(defaultSettings)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [hasChanges, setHasChanges] = useState(false)
    
    const { apiCall } = useAuth()

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            setIsLoading(true)
            setError(null)
            
            // This would be replaced with an actual API call
            // const userSettings = await userRepository.getUserSettings()
            
            // For now, simulate an API call with setTimeout
            setTimeout(() => {
                setSettings(defaultSettings)
                setIsLoading(false)
            }, 1000)
        } catch (err) {
            console.error('Error fetching settings:', err)
            setError('Failed to load user settings')
            setIsLoading(false)
        }
    }

    const handleToggle = (field: keyof UserSettings) => {
        setSettings(prev => {
            const updated = { ...prev, [field]: !prev[field] }
            setHasChanges(true)
            return updated
        })
    }

    const handlePrivacyChange = (value: 'public' | 'private') => {
        setSettings(prev => {
            const updated = { ...prev, accountPrivacy: value }
            setHasChanges(true)
            return updated
        })
    }

    const handleDownloadFormatChange = (format: 'pdf' | 'docx' | 'json') => {
        setSettings(prev => {
            const updated = { ...prev, downloadFormat: format }
            setHasChanges(true)
            return updated
        })
    }

    const handleSaveSettings = async () => {
        try {
            setIsSaving(true)
            setError(null)
            setSuccessMessage(null)

            // This would be replaced with an actual API call
            // const result = await userRepository.updateUserSettings(settings)
            
            // Simulate API call with setTimeout
            setTimeout(() => {
                setSuccessMessage('Settings saved successfully!')
                setIsSaving(false)
                setHasChanges(false)
            }, 1500)
        } catch (err) {
            console.error('Error saving settings:', err)
            setError('Failed to save settings')
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        fetchSettings()
        setHasChanges(false)
        setError(null)
        setSuccessMessage(null)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading settings...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Settings
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your preferences and account settings for CVision
                    </p>
                </div>

                {/* Success/Error Messages */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            <p className="text-green-700 dark:text-green-400">{successMessage}</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                            <p className="text-red-700 dark:text-red-400">{error}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                    {/* Notification Settings */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center">
                                <Bell className="h-5 w-5 text-blue-500 mr-2" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Notification Settings
                                </h2>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                                        Email notifications
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Receive email notifications about your account activity
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleToggle('emailNotifications')}
                                    className="focus:outline-none"
                                >
                                    {settings.emailNotifications ? (
                                        <ToggleRight className="h-7 w-7 text-blue-500" />
                                    ) : (
                                        <ToggleLeft className="h-7 w-7 text-gray-400" />
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                                        New analysis alerts
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Get notified when your CV analysis is complete
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleToggle('newAnalysisAlerts')}
                                    className="focus:outline-none"
                                >
                                    {settings.newAnalysisAlerts ? (
                                        <ToggleRight className="h-7 w-7 text-blue-500" />
                                    ) : (
                                        <ToggleLeft className="h-7 w-7 text-gray-400" />
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                                        Marketing emails
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Receive emails about new features and promotions
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleToggle('marketingEmails')}
                                    className="focus:outline-none"
                                >
                                    {settings.marketingEmails ? (
                                        <ToggleRight className="h-7 w-7 text-blue-500" />
                                    ) : (
                                        <ToggleLeft className="h-7 w-7 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Privacy Settings */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center">
                                <Shield className="h-5 w-5 text-blue-500 mr-2" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Privacy & Data Settings
                                </h2>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                                    Account privacy
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => handlePrivacyChange('private')}
                                        className={`p-4 border rounded-lg flex items-center ${
                                            settings.accountPrivacy === 'private' 
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                                : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                    >
                                        <EyeOff className={`h-5 w-5 mr-2 ${
                                            settings.accountPrivacy === 'private'
                                                ? 'text-blue-500'
                                                : 'text-gray-400'
                                        }`} />
                                        <div className="text-left">
                                            <h4 className="font-medium text-gray-900 dark:text-white">Private</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Only you can see your CV analyses
                                            </p>
                                        </div>
                                    </button>

                                    <button 
                                        onClick={() => handlePrivacyChange('public')}
                                        className={`p-4 border rounded-lg flex items-center ${
                                            settings.accountPrivacy === 'public' 
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                                : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                    >
                                        <Eye className={`h-5 w-5 mr-2 ${
                                            settings.accountPrivacy === 'public'
                                                ? 'text-blue-500'
                                                : 'text-gray-400'
                                        }`} />
                                        <div className="text-left">
                                            <h4 className="font-medium text-gray-900 dark:text-white">Public</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Others can view your CV analyses if shared
                                            </p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                                        Data sharing
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Allow anonymous data to improve our CV analysis algorithms
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleToggle('dataSharing')}
                                    className="focus:outline-none"
                                >
                                    {settings.dataSharing ? (
                                        <ToggleRight className="h-7 w-7 text-blue-500" />
                                    ) : (
                                        <ToggleLeft className="h-7 w-7 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Application Settings */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center">
                                <Lock className="h-5 w-5 text-blue-500 mr-2" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Application Settings
                                </h2>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                                    Default download format
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <button 
                                        onClick={() => handleDownloadFormatChange('pdf')}
                                        className={`p-3 border rounded-lg flex items-center justify-center ${
                                            settings.downloadFormat === 'pdf' 
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                                : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                    >
                                        <Download className={`h-4 w-4 mr-1 ${
                                            settings.downloadFormat === 'pdf'
                                                ? 'text-blue-500'
                                                : 'text-gray-400'
                                        }`} />
                                        <span className={`${
                                            settings.downloadFormat === 'pdf'
                                                ? 'text-blue-700 dark:text-blue-400'
                                                : 'text-gray-700 dark:text-gray-400'
                                        }`}>PDF</span>
                                    </button>

                                    <button 
                                        onClick={() => handleDownloadFormatChange('docx')}
                                        className={`p-3 border rounded-lg flex items-center justify-center ${
                                            settings.downloadFormat === 'docx' 
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                                : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                    >
                                        <Download className={`h-4 w-4 mr-1 ${
                                            settings.downloadFormat === 'docx'
                                                ? 'text-blue-500'
                                                : 'text-gray-400'
                                        }`} />
                                        <span className={`${
                                            settings.downloadFormat === 'docx'
                                                ? 'text-blue-700 dark:text-blue-400'
                                                : 'text-gray-700 dark:text-gray-400'
                                        }`}>DOCX</span>
                                    </button>

                                    <button 
                                        onClick={() => handleDownloadFormatChange('json')}
                                        className={`p-3 border rounded-lg flex items-center justify-center ${
                                            settings.downloadFormat === 'json' 
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                                : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                    >
                                        <Download className={`h-4 w-4 mr-1 ${
                                            settings.downloadFormat === 'json'
                                                ? 'text-blue-500'
                                                : 'text-gray-400'
                                        }`} />
                                        <span className={`${
                                            settings.downloadFormat === 'json'
                                                ? 'text-blue-700 dark:text-blue-400'
                                                : 'text-gray-700 dark:text-gray-400'
                                        }`}>JSON</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                                        Auto-delete old analyses
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Automatically delete CV analyses older than 90 days
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleToggle('autoDeleteOldAnalyses')}
                                    className="focus:outline-none"
                                >
                                    {settings.autoDeleteOldAnalyses ? (
                                        <ToggleRight className="h-7 w-7 text-blue-500" />
                                    ) : (
                                        <ToggleLeft className="h-7 w-7 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-red-500">
                                Danger Zone
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                <h3 className="text-base font-medium text-red-600 dark:text-red-400">
                                    Delete Account
                                </h3>
                                <p className="text-sm text-red-600 dark:text-red-400 mt-1 mb-4">
                                    This action is irreversible. All your data will be permanently deleted.
                                </p>
                                <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    className="flex items-center"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Account
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save/Cancel Buttons */}
                {hasChanges && (
                    <div className="mt-8 flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSaving}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveSettings}
                            disabled={isSaving}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}