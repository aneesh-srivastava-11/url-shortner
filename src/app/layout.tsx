import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/providers/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'LinkForge - Shorten, Track, and Manage Your Links',
    template: '%s | LinkForge',
  },
  description: 'Professional URL shortener with analytics, QR codes, and custom domains. Shorten links, track clicks, and grow your business.',
  keywords: ['url shortener', 'link management', 'analytics', 'qr code', 'bitly alternative'],
  authors: [{ name: 'LinkForge' }],
  creator: 'LinkForge',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'LinkForge - Shorten, Track, and Manage Your Links',
    description: 'Professional URL shortener with analytics, QR codes, and custom domains.',
    siteName: 'LinkForge',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LinkForge - Shorten, Track, and Manage Your Links',
    description: 'Professional URL shortener with analytics, QR codes, and custom domains.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
