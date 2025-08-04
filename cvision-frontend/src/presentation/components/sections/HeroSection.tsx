'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle, Upload, Brain, BarChart3, Zap } from 'lucide-react'
import { Button } from '@/presentation/components/ui/Button'

export function HeroSection() {
  return (
    <section className="relative py-20 sm:py-24 lg:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20" />
      
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05]">
        <svg className="h-full w-full" viewBox="0 0 60 60">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Announcement Badge */}
          <div className="mb-8 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            <Zap className="mr-2 h-4 w-4" />
            AI-Powered CV Analysis Platform
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            Transform Your{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
              CV Analysis
            </span>{' '}
            with AI
          </h1>

          {/* Subtitle */}
          <p className="mb-8 mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
            CVision uses advanced ATS technology to analyze your resume, provide detailed feedback, 
            and help you land your dream job with confidence.
          </p>

          {/* CTA Buttons */}
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button size="lg" className="group">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="mb-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Easy Upload
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Simply upload your CV in PDF or Word format and get instant analysis
              </p>
            </div>

            <div className="group">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
                <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                AI-Powered Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Advanced algorithms analyze your CV against ATS requirements
              </p>
            </div>

            <div className="group sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Detailed Reports
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get comprehensive feedback with scores and improvement suggestions
              </p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
            <p className="mb-6 text-sm text-gray-600 dark:text-white">
              Trusted by job seekers worldwide
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60 dark:opacity-60">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-white">
                  10,000+ CVs Analyzed
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-white">
                  95% Success Rate
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-white">
                  24/7 Support
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}