import HeroSection from '@/components/HeroSection'
import FeaturesSection from '@/components/FeaturesSection'
import HomeMemorialsSlider from '@/components/HomeMemorialsSlider'
import HomeMarketplaceSlider from '@/components/HomeMarketplaceSlider'
import StatsSection from '@/components/StatsSection'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <HomeMemorialsSlider />
      <HomeMarketplaceSlider />
      <StatsSection />
    </div>
  )
}
