'use client'

import { motion } from 'framer-motion'
import { BarChart3, QrCode, Shield, Globe, Code, Clock } from 'lucide-react'

const features = [
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Track clicks, countries, devices, browsers, and referrers in real-time.',
  },
  {
    icon: QrCode,
    title: 'QR Code Generation',
    description: 'Automatically generate QR codes for every shortened link.',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Rate limiting, spam protection, and enterprise-grade security.',
  },
  {
    icon: Globe,
    title: 'Custom Domains',
    description: 'Use your own domain for branded short links.',
  },
  {
    icon: Code,
    title: 'Developer API',
    description: 'Full REST API with API keys for seamless integration.',
  },
  {
    icon: Clock,
    title: 'Link Expiration',
    description: 'Set expiration dates for time-sensitive campaigns.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="container space-y-6 py-8 md:py-12 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center"
      >
        <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">Features</h2>
        <p className="max-w-[85%] text-muted-foreground sm:text-lg">
          Everything you need to manage, track, and optimize your links.
        </p>
      </motion.div>
      <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="relative overflow-hidden rounded-lg border bg-background p-2"
          >
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <feature.icon className="h-12 w-12 text-primary" />
              <div className="space-y-2">
                <h3 className="font-bold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
