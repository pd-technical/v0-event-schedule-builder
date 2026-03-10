import React from "react"
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

export const metadata: Metadata = {
  title: 'UC Davis Picnic Day - Find Events',
  description: 'Plan your UC Davis Picnic Day visit by exploring events and building your custom schedule',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/pd-112-logo.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/pd-112-logo.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/pd-112-logo.png',
        type: 'image/svg+xml',
      },
    ],
    apple: '/pd-112-logo.png',
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
        {children}
        <Analytics />
      </body>
    </html>
  )
}
