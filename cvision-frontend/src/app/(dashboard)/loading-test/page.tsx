'use client'

import { LoadingScreen } from '@/components/ui/LoadingScreen'

export default function LoadingTestPage() {
  return (
    <LoadingScreen 
      message="Testing loading screen..."
      testMode={true}
    />
  )
}