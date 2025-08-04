'use client'

import Image from 'next/image'
import { motion, useAnimation } from 'framer-motion'
import { useEffect, useState } from 'react'

// Define loading steps interface
export interface LoadingStep {
  id: string
  message: string
  status: 'pending' | 'loading' | 'completed' | 'error'
}

interface LoadingScreenProps {
  message?: string
  onLoadingComplete?: () => void
  minDisplayTime?: number
  loadingSteps?: LoadingStep[]
  testMode?: boolean // Add this prop for testing purposes
}

export function LoadingScreen({ 
  message = "Loading...", 
  onLoadingComplete, 
  minDisplayTime = 4000,
  loadingSteps = [],
  testMode = false // Default to false
}: LoadingScreenProps) {
  const progressControls = useAnimation()
  const [isComplete, setIsComplete] = useState(false)
  const [currentProgress, setCurrentProgress] = useState(0)
  
  // Calculate overall progress based on loading steps
  const calculateProgress = () => {
    if (loadingSteps.length === 0) return currentProgress;
    
    const completedSteps = loadingSteps.filter(step => step.status === 'completed').length;
    const loadingStepCount = loadingSteps.filter(step => step.status === 'loading').length;
    
    // Each loading step counts as half complete
    return Math.min(100, Math.round((completedSteps + (loadingStepCount * 0.5)) / loadingSteps.length * 100));
  }

  useEffect(() => {
    const progress = calculateProgress();
    setCurrentProgress(progress);
    
    // Auto-progress animation for smooth user experience
    const animateProgress = async () => {
      if (testMode) {
        // In test mode, just animate between progress values in a loop
        while (true) {
          await progressControls.start({ width: "30%", transition: { duration: 1.5, ease: "easeInOut" }});
          await progressControls.start({ width: "60%", transition: { duration: 1.5, ease: "easeInOut" }});
          await progressControls.start({ width: "85%", transition: { duration: 1.5, ease: "easeInOut" }});
          await progressControls.start({ width: "40%", transition: { duration: 1.5, ease: "easeInOut" }});
        }
      } else if (loadingSteps.length === 0) {
        // Default animation if no steps provided
        await progressControls.start({ width: "90%", transition: { duration: 3, ease: "easeInOut" }})
        await progressControls.start({ width: "100%", transition: { duration: 1, ease: "easeOut" }})
        setIsComplete(true);
      } else {
        // Animate to current progress
        await progressControls.start({ 
          width: `${progress}%`, 
          transition: { duration: 0.8, ease: "easeInOut" }
        });
        
        // Check if all steps are completed
        if (progress === 100) {
          setIsComplete(true);
        }
      }
    }

    animateProgress();

    // Ensure minimum display time before triggering completion
    const timer = setTimeout(() => {
      if (isComplete && onLoadingComplete && !testMode) {
        onLoadingComplete()
      }
    }, minDisplayTime)

    return () => clearTimeout(timer)
  }, [progressControls, minDisplayTime, onLoadingComplete, isComplete, loadingSteps, testMode])

  // For test mode, create cycling demo steps
  const [demoSteps, setDemoSteps] = useState<LoadingStep[]>([
    { id: 'step-1', message: 'Verifying authentication status', status: 'completed' },
    { id: 'step-2', message: 'Checking session validity', status: 'loading' },
    { id: 'step-3', message: 'Validating permissions', status: 'pending' }
  ]);

  // In test mode, cycle through different states for demo steps
  useEffect(() => {
    if (!testMode) return;
    
    const interval = setInterval(() => {
      setDemoSteps(current => {
        const newSteps = [...current];
        
        // Cycle through statuses: pending -> loading -> completed -> error -> pending
        newSteps.forEach((step, index) => {
          switch(step.status) {
            case 'pending':
              newSteps[index] = { ...step, status: 'loading' };
              break;
            case 'loading':
              newSteps[index] = { ...step, status: 'completed' };
              break;
            case 'completed':
              newSteps[index] = { ...step, status: 'error' };
              break;
            case 'error':
              newSteps[index] = { ...step, status: 'pending' };
              break;
          }
        });
        
        return newSteps;
      });
    }, 2000); // Change states every 2 seconds
    
    return () => clearInterval(interval);
  }, [testMode]);

  // Use demo steps if in test mode
  const displaySteps = testMode ? demoSteps : loadingSteps;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 flex flex-col items-center space-y-6 max-w-md w-full">
        {/* Logo with enhanced animation */}
        <motion.div 
          className="relative"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 bg-primary/20 rounded-full animate-pulse absolute inset-0"></div>
          <div className="w-20 h-20 bg-primary/10 rounded-full animate-ping absolute inset-0 animation-delay-500"></div>
          <Image 
            src="/logo.png"
            alt="CVision Logo"
            width={80}
            height={80}
            className="w-20 h-20 relative z-10 rounded-full shadow-md"
          />
        </motion.div>
        
        {/* Loading text with animation - Fixed center alignment */}
        <motion.div 
          className="text-center w-full flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
            CVision
          </h2>
          <div className="text-gray-600 dark:text-gray-300 flex justify-center items-center">
            <span className="text-center">{message}</span>
          </div>
        </motion.div>

        {/* Progress bar with controlled animation */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <motion.div 
            className="bg-blue-500 h-full rounded-full"
            initial={{ width: "5%" }}
            animate={progressControls}
          />
        </div>
        
        {/* Loading steps display */}
        {displaySteps.length > 0 && (
          <div className="w-full space-y-2 mt-2">
            {displaySteps.map((step) => (
              <div key={step.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">{step.message}</span>
                <span className="flex-shrink-0">
                  {step.status === 'pending' && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">Pending</span>
                  )}
                  {step.status === 'loading' && (
                    <motion.svg 
                      className="animate-spin h-4 w-4 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </motion.svg>
                  )}
                  {step.status === 'completed' && (
                    <motion.svg 
                      className="h-4 w-4 text-green-500" 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring" }}
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </motion.svg>
                  )}
                  {step.status === 'error' && (
                    <motion.svg 
                      className="h-4 w-4 text-red-500" 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring" }}
                    >
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </motion.svg>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {/* Progress percentage */}
        {displaySteps.length > 0 && (
          <div className="text-xs text-center w-full text-gray-500 dark:text-gray-400">
            {testMode ? "Testing Mode - Progress Loop" : `${currentProgress}% Complete`}
          </div>
        )}
        
        {/* Test mode indicator */}
        {testMode && (
          <div className="mt-4 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500 p-2 rounded-md text-center">
            Test mode active. This screen will remain visible for inspection.
          </div>
        )}
      </div>
    </div>
  )
}