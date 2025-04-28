'use client'
import type { Metadata } from 'next'
import './globals.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Rajdhani, Inter } from 'next/font/google'
import { StateCleanup } from '@/components/StateCleanup'

export const rajdhani = Rajdhani({
  variable: '--font-rajdhani',
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
})

export const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})

const metadata: Metadata = {
  title: 'AiWebsiteBuildr',
  description: 'Create your new website',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${rajdhani.variable} ${inter.variable}`}>
      <body className="bg-gray-50 min-h-screen">
        {children}
        <StateCleanup />
      </body>
    </html>
  )
}
