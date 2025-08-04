'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { JobProfile, UpdateJobProfileDto } from '@/core/domain/entities/JobProfile';
import { JobProfileRepository } from '@/infrastructure/repositories/JobProfileRepository';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import Link from 'next/link';
import { ArrowLeft, Tag, HelpCircle } from 'lucide-react';

const jobProfileRepository = new JobProfileRepository();

export default function EditJobProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [jobProfile, setJobProfile] = useState<JobProfile | null>(null);
  const [formData, setFormData] = useState<UpdateJobProfileDto>({
    id: '',
    title: '',
    suggestedKeywords: [],
  });
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadJobProfile();
    }
  }, [params.id]);

  const loadJobProfile = async () => {
    try {
      setLoading(true);
      const response = await jobProfileRepository.getById(params.id as string);
      if (response.StatusCode === 200 && response.Data) {
        setJobProfile(response.Data);
        setFormData({
          id: response.Data.id,
          title: response.Data.title,
          suggestedKeywords: [...response.Data.suggestedKeywords],
        });
      } else {
        setError(response.Message || 'Error loading job profile');
      }
    } catch (err) {
      setError('Error loading job profile');
      console.error('Error loading job profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Job profile title is required');
      return;
    }

    if (formData.suggestedKeywords.length === 0) {
      setError('You must add at least one keyword');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const response = await jobProfileRepository.update(formData);
      
      if (response.StatusCode === 200) {
        router.push(`/job-profiles/${formData.id}`);
      } else {
        setError(response.Message || 'Error updating job profile');
      }
    } catch (err) {
      setError('Error updating job profile');
      console.error('Error updating job profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = () => {
    const keyword = newKeyword.trim();
    if (keyword && !formData.suggestedKeywords.includes(keyword)) {
      setFormData(prev => ({
        ...prev,
        suggestedKeywords: [...prev.suggestedKeywords, keyword]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      suggestedKeywords: prev.suggestedKeywords.filter((_, i) => i !== index)
    }));
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
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
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/job-profiles/${jobProfile.id}`}>
            <Button variant="outline" size="sm" className="h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Edit Job Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Edit "{jobProfile.title}" profile
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Profile Title *
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g.: Frontend Developer, Backend Developer"
                required
              />
            </div>

            {/* Keywords */}
            <div>
              <div className="flex items-center mb-2">
                <Tag className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Keywords *
                </label>
              </div>
              <div className="space-y-4">
                {/* Add keyword input */}
                <div className="flex gap-2 w-full">
                  <div className="flex-1 w-full">
                    <Input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyPress={handleKeywordKeyPress}
                      placeholder="Add keyword (e.g.: React, JavaScript, Node.js)"
                      className="w-full" 
                    />
                  </div>
                  <Button type="button" onClick={addKeyword} variant="outline" className="flex-shrink-0">
                    Add
                  </Button>
                </div>

                {/* Keywords list */}
                {formData.suggestedKeywords.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Added Keywords ({formData.suggestedKeywords.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.suggestedKeywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm px-3 py-1 rounded-full"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeKeyword(index)}
                            className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Original Data Display */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Original Data
              </h3>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <p><strong>Title:</strong> {jobProfile.title}</p>
                <p><strong>Number of Keywords:</strong> {jobProfile.suggestedKeywords.length}</p>
                <p><strong>Created:</strong> {new Date(jobProfile.createdAt).toLocaleDateString('en-US')}</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Link href={`/job-profiles/${jobProfile.id}`}>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>

        {/* Changes Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
            <h3 className="font-medium text-blue-900 dark:text-blue-200">
              Changes Summary
            </h3>
          </div>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 pl-7 list-disc">
            {formData.title !== jobProfile.title && (
              <li>Title: "{jobProfile.title}" → "{formData.title}"</li>
            )}
            {formData.suggestedKeywords.length !== jobProfile.suggestedKeywords.length && (
              <li>Keywords count: {jobProfile.suggestedKeywords.length} → {formData.suggestedKeywords.length}</li>
            )}
            {formData.title === jobProfile.title && formData.suggestedKeywords.length === jobProfile.suggestedKeywords.length && (
              <li>No changes made yet</li>
            )}
          </ul>
        </div>

        {/* Help Section */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <HelpCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <h3 className="font-medium text-green-900 dark:text-green-200">
              Tips
            </h3>
          </div>
          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1 pl-7 list-disc">
            <li>Keywords will be matched with skills in CVs</li>
            <li>Existing CV matches will be updated with new keywords</li>
            <li>Keywords are not case-sensitive</li>
            <li>Avoid using special characters</li>
          </ul>
        </div>
      </div>
    </div>
  );
}