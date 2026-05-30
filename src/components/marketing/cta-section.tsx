'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CtaSection() {
  return (
    <section className="container space-y-6 py-8 md:py-12 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto flex max-w-[58rem] flex-col items-center rounded-lg border bg-muted/50 p-8 text-center md:p-12"
      >
        <h2 className="text-3xl font-bold sm:text-4xl">Ready to get started?</h2>
        <p className="mt-4 max-w-[600px] text-muted-foreground">
          Join thousands of users who trust LinkForge to manage their links.
          Start shortening URLs in seconds.
        </p>
        <Link href="/login" className="mt-6">
          <Button size="lg" className="gap-2">
            Create Free Account <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    </section>
  )
}
