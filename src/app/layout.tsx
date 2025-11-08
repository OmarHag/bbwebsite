import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Broker Breakers',
  description: 'Direct shipper-driver connection platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
