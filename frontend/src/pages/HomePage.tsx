import { HeroSection } from '@/components/HeroSection'
import { FeaturesSection } from '@/components/FeaturesSection'
import { PricingSection } from '@/components/PricingSection'
import { usePageTitle } from '@/hooks/usePageTitle'

export const HomePage = () => {
  usePageTitle('Início')

  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
    </>
  )
}