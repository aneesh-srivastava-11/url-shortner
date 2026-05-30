'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, BarChart3, QrCode, Shield, Globe, Code } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="container flex flex-col items-center justify-center gap-4 pb-8 pt-6 md:py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex max-w-[980px] flex-col items-center gap-2 text-center"
      >
        <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl lg:leading-[1.1]">
          Shorten Links,{' '}
          <span className="text-primary">Amplify Reach</span>
        </h1>
        <p className="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl">
          Professional URL shortener with powerful analytics, QR codes, and custom domains.
          Track every click and grow your business.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex gap-4"
      >
        <Link href="/login">
          <Button size="lg" className="gap-2">
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="#api">
          <Button variant="outline" size="lg">
            View API Docs
          </Button>
        </Link>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
      >
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span>Lightning Fast Redirects</span>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <span>Real-time Analytics</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span>Enterprise Security</span>
        </div>
      </motion.div>
    </section>
  )
}
