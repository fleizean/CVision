'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateJobProfileDto } from '@/core/domain/entities/JobProfile';
import { JobProfileRepository } from '@/infrastructure/repositories/JobProfileRepository';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import Link from 'next/link';
import { ArrowLeft, Plus, HelpCircle, Tag, Briefcase, X } from 'lucide-react';

const jobProfileRepository = new JobProfileRepository();

export default function CreateJobProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateJobProfileDto>({
    title: '',
    suggestedKeywords: [],
  });
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setLoading(true);
      setError(null);
      
      const response = await jobProfileRepository.create(formData);
      
      if (response.StatusCode === 201) {
        router.push('/job-profiles');
      } else {
        setError(response.Message || 'Error creating job profile');
      }
    } catch (err) {
      setError('Error creating job profile');
      console.error('Error creating job profile:', err);
    } finally {
      setLoading(false);
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
                Create Job Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Define a new job profile and add relevant keywords for CV matching
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6">
          {/* Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Field */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Briefcase className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  Job Profile Title <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Frontend Developer, Data Scientist, Product Manager"
                  className="w-full"
                  required
                />
              </div>

              {/* Keywords Section */}
              <div className="space-y-4">
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Tag className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  Keywords <span className="text-red-500 ml-1">*</span>
                </label>
                
                {/* Add keyword input */}
                                <div className="flex gap-2 w-full">
                  <div className="flex-grow">
                    <Input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyPress={handleKeywordKeyPress}
                      placeholder="Add keyword (e.g., React, JavaScript, Project Management)"
                      className="w-full"
                    />
                  </div>
                  <Button 
                    type="button" 
                    onClick={addKeyword} 
                    variant="outline"
                    className="flex items-center whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                {/* Keywords list */}
                {formData.suggestedKeywords.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Added Keywords ({formData.suggestedKeywords.length})
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.suggestedKeywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm px-3 py-1.5 rounded-full"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeKeyword(index)}
                            className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 rounded-full"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1"
                >
                  {loading ? 'Creating...' : 'Create Job Profile'}
                </Button>
                <Link href="/job-profiles" className="sm:w-auto w-full">
                  <Button variant="outline" type="button" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-5">
            <div className="flex items-center mb-3">
              <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h3 className="font-medium text-blue-900 dark:text-blue-200">
                Tips for Creating Effective Job Profiles
              </h3>
            </div>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2 pl-7 list-disc">
              <li>Keywords will be matched against skills in candidate CVs</li>
              <li>Include technical skills, programming languages, and frameworks</li>
              <li>Keywords are case-insensitive for matching</li>
              <li>Avoid using punctuation marks like commas and periods</li>
              <li>Be specific but comprehensive with your keywords</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}