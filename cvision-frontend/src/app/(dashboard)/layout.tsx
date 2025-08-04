'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Header } from '@/presentation/components/layouts/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header isAuthenticated={true} />
        <main>
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}