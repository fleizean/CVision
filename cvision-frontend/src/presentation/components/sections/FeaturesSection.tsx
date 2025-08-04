import { FileText, Shield, Zap, BarChart3, Users, Clock } from 'lucide-react'

const features = [
  {
    name: 'ATS-Optimized Analysis',
    description: 'Ensure your CV passes through Applicant Tracking Systems with our advanced optimization algorithms.',
    icon: Shield,
    color: 'bg-blue-500'
  },
  {
    name: 'Instant Feedback',
    description: 'Get comprehensive analysis and feedback on your CV within seconds of upload.',
    icon: Zap,
    color: 'bg-yellow-500'
  },
  {
    name: 'Detailed Scoring',
    description: 'Receive detailed scores and metrics on various aspects of your CV including format, content, and keywords.',
    icon: BarChart3,
    color: 'bg-green-500'
  },
  {
    name: 'Multiple Formats',
    description: 'Support for PDF, Word, and other popular document formats for maximum convenience.',
    icon: FileText,
    color: 'bg-purple-500'
  },
  {
    name: 'Job Profile Matching',
    description: 'Create job profiles and see how well your CV matches specific role requirements.',
    icon: Users,
    color: 'bg-pink-500'
  },
  {
    name: '24/7 Availability',
    description: 'Access your CV analysis anytime, anywhere with our cloud-based platform.',
    icon: Clock,
    color: 'bg-indigo-500'
  }
]

export function FeaturesSection() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-800/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4">
            Everything you need to optimize your CV
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Our comprehensive suite of tools helps you create a CV that stands out to both recruiters and ATS systems.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.name}
              className="group relative p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all duration-300"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.name}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>

              {/* Hover effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}