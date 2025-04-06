'use client'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { AuthProvider } from './context/AuthContext'
import { SessionProvider } from 'next-auth/react'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
    <SessionProvider>
      <AuthProvider>
        <html lang="en">
          <body className={`${geistSans.variable} ${geistMono.variable}`}>
            {children}
          </body>
        </html>
      </AuthProvider>
    </SessionProvider>
  )
}
