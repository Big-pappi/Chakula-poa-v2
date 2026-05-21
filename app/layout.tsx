import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/context/auth-context'
import { MaintenanceGuard } from '@/components/maintenance-guard'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Chakula Poa - Restaurant & Food Service Management',
  description: 'Subscribe to meal plans, pre-order meals 24 hours in advance, and collect food using your CPS number or QR code. Food service management for all Tanzanians - universities, markets, offices and more.',
  generator: 'Chakula Poa',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <MaintenanceGuard>
            {children}
          </MaintenanceGuard>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
