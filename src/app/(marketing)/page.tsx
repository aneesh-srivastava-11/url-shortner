import { MarketingLayout } from '@/components/layouts/marketing-layout'
import { HeroSection } from '@/components/marketing/hero-section'
import { FeaturesSection } from '@/components/marketing/features-section'
import { PricingSection } from '@/components/marketing/pricing-section'
import { ApiSection } from '@/components/marketing/api-section'
import { CtaSection } from '@/components/marketing/cta-section'

export default function HomePage() {
  return (
    <MarketingLayout>
      <HeroSection />
      <FeaturesSection />
      <ApiSection />
      <PricingSection />
      <CtaSection />
    </MarketingLayout>
  )
}
