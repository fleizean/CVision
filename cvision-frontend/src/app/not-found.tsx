'use client'

import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'
import { Button } from '@/presentation/components/ui/Button'
import { MainLayout } from '@/presentation/components/layouts/MainLayout'

export default function NotFound() {
    return (
        <MainLayout>
            <div className="relative min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
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

                <div className="container mx-auto max-w-2xl text-center">
                    {/* Error code */}
                    <h1 className="mb-4 text-7xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-8xl">
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                            404
                        </span>
                    </h1>

                    {/* Error message */}
                    <h2 className="mb-6 text-3xl font-semibold text-gray-800 dark:text-gray-100">
                        Page Not Found
                    </h2>

                    <div className="flex justify-center">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <Search className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>

                    {/* Description */}
                    <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
                        Sorry, we couldn't find the page you're looking for. It might have been moved, 
                        deleted, or perhaps never existed.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/">
                            <Button size="lg" className="group">
                                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                Back to Home
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button variant="outline" size="lg">
                                Contact Support
                            </Button>
                        </Link>
                    </div>

                    {/* Quick links */}
                    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                        <p className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                            You might want to check these pages instead:
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link href="/features" 
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                Features
                            </Link>
                            <span className="text-gray-400 dark:text-gray-600">•</span>
                            <Link href="/pricing" 
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                Pricing
                            </Link>
                            <span className="text-gray-400 dark:text-gray-600">•</span>
                            <Link href="/dashboard" 
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                Dashboard
                            </Link>
                            <span className="text-gray-400 dark:text-gray-600">•</span>
                            <Link href="/about" 
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                About
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}