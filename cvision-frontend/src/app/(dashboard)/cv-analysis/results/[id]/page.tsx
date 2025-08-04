'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/presentation/components/ui/Button'
import { ArrowLeft, FileText, Target, TrendingUp, AlertCircle, Briefcase, BarChart3 } from 'lucide-react'
import { CVMatchingRepository } from '@/infrastructure/repositories/CVMatchingRepository'
import { CVAllJobsMatch, JobProfileMatch } from '@/core/domain/entities/CVMatching'
import { JobProfileRepository } from '@/infrastructure/repositories/JobProfileRepository'
import { JobProfile } from '@/core/domain/entities/JobProfile'
import Link from 'next/link'

interface AnalysisResult {
  FileId: string
  FileName: string
  AnalysisScore: number
  AnalysisStatus: string
  Keywords: string[]
  Recommendations: string[]
  UploadedAt: string
}

const cvMatchingRepository = new CVMatchingRepository()
const jobProfileRepository = new JobProfileRepository()

export default function CVAnalysisResultsPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [jobMatches, setJobMatches] = useState<CVAllJobsMatch | null>(null)
  const [jobProfiles, setJobProfiles] = useState<JobProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMatchingLoading, setIsMatchingLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [matchingError, setMatchingError] = useState<string | null>(null)
  const { apiCall } = useAuth()
  const { id } = useParams()
  const router = useRouter()

  useEffect(() => {
    if (id) {
      fetchAnalysisResults()
      loadJobProfiles()
    }
  }, [id])

  const loadJobProfiles = async () => {
    try {
      const response = await jobProfileRepository.getAll()
      if (response.StatusCode === 200 && response.Data) {
        setJobProfiles(response.Data)
      }
    } catch (err) {
      console.error('Error loading job profiles:', err)
    }
  }

  const performJobMatching = async () => {
    if (!id) return

    try {
      setIsMatchingLoading(true)
      setMatchingError(null)
      
      const response = await cvMatchingRepository.matchCVWithAllJobs(id as string)
      
      if (response.StatusCode === 200) {
        setJobMatches(response.Data)
      } else {
        setMatchingError(response.Message || 'İş eşleştirmesi başarısız oldu')
      }
    } catch (err) {
      setMatchingError('İş eşleştirmesi sırasında hata oluştu')
      console.error('Error matching CV with jobs:', err)
    } finally {
      setIsMatchingLoading(false)
    }
  }

  const fetchAnalysisResults = async () => {
    try {
      const response = await apiCall(`http://localhost:5117/api/cvfiles/${id}/with-analysis`)
      const result = await response.json()

      if (result.StatusCode === 200 && result.Data) {
        // For now, we'll create mock analysis data since the analysis engine isn't implemented yet
        setAnalysis({
          FileId: result.Data.Id,
          FileName: result.Data.FileName,
          AnalysisScore: result.Data.AnalysisScore || 0,
          AnalysisStatus: result.Data.AnalysisStatus,
          Keywords: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Next.js'], // Mock data
          Recommendations: [
            'Add more technical skills to your CV',
            'Include specific project achievements',
            'Quantify your impact with metrics'
          ], // Mock data
          UploadedAt: result.Data.UploadedAt
        })
      } else {
        setError(result.Message || 'Failed to fetch analysis results')
      }
    } catch (err) {
      console.error('Fetch analysis error:', err)
      setError('An error occurred while fetching analysis results')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analysis results...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Analysis Not Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'Analysis results are not available for this CV.'}
            </p>
            <Link href="/cv-analysis/history">
              <Button variant="outline" size="sm" className="h-10 w-10 p-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
                       <div className="mb-8 relative flex items-center justify-center">
                  {/* Back button positioned absolutely on the left */}
                  <div className="absolute left-0">
                    <Link href="/cv-analysis/history">
                      <Button variant="outline" size="sm" className="h-10 w-10 p-0">
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Centered content */}
                  <div className="flex flex-col items-center text-center">
                    <FileText className="h-8 w-8 text-blue-500 mb-2" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      Analysis Results
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      {analysis.FileName}
                    </p>
                  </div>
                </div>
        {/* Analysis Status Banner */}
        {analysis.AnalysisStatus.toLowerCase() === 'pending' && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-600 dark:text-yellow-400">
              🔄 Analysis is still in progress. Results will be available once the analysis is complete.
            </p>
          </div>
        )}

        {analysis.AnalysisStatus.toLowerCase() === 'failed' && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">
              ❌ Analysis failed. Please try re-uploading your CV or contact support.
            </p>
          </div>
        )}

        {/* Analysis Results */}
        {analysis.AnalysisStatus.toLowerCase() === 'completed' && (
          <div className="space-y-6">
            {/* Score Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Overall Score
                </h2>
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {analysis.AnalysisScore}%
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  CV Analysis Score
                </p>
              </div>
            </div>

            {/* Keywords */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Target className="h-6 w-6 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Identified Keywords
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.Keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Recommendations for Improvement
              </h2>
              <div className="space-y-3">
                {analysis.Recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Job Matching Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-6 w-6 text-purple-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    İş Profili Eşleştirmeleri
                  </h2>
                </div>
                <Button 
                  onClick={performJobMatching}
                  disabled={isMatchingLoading || jobProfiles.length === 0}
                  variant="outline"
                >
                  {isMatchingLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500 mr-2"></div>
                      Eşleştiriliyor...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Eşleştirmeleri Analiz Et
                    </>
                  )}
                </Button>
              </div>

              {/* Job Profiles Available */}
              {jobProfiles.length === 0 && (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Henüz iş profili bulunamadı. Eşleştirme yapmak için önce iş profilleri oluşturun.
                  </p>
                  <Button onClick={() => router.push('/job-profiles/create')}>
                    İş Profili Oluştur
                  </Button>
                </div>
              )}

              {/* Matching Error */}
              {matchingError && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400">
                    {matchingError}
                  </p>
                </div>
              )}

              {/* Job Matches Results */}
              {jobMatches && (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-sm text-blue-600 dark:text-blue-400">Toplam Profil</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {jobMatches.TotalJobProfiles}
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <p className="text-sm text-green-600 dark:text-green-400">En İyi Eşleşme</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {jobMatches.BestMatch ? `${jobMatches.BestMatch.MatchPercentage}%` : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <p className="text-sm text-purple-600 dark:text-purple-400">Ortalama Uyum</p>
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {jobMatches.AverageMatchPercentage}%
                      </p>
                    </div>
                  </div>

                  {/* Best Match Highlight */}
                  {jobMatches.BestMatch && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-green-800 dark:text-green-200">
                            🏆 En İyi Eşleşme: {jobMatches.BestMatch.JobTitle}
                          </h3>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {jobMatches.BestMatch.MatchedKeywordsCount}/{jobMatches.BestMatch.TotalJobKeywords} anahtar kelime eşleşti
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {jobMatches.BestMatch.MatchPercentage}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* All Matches */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Tüm Eşleştirmeler
                    </h3>
                    {jobMatches.Matches.map((match, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {match.JobTitle}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {match.MatchPercentage}%
                            </div>
                            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${Math.min(match.MatchPercentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {match.MatchedKeywordsCount}/{match.TotalJobKeywords} anahtar kelime eşleşti
                        </div>

                        {/* Matched Keywords */}
                        {match.MatchedKeywords.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-green-600 dark:text-green-400 mb-1">
                              Eşleşen kelimeler:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {match.MatchedKeywords.slice(0, 5).map((keyword, keyIndex) => (
                                <span
                                  key={keyIndex}
                                  className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded"
                                >
                                  {keyword}
                                </span>
                              ))}
                              {match.MatchedKeywords.length > 5 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  +{match.MatchedKeywords.length - 5} daha
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Missing Keywords */}
                        {match.MissingKeywords.length > 0 && (
                          <div>
                            <p className="text-xs text-red-600 dark:text-red-400 mb-1">
                              Eksik kelimeler:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {match.MissingKeywords.slice(0, 5).map((keyword, keyIndex) => (
                                <span
                                  key={keyIndex}
                                  className="inline-block bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-2 py-1 rounded"
                                >
                                  {keyword}
                                </span>
                              ))}
                              {match.MissingKeywords.length > 5 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  +{match.MissingKeywords.length - 5} daha
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No matching performed yet */}
              {!jobMatches && !isMatchingLoading && jobProfiles.length > 0 && (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    CV'nizi {jobProfiles.length} iş profili ile eşleştirmek için butona tıklayın.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Hangi pozisyonlara ne kadar uygun olduğunuzu öğrenin.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Placeholder for Pending/Failed Analysis */}
        {analysis.AnalysisStatus.toLowerCase() !== 'completed' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Analysis in Progress
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              We're analyzing your CV. This process typically takes a few minutes.
              Please check back later for your results.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}