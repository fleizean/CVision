import ProtectedRoute from '@/components/ProtectedRoute'
import { MainLayout } from '@/presentation/components/layouts/MainLayout'
import { HeroSection } from '@/presentation/components/sections/HeroSection'
import { FeaturesSection } from '@/presentation/components/sections/FeaturesSection'
import { CTASection } from '@/presentation/components/sections/CTASection'

export default function Home() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </MainLayout>
    </ProtectedRoute>
  )
}
