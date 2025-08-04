'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  type StepStatus = "pending" | "loading" | "completed" | "error";
  
  const [loadingSteps, setLoadingSteps] = useState<Array<{
    id: string;
    message: string;
    status: StepStatus;
  }>>([
    { id: 'check-session', message: 'Checking for existing session', status: 'pending' },
    { id: 'validate-token', message: 'Validating authentication token', status: 'pending' },
    { id: 'fetch-user', message: 'Fetching user information', status: 'pending' }
  ]);
  

  useEffect(() => {
    // Simulate loading steps progressing
    // In a real app, you would update these based on actual authentication events
    if (isLoading) {
      // Step 1: Start checking session
      setLoadingSteps(steps => 
        steps.map(step => 
          step.id === 'check-session' ? { ...step, status: 'loading' } : step
        )
      );
      
      // Step 1: Complete after 1 second
      setTimeout(() => {
        setLoadingSteps(steps => 
          steps.map(step => 
            step.id === 'check-session' ? { ...step, status: 'completed' } : step
          )
        );
        
        // Step 2: Start
        setLoadingSteps(steps => 
          steps.map(step => 
            step.id === 'validate-token' ? { ...step, status: 'loading' } : step
          )
        );
        
        // Step 2: Complete after another second
        setTimeout(() => {
          setLoadingSteps(steps => 
            steps.map(step => 
              step.id === 'validate-token' ? { ...step, status: 'completed' } : step
            )
          );
          
          // Step 3: Start
          setLoadingSteps(steps => 
            steps.map(step => 
              step.id === 'fetch-user' ? { ...step, status: 'loading' } : step
            )
          );
          
          // Step 3: Complete after another second
          setTimeout(() => {
            setLoadingSteps(steps => 
              steps.map(step => 
                step.id === 'fetch-user' ? { ...step, status: 'completed' } : step
              )
            );
          }, 1000);
        }, 1000);
      }, 1000);
    }
  }, [isLoading]);

  if (isLoading) {
    return <LoadingScreen 
      message="Initializing application..." 
      loadingSteps={loadingSteps}
    />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      {/* Sol taraf - Logo ve açıklama */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-950 relative overflow-hidden">
        {/* Dekoratif arka plan elementleri */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/20 dark:bg-blue-300/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-32 right-16 w-48 h-48 bg-blue-300/15 dark:bg-blue-200/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
        </div>
        
        {/* İçerik */}
        <div className="relative z-10 flex flex-col justify-center items-start px-16 py-20 text-white">
          <div className="mb-12">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-16 w-auto mb-8 drop-shadow-lg"
            />
            <h1 className="text-4xl font-bold mb-6 leading-tight">
              Hoş Geldiniz
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed max-w-md">
              Güvenli ve modern platformumuzda size özel deneyimi keşfedin
            </p>
          </div>
          
          {/* Özellik vurguları */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-blue-100">
              <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
              <span>Güvenli giriş sistemi</span>
            </div>
            <div className="flex items-center space-x-3 text-blue-100">
              <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
              <span>Modern kullanıcı deneyimi</span>
            </div>
            <div className="flex items-center space-x-3 text-blue-100">
              <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
              <span>7/24 destek</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sağ taraf - Form alanı */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20">
        {/* Mobil logo */}
        <div className="lg:hidden text-center mb-8">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="h-12 w-auto mx-auto mb-4"
          />
        </div>
        
        {/* Form container */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-blue-100 dark:border-gray-700">
            {children}
          </div>
        </div>
        
     
      </div>
    </div>
  )
}