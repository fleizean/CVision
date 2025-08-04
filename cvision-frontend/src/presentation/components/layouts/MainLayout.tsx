'use client'

import { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { useAuth } from '@/contexts/AuthContext'

interface MainLayoutProps {
  children: ReactNode
  showHeader?: boolean
  showFooter?: boolean
}

export function MainLayout({ 
  children, 
  showHeader = true, 
  showFooter = true 
}: MainLayoutProps) {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {showHeader && <Header isAuthenticated={isAuthenticated} />}
      
      <main className="flex-1">
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  )
}