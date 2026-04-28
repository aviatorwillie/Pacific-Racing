'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import EventCard from '@/components/ui/EventCard'
import { ChevronRight, Shield, Zap, Trophy, Star, TrendingUp, CheckCircle } from 'lucide-react'
import type { EventWithParticipants } from '@/lib/types'

export default function LandingPage() {
  const [events, setEvents] = useState<EventWithParticipants[]>([])

  useEffect(() => {
    fetch('/api/events?status=live')
      .then(r => r.json())
      .then(d => {
        if (d.data?.length) setEvents(d.data.slice(0, 3))
        else fetch('/api/events').then(r => r.json()).then(d2 => setEvents((d2.data || []).slice(0, 3)))
      })
  }, [])

  return (
    <div className="noise">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative pt-24 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,#152347,transparent)]" />
        <div className="absolute -top-40 -right-20 w-[600px] h-[600px] bg-[#2756CC]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage:'repeating-linear-gradient(45deg,#F5C518 0,#F5C518 1px,transparent 0,transparent 50%)', backgroundSize:'24px 24px' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          {events.filter(e => e.status === 'live').length > 0 && (
            <div className="inline-flex items-center gap-2 bg-[#152347]/80 border border-green-500/25 px-4 py-2 rounded-full text-sm mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full live-dot" />
              <span className="text-green-400 font-bold tracking-wider">
                {events.filter(e => e.status === 'live').length} EVENTS LIVE NOW
              </span>
            </div>
          )}

          <h1 className="font-display leading-none tracking-[0.05em] mb-6">
            <span className="block text-6xl sm:text-8xl lg:text-[100px] text-white">THE PACIFIC&apos;S</span>
            <span className="block text-6xl sm:text-8xl lg:text-[100px] shimmer-gold mt-1">PREMIER BETTING</span>
          </h1>

          <p className="text-[#8896B0] text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            NRL · Soccer · Horse Racing · Rugby · Cricket · AFL<br />
            <strong className="text-white font-semibold">Fast payouts. Best odds. Proudly Papua New Guinean.</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup" className="group flex items-center gap-2 bg-[#F5C518] text-[#0D1B3E] font-bold px-10 py-4 rounded-xl text-base hover:bg-[#FFD94A] transition-all press shadow-[0_0_32px_rgba(245,197,24,0.25)]">
              Start Betting — It&apos;s Free
              <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/how-it-works" className="flex items-center gap-2 border border-[#2756CC]/40 text-[#B8C4D8] font-medium px-8 py-4 rounded-xl hover:border-[#F5C518]/40 hover:text-white transition-all">
              How It Works
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8 text-[11px] text-[#8896B0] tracking-wider flex-wrap">
            <span className="flex items-center gap-1.5"><Shield size={11} className="text-[#F5C518]" />PNG LICENSED</span>
            <span className="w-px h-3 bg-[#2756CC]/30" />
            <span className="flex items-center gap-1.5"><Zap size={11} className="text-[#F5C518]" />INSTANT PAYOUTS</span>
            <span className="w-px h-3 bg-[#2756CC]/30" />
            <span className="flex items-center gap-1.5"><Star size={11} className="text-[#F5C518]" />BEST ODDS</span>
            <span className="w-px h-3 bg-[#2756CC]/30" />
            <span className="flex items-center gap-1.5"><Trophy size={11} className="text-[#F5C518]" />K50 WELCOME BONUS</span>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="border-y border-[#2756CC]/10 bg-[#0D1B3E]/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[['K50,000', 'MAX PAYOUT'], ['K1', 'MIN BET'], ['24/7', 'SUPPORT'], ['1,000+', 'MEMBERS']].map(([v, l]) => (
            <div key={l}>
              <div className="font-display text-2xl sm:text-3xl text-[#F5C518] tracking-wider">{v}</div>
              <div className="text-[9px] text-[#8896B0] tracking-widest mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURED EVENTS ── */}
      {events.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Trophy size={20} className="text-[#F5C518]" />
              <h2 className="font-display text-3xl tracking-widest">FEATURED EVENTS</h2>
            </div>
            <Link href="/events" className="flex items-center gap-1 text-sm text-[#8896B0] hover:text-[#F5C518] transition-colors">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {events.map(e => <EventCard key={e.id} event={e} />)}
          </div>
          <div className="text-center mt-6">
            <Link href="/signup" className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0D1B3E] font-bold px-8 py-3 rounded-xl hover:bg-[#FFD94A] transition-all press">
              Sign Up to Bet <ChevronRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl tracking-widest mb-3">HOW IT WORKS</h2>
          <p className="text-[#8896B0] text-sm">Get started in 3 simple steps</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { n: '01', title: 'Sign Up Free', desc: 'Create your account in under 2 minutes. No deposits required to get started.' },
            { n: '02', title: 'Pick Your Event', desc: 'Browse NRL, Soccer, Horse Racing and more. Select the outcome you think will win.' },
            { n: '03', title: 'Place Your Bet', desc: 'Enter your stake, see your potential payout instantly. Winnings hit your wallet immediately.' },
          ].map(step => (
            <div key={step.n} className="bg-[#0D1B3E]/60 border border-[#2756CC]/15 rounded-2xl p-7 text-center hover:border-[#F5C518]/20 transition-all">
              <div className="font-display text-5xl text-[#F5C518]/30 tracking-wider mb-4">{step.n}</div>
              <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
              <p className="text-[#8896B0] text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRUST SECTION ── */}
      <section className="bg-[#0D1B3E]/40 border-y border-[#2756CC]/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="font-display text-4xl tracking-widest mb-3">WHY PACIFIC RACING?</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🔒', title: 'Bank-Level Security', desc: 'SSL encrypted. Your data and money are always protected.' },
              { icon: '⚡', title: 'Instant Payouts', desc: 'Winnings credited to your wallet immediately after results.' },
              { icon: '🏆', title: 'Best Odds in PNG', desc: 'Competitive odds across all sports and events.' },
              { icon: '📞', title: '24/7 Support', desc: 'Local team based in Port Moresby, always here to help.' },
            ].map(item => (
              <div key={item.title} className="bg-[#152347]/60 border border-[#2756CC]/12 rounded-xl p-5 text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="font-bold text-white text-sm mb-1.5">{item.title}</h4>
                <p className="text-[#8896B0] text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WELCOME BONUS CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2756CC] to-[#1A3DB8] p-10 text-center">
          <div className="absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage:'repeating-linear-gradient(-45deg,#F5C518 0,#F5C518 1px,transparent 0,transparent 50%)', backgroundSize:'16px 16px' }} />
          <div className="relative">
            <div className="font-display text-5xl sm:text-6xl text-[#F5C518] tracking-widest mb-3">K50 FREE CREDIT</div>
            <p className="text-[#B8C4D8] text-sm mb-6 max-w-md mx-auto">
              Sign up today and receive K50 free betting credit instantly. No deposit required. Start betting immediately. 18+. T&Cs apply.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0D1B3E] font-bold px-10 py-4 rounded-xl text-base hover:bg-[#FFD94A] transition-all press">
              Claim Your K50 Now <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
