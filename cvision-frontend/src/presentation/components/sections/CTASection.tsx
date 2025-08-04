import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/presentation/components/ui/Button'

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 dark:bg-white/10 mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
            Ready to transform your career?
          </h2>

          {/* Description */}
          <p className="text-lg text-blue-100 dark:text-blue-200 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have improved their CV and landed their dream jobs 
            with CVision's AI-powered analysis.
          </p>

          {/* Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-50 dark:bg-gray-100 dark:text-blue-700 dark:hover:bg-white group"
              >
                Start Free Analysis
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 dark:border-white/20 dark:hover:bg-white/5"
              >
                Contact Sales
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3 border-t border-white/20 pt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">10,000+</div>
              <div className="text-sm text-blue-100 dark:text-blue-200">CVs Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">95%</div>
              <div className="text-sm text-blue-100 dark:text-blue-200">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">4.9/5</div>
              <div className="text-sm text-blue-100 dark:text-blue-200">User Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}