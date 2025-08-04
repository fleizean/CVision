'use client';

import { useState, useEffect } from 'react';
import { JobProfile } from '@/core/domain/entities/JobProfile';
import { JobProfileRepository } from '@/infrastructure/repositories/JobProfileRepository';
import { Button } from '@/presentation/components/ui/Button';
import Link from 'next/link';
import { Plus, Search, RefreshCw, FileText, Briefcase, FileEdit, Trash2 } from 'lucide-react';

const jobProfileRepository = new JobProfileRepository();

export default function JobProfilesPage() {
  const [jobProfiles, setJobProfiles] = useState<JobProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadJobProfiles();
  }, []);

  const loadJobProfiles = async () => {
    try {
      setLoading(true);
      const response = await jobProfileRepository.getAll();
      
      if (response.StatusCode === 200) {
        setJobProfiles(Array.isArray(response.Data) ? response.Data : []);
      } else {
        setError(response.Message || 'Error loading job profiles');
      }
    } catch (err) {
      setError('Error loading job profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job profile?')) {
      return;
    }

    try {
      const response = await jobProfileRepository.delete(id);
      if (response.statusCode === 200) {
        setJobProfiles(prev => prev.filter(profile => profile.id !== id));
      } else {
        setError(response.message || 'Delete operation failed');
      }
    } catch (err) {
      setError('Error during deletion');
      console.error('Error deleting job profile:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadJobProfiles();
      return;
    }

    try {
      setLoading(true);
      const response = await jobProfileRepository.getByTitle(searchTerm);
      if (response.StatusCode === 200) {
        setJobProfiles(response.Data || []);
      } else {
        setError(response.Message || 'Search operation failed');
      }
    } catch (err) {
      setError('Error during search');
      console.error('Error searching job profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = jobProfiles.filter(profile => {
    return profile && profile.title && profile.title.toLowerCase().includes((searchTerm || '').toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-[calc(100vh-200px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Job Profiles
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Create, manage, and use job profiles for CV analysis
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search job profiles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="flex items-center">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button onClick={loadJobProfiles} variant="outline" className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Link href="/job-profiles/create">
                <Button className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  New Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Job Profiles Grid */}
        {filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                      <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {profile.title}
                    </h3>
                  </div>
                </div>

                <div className="mb-4 pl-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Keywords ({profile.suggestedKeywords.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {profile.suggestedKeywords.slice(0, 5).map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                    {profile.suggestedKeywords.length > 5 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{profile.suggestedKeywords.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 pl-2">
                  Created: {new Date(profile.createdAt).toLocaleDateString('en-US')}
                </div>

                <div className="flex gap-2 mt-4">
                  <Link href={`/job-profiles/${profile.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </Link>
                  <Link href={`/job-profiles/${profile.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <FileEdit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(profile.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No profiles matching your search criteria' : 'No job profiles added yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? 'Try searching with different keywords or view all profiles.' 
                : 'Add job profiles to analyze your CVs against these profiles.'}
            </p>
            {!searchTerm ? (
              <Link href="/job-profiles/create">
                <Button className="flex items-center mx-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Job Profile
                </Button>
              </Link>
            ) : (
              <Button onClick={loadJobProfiles} variant="outline" className="mx-auto">
                <RefreshCw className="h-4 w-4 mr-2" />
                Show All Profiles
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}