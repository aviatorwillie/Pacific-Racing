import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Shield, Zap, Trophy, Users, ChevronRight } from 'lucide-react'

export const metadata = { title: 'About Us' }

export default function AboutPage() {
  return (
    <div>
      <Navbar />
      <div className="pt-20">
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,#152347,transparent)]" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-[#F5C518]/8 border border-[#F5C518]/15 px-4 py-1.5 rounded-full text-xs text-[#F5C518] font-bold tracking-widest mb-6">
              OUR STORY
            </div>
            <h1 className="font-display text-5xl sm:text-7xl tracking-widest text-white mb-6">ABOUT<br />PACIFIC RACING</h1>
            <p className="text-[#8896B0] text-lg leading-relaxed max-w-2xl mx-auto">
              Papua New Guinea&apos;s first fully digital sports betting platform, built from the ground up for Pacific bettors. Fast, secure, and fair.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-4xl tracking-widest mb-5">OUR MISSION</h2>
              <p className="text-[#8896B0] text-base leading-relaxed mb-4">
                Pacific Racing & Sports Betting Ltd was founded with a singular mission: to give Papua New Guineans access to a world-class betting experience that rivals the best platforms in Australia and the UK.
              </p>
              <p className="text-[#8896B0] text-base leading-relaxed mb-6">
                We believe everyone deserves a platform that is transparent, fast, and treats their money with respect. No hidden fees, no delayed payouts — just clean, honest betting.
              </p>
              <Link href="/signup" className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0D1B3E] font-bold px-6 py-3 rounded-xl hover:bg-[#FFD94A] transition-all press">
                Join the Platform <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '🏆', title: '2024 Launch', desc: "PNG's first fully digital betting platform" },
                { icon: '🔒', title: 'Licensed', desc: 'Regulated by PNG Gaming Control Board' },
                { icon: '⚡', title: 'Instant Payouts', desc: 'Winnings credited immediately' },
                { icon: '🇵🇬', title: 'Local Team', desc: 'Based in Port Moresby, PNG' },
              ].map(c => (
                <div key={c.title} className="bg-[#0D1B3E] border border-[#2756CC]/15 rounded-xl p-5 text-center hover:border-[#F5C518]/20 transition-all">
                  <div className="text-3xl mb-2">{c.icon}</div>
                  <div className="font-bold text-white text-sm mb-1">{c.title}</div>
                  <div className="text-[#8896B0] text-xs">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-[#0D1B3E]/30 border-y border-[#2756CC]/8 py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="font-display text-4xl tracking-widest text-center mb-10">OUR VALUES</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: <Shield size={22} />, title: 'Integrity', desc: 'Every bet is recorded. Every payout is honoured. We never cut corners.' },
                { icon: <Zap size={22} />, title: 'Speed', desc: 'Your winnings should be in your wallet before the crowd leaves the venue.' },
                { icon: <Trophy size={22} />, title: 'Excellence', desc: 'We benchmark ourselves against Bet365, Sportsbet, and Stake.' },
                { icon: <Users size={22} />, title: 'Community', desc: 'We are proud Papua New Guineans building for our own people.' },
              ].map(v => (
                <div key={v.title} className="text-center p-6">
                  <div className="w-12 h-12 bg-[#F5C518]/10 border border-[#F5C518]/15 rounded-xl flex items-center justify-center text-[#F5C518] mx-auto mb-4">{v.icon}</div>
                  <h3 className="font-bold text-white mb-2">{v.title}</h3>
                  <p className="text-[#8896B0] text-xs leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Responsible gambling */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="bg-[#0D1B3E] border border-[#2756CC]/15 rounded-2xl p-8">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="font-display text-3xl tracking-widest mb-3">RESPONSIBLE GAMBLING</h2>
            <p className="text-[#8896B0] text-sm leading-relaxed mb-5">
              Pacific Racing is committed to promoting responsible gambling. We provide tools to help you stay in control including deposit limits, betting limits, and self-exclusion options. Gambling should always be fun — if it stops being fun, we can help.
            </p>
            <p className="text-xs text-[#8896B0]">🇵🇬 Problem Gambling Helpline PNG: <strong className="text-white">1800-XXX-XXX</strong> (free, confidential, 24/7)</p>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
