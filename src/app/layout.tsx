import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Pacific Racing — Sports Betting PNG', template: '%s | Pacific Racing' },
  description: "Papua New Guinea's premier sports betting platform. NRL, Soccer, Horse Racing and more. Fast payouts, competitive odds.",
  keywords: ['betting', 'PNG betting', 'sports betting', 'NRL betting', 'horse racing PNG', 'Pacific betting'],
  openGraph: { siteName: 'Pacific Racing', type: 'website' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#080F22] text-white font-body antialiased">
        {children}
      </body>
    </html>
  )
}
