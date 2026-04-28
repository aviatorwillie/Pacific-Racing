import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { ChevronRight, UserPlus, Trophy, Wallet, TrendingUp } from 'lucide-react'

export const metadata = { title: 'How It Works' }

const STEPS = [
  {
    n: '01', icon: <UserPlus size={28} />, title: 'Create Your Account',
    desc: 'Sign up in under 2 minutes with just your email and password. No credit card required. You get K50 free credit instantly to try the platform.',
    detail: ['Free to join', 'K50 welcome credit', 'Instant account activation', 'Secure email verification'],
  },
  {
    n: '02', icon: <Trophy size={28} />, title: 'Browse Events & Odds',
    desc: 'Explore upcoming NRL matches, Soccer games, Horse Racing events, and more. Each event shows real-time odds for every participant.',
    detail: ['NRL, Soccer, Rugby, Cricket, AFL', 'Live events with real-time odds', 'Trending & most-picked indicators', 'Event details and descriptions'],
  },
  {
    n: '03', icon: <Wallet size={28} />, title: 'Place Your Bet',
    desc: 'Select the outcome you think will win. Enter your stake and see your potential payout calculated live. One tap to confirm.',
    detail: ['Minimum bet: K1.00', 'Maximum bet: K10,000', 'Instant balance deduction', 'Bet confirmation record'],
  },
  {
    n: '04', icon: <TrendingUp size={28} />, title: 'Collect Your Winnings',
    desc: "If your selection wins, your payout is credited to your wallet immediately. No waiting, no forms, no delays. Withdraw anytime.",
    detail: ['Instant payout on winning bets', 'Full bet history on /bets', 'Withdraw via Visa, Mastercard, or shop', 'Full transaction history'],
  },
]

export default function HowItWorksPage() {
  return (
    <div>
      <Navbar />
      <div className="pt-20">
        <section className="relative py-20 overflow-hidden text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,#152347,transparent)]" />
          <div className="relative max-w-3xl mx-auto px-4">
            <div className="inline-flex items-center gap-2 bg-[#F5C518]/8 border border-[#F5C518]/15 px-4 py-1.5 rounded-full text-xs text-[#F5C518] font-bold tracking-widest mb-6">
              ⚡ SIMPLE & FAST
            </div>
            <h1 className="font-display text-5xl sm:text-7xl tracking-widest mb-5">HOW IT WORKS</h1>
            <p className="text-[#8896B0] text-lg">From sign up to winning — everything you need to know about Pacific Racing.</p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
          <div className="space-y-6">
            {STEPS.map((step, i) => (
              <div key={step.n} className={`flex flex-col sm:flex-row gap-6 items-start p-7 rounded-2xl border ${i % 2 === 0 ? 'bg-[#0D1B3E] border-[#2756CC]/15' : 'bg-[#152347]/50 border-[#F5C518]/8'}`}>
                <div className="flex-shrink-0">
                  <div className="font-display text-5xl text-[#F5C518]/20 tracking-widest leading-none">{step.n}</div>
                  <div className="w-12 h-12 bg-[#F5C518]/10 border border-[#F5C518]/15 rounded-xl flex items-center justify-center text-[#F5C518] mt-2">
                    {step.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-2xl tracking-widest text-white mb-2">{step.title}</h3>
                  <p className="text-[#8896B0] text-sm leading-relaxed mb-4">{step.desc}</p>
                  <ul className="grid grid-cols-2 gap-1.5">
                    {step.detail.map(d => (
                      <li key={d} className="flex items-center gap-2 text-xs text-[#8896B0]">
                        <div className="w-1 h-1 bg-[#F5C518] rounded-full flex-shrink-0" />{d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Odds explainer */}
          <div className="mt-8 bg-[#0D1B3E] border border-[#2756CC]/15 rounded-2xl p-7">
            <h3 className="font-display text-2xl tracking-widest mb-4">UNDERSTANDING DECIMAL ODDS</h3>
            <p className="text-[#8896B0] text-sm leading-relaxed mb-5">
              Pacific Racing uses decimal odds — the most straightforward format. Your total return equals your stake multiplied by the odds.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { odds: '1.50', stake: 'K20', payout: 'K30', profit: 'K10', fav: true },
                { odds: '3.00', stake: 'K20', payout: 'K60', profit: 'K40', fav: false },
                { odds: '6.00', stake: 'K20', payout: 'K120', profit: 'K100', fav: false },
              ].map(ex => (
                <div key={ex.odds} className="bg-[#152347]/60 border border-[#2756CC]/12 rounded-xl p-4 text-center">
                  <div className="font-display text-4xl text-[#F5C518] mb-2">{ex.odds}</div>
                  <div className="text-xs text-[#8896B0] mb-3">{ex.fav ? 'Favourite' : ex.odds === '3.00' ? 'Mid-field' : 'Outsider'}</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-[#8896B0]">Stake</span><span className="text-white font-medium">{ex.stake}</span></div>
                    <div className="flex justify-between"><span className="text-[#8896B0]">Profit</span><span className="text-green-400 font-medium">{ex.profit}</span></div>
                    <div className="flex justify-between border-t border-[#2756CC]/12 pt-1 mt-1"><span className="text-white font-bold">Payout</span><span className="text-[#F5C518] font-bold">{ex.payout}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/signup" className="inline-flex items-center gap-2 bg-[#F5C518] text-[#0D1B3E] font-bold px-10 py-4 rounded-xl text-base hover:bg-[#FFD94A] transition-all press shadow-[0_0_24px_rgba(245,197,24,0.2)]">
              Start Betting Now — Get K50 Free <ChevronRight size={18} />
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
