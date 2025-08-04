'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { JobProfile } from '@/core/domain/entities/JobProfile';
import { JobProfileRepository } from '@/infrastructure/repositories/JobProfileRepository';
import { Button } from '@/presentation/components/ui/Button';
import Link from 'next/link';
import { ArrowLeft, Tag, HelpCircle, FileEdit, FileText, Trash2 } from 'lucide-react';

const jobProfileRepository = new JobProfileRepository();

export default function JobProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [jobProfile, setJobProfile] = useState<JobProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadJobProfile();
    }
  }, [params.id]);

  const loadJobProfile = async () => {
    try {
      setLoading(true);
      const response = await jobProfileRepository.getAll();
      console.log('Job profiles loaded:', response);
      
      // Convert HttpStatusCode (which might come as 200, OK, or some other format) to a number
      const statusCode = response.StatusCode;
      console.log('Status code:', statusCode);
      if (statusCode === 200) {
        // Use data field from the response, ensure it's an array
        setJobProfile(response.Data?.find(profile => profile.id === params.id) || null);
      } else {
        setError(response.Message || 'Error loading job profiles');
      }
    } catch (err) {
      setError('Error loading job profiles');
      console.error('Error loading job profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job profile?')) {
      return;
    }

    try {
      const response = await jobProfileRepository.delete(params.id as string);
      if (response.statusCode === 200) {
        router.push('/job-profiles');
      } else {
        setError(response.message || 'Failed to delete');
      }
    } catch (err) {
      setError('Error occurred during deletion');
      console.error('Error deleting job profile:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/job-profiles">
              <Button variant="outline" size="sm" className="h-10 w-10 p-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Error
              </h1>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!jobProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/job-profiles">
              <Button variant="outline" size="sm" className="h-10 w-10 p-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Job profile not found
              </h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/job-profiles">
              <Button variant="outline" size="sm" className="h-10 w-10 p-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {jobProfile.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Job profile details
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/job-profiles/${jobProfile.id}/edit`}>
              <Button variant="outline">
                <FileEdit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Job Profile Title
                  </label>
                  <p className="text-gray-900 dark:text-white">{jobProfile.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Creation Date
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(jobProfile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Keywords */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-4">
                <Tag className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Keywords ({jobProfile.suggestedKeywords.length})
                </h2>
              </div>
              
              {jobProfile.suggestedKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {jobProfile.suggestedKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No keywords added yet
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Number of Keywords
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {jobProfile.suggestedKeywords.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Created
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(jobProfile.createdAt).toLocaleDateString('en-US')}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Actions
              </h3>
                            <div className="space-y-3">
                {/* Link Button - Make this visually distinct */}
                <Link href={`/job-profiles/${jobProfile.id}/edit`} className="block w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <FileEdit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
                
                {/* Regular Action Button */}
                <Button
                  variant="secondary"
                  className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={() => {
                    // Redirect to CV matching page could be implemented here
                    console.log('CV matching feature not yet implemented');
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  CV Matching
                </Button>
                
                {/* Danger Button */}
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-800 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Profile
                </Button>
              </div>
            </div>

            {/* Help */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-5">
              <div className="flex items-center mb-3">
                <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                <h4 className="font-medium text-blue-900 dark:text-blue-200">
                  Tips
                </h4>
              </div>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2 pl-7 list-disc">
                <li>Use the analysis page to match CVs with this profile</li>
                <li>Keep keywords updated to improve matching quality</li>
                <li>Create new profiles for similar positions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}