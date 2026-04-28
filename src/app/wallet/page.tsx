'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/client'
import { formatKina } from '@/lib/utils'
import {
  Wallet, ArrowDownLeft, ArrowUpRight, TrendingUp,
  Info, CheckCircle, Lock, Shield,
  ChevronRight, Copy, User, Building2
} from 'lucide-react'
import { format } from 'date-fns'

const TX_ICONS: Record<string, any> = {
  bet: ArrowUpRight, withdrawal: ArrowUpRight,
  payout: ArrowDownLeft, deposit: ArrowDownLeft,
  admin_credit: ArrowDownLeft, refund: ArrowDownLeft,
}

type WalletTab = 'overview' | 'deposit' | 'withdraw'

export default function WalletPage() {
  const router = useRouter()
  const [wallet, setWallet] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<WalletTab>('overview')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      const [wRes, pRes] = await Promise.all([
        fetch('/api/wallet').then(r => r.json()),
        fetch('/api/profile').then(r => r.json()),
      ])
      if (wRes.data) { setWallet(wRes.data.balance); setTransactions(wRes.data.transactions || []) }
      if (pRes.data) setProfile(pRes.data)
      setLoading(false)
    })
  }, [router])

  const copyAccountNumber = () => {
    const num = profile?.pr_account_number || profile?.admin_number
    if (!num) return
    navigator.clipboard.writeText(num)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#F5C518] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen">
      <Navbar showBalance />
      <div className="pt-20 pb-12 max-w-3xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8 fade-up">
          <h1 className="font-display text-3xl sm:text-4xl tracking-widest flex items-center gap-3">
            <Wallet size={26} className="text-[#F5C518]" />MY WALLET
          </h1>
        </div>

        {/* Balance card */}
        {wallet && (
          <div className="bg-gradient-to-br from-[#2756CC] to-[#1A3DB8] rounded-2xl p-7 mb-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.05]"
              style={{ backgroundImage: 'repeating-linear-gradient(-45deg,#F5C518 0,#F5C518 1px,transparent 0,transparent 50%)', backgroundSize: '14px 14px' }} />
            <div className="relative">
              <div className="flex items-start justify-between mb-3 gap-4">
                <div>
                  <div className="text-xs text-[#B8C4D8] tracking-widest mb-1">AVAILABLE BALANCE</div>
                  <div className="font-display text-5xl sm:text-6xl text-[#F5C518] tracking-wider leading-none">
                    {formatKina(wallet.available)}
                  </div>
                </div>
              </div>
              <div className="text-[#B8C4D8] text-xs">
                Total: {formatKina(wallet.total)} · Locked: {formatKina(wallet.locked)}
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setTab('deposit')}
                  className="flex items-center gap-1.5 bg-[#F5C518] text-[#0D1B3E] text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-[#FFD94A] transition-all press">
                  <ArrowDownLeft size={13} />Deposit
                </button>
                <button onClick={() => setTab('withdraw')}
                  className="flex items-center gap-1.5 border border-white/25 text-white text-xs font-medium px-5 py-2.5 rounded-lg hover:bg-white/8 transition-all">
                  <ArrowUpRight size={13} />Withdraw
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Account Number Card ── */}
        {(profile?.pr_account_number || profile?.admin_number) && (
          <div className="bg-[#0D1B3E] border border-[#F5C518]/20 rounded-2xl p-5 mb-6 relative overflow-hidden">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <User size={12} className="text-[#F5C518]" />
                  <div className="text-[10px] text-[#8896B0] tracking-widest font-medium">
                    {profile.role === 'admin' ? 'ADMIN ID' : 'YOUR PR ACCOUNT NUMBER'}
                  </div>
                </div>
                <div className="font-display text-2xl sm:text-3xl text-[#F5C518] tracking-[0.15em] font-bold">
                  {profile.role === 'admin' ? profile.admin_number : profile.pr_account_number}
                </div>
                <div className="text-[11px] text-[#8896B0] mt-1">
                  {profile.role === 'admin'
                    ? 'Your admin activity is tracked against this ID.'
                    : 'Use this number for manual cash deposits at any Pacific Racing physical shop.'}
                </div>
              </div>
              <button onClick={copyAccountNumber}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
                  copied
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-[#152347] text-[#F5C518] border border-[#F5C518]/20 hover:bg-[#F5C518]/10'
                }`}>
                {copied ? <><CheckCircle size={13} />COPIED</> : <><Copy size={13} />COPY</>}
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-[#0D1B3E] border border-[#2756CC]/15 rounded-xl p-1 w-fit mb-6">
          {([
            { id: 'overview', label: 'Overview' },
            { id: 'deposit', label: 'Deposit' },
            { id: 'withdraw', label: 'Withdraw' },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === t.id ? 'bg-[#F5C518] text-[#0D1B3E]' : 'text-[#8896B0] hover:text-white'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <div className="fade-up space-y-6">
            {/* How it works */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#0D1B3E] border border-green-500/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-green-500/12 rounded-lg flex items-center justify-center">
                    <CheckCircle size={16} className="text-green-400" />
                  </div>
                  <span className="font-bold text-white text-sm">Deposits</span>
                </div>
                <p className="text-xs text-[#8896B0] leading-relaxed">
                  No ID verification required. Deposit via Visa, Mastercard, or cash at any physical shop using your PR account number.
                </p>
                <button onClick={() => setTab('deposit')}
                  className="mt-3 flex items-center gap-1 text-xs text-green-400 font-semibold hover:text-green-300 transition-colors">
                  Deposit now <ChevronRight size={12} />
                </button>
              </div>

              <div className="bg-[#0D1B3E] border border-[#F5C518]/15 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-[#F5C518]/10 rounded-lg flex items-center justify-center">
                    <Shield size={16} className="text-[#F5C518]" />
                  </div>
                  <span className="font-bold text-white text-sm">Withdrawals</span>
                </div>
                <p className="text-xs text-[#8896B0] leading-relaxed">
                  ID verification (KYC) required before your first withdrawal. One-time, secure, and compliant with PNG regulations.
                </p>
                <button onClick={() => setTab('withdraw')}
                  className="mt-3 flex items-center gap-1 text-xs text-[#F5C518] font-semibold hover:text-[#FFD94A] transition-colors">
                  Learn more <ChevronRight size={12} />
                </button>
              </div>
            </div>

            {/* Transaction history */}
            <div>
              <h2 className="font-display text-xl tracking-widest mb-4">TRANSACTION HISTORY</h2>
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-[#8896B0]">
                  <TrendingUp size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No transactions yet</p>
                  <button onClick={() => setTab('deposit')}
                    className="mt-3 text-xs text-[#F5C518] hover:underline">Make your first deposit →</button>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map(tx => {
                    const Icon = TX_ICONS[tx.type] || TrendingUp
                    const isPos = tx.amount > 0
                    return (
                      <div key={tx.id} className="flex items-center gap-4 bg-[#0D1B3E] border border-[#2756CC]/10 rounded-xl px-5 py-3.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isPos ? 'bg-green-500/12' : 'bg-red-500/12'}`}>
                          <Icon size={14} className={isPos ? 'text-green-400' : 'text-red-400'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white capitalize">{tx.type.replace('_', ' ')}</div>
                          <div className="text-xs text-[#8896B0]">
                            {tx.description || '—'} · {format(new Date(tx.created_at), 'd MMM · h:mm a')}
                          </div>
                        </div>
                        <div className={`font-bold text-sm flex-shrink-0 ${isPos ? 'text-green-400' : 'text-red-400'}`}>
                          {isPos ? '+' : ''}{formatKina(tx.amount)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── DEPOSIT TAB ── */}
        {tab === 'deposit' && (
          <div className="fade-up space-y-4">
            {/* No KYC banner */}
            <div className="flex items-start gap-3 bg-green-500/8 border border-green-500/20 rounded-xl px-5 py-4">
              <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-green-400 mb-1">No ID Verification Required</div>
                <p className="text-xs text-[#8896B0] leading-relaxed">
                  You can deposit and start betting immediately — no documents needed. ID verification is only required when you want to withdraw.
                </p>
              </div>
            </div>

            <h2 className="font-display text-xl tracking-widest">CHOOSE DEPOSIT METHOD</h2>

            <div className="space-y-3">
              {/* Visa */}
              <div className="flex items-center gap-4 bg-[#0D1B3E] border border-[#2756CC]/15 rounded-xl px-5 py-4 hover:border-[#F5C518]/25 transition-all cursor-pointer group">
                <div className="w-10 h-10 bg-[#152347] rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-blue-400 text-sm tracking-wider">VISA</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">Visa Credit / Debit Card</span>
                    <span className="text-[9px] font-bold text-[#F5C518] bg-[#F5C518]/10 border border-[#F5C518]/20 px-2 py-0.5 rounded-full tracking-wider">INSTANT</span>
                  </div>
                  <div className="text-xs text-[#8896B0]">Secured by Windcave · Funds available immediately</div>
                </div>
                <ChevronRight size={16} className="text-[#8896B0] group-hover:text-[#F5C518] transition-colors flex-shrink-0" />
              </div>

              {/* Mastercard */}
              <div className="flex items-center gap-4 bg-[#0D1B3E] border border-[#2756CC]/15 rounded-xl px-5 py-4 hover:border-[#F5C518]/25 transition-all cursor-pointer group">
                <div className="w-10 h-10 bg-[#152347] rounded-lg flex items-center justify-center flex-shrink-0 relative">
                  <div className="w-5 h-5 bg-red-500/80 rounded-full absolute left-1" />
                  <div className="w-5 h-5 bg-orange-400/80 rounded-full absolute right-1 mix-blend-screen" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">Mastercard</span>
                    <span className="text-[9px] font-bold text-[#F5C518] bg-[#F5C518]/10 border border-[#F5C518]/20 px-2 py-0.5 rounded-full tracking-wider">INSTANT</span>
                  </div>
                  <div className="text-xs text-[#8896B0]">Secured by Windcave · Funds available immediately</div>
                </div>
                <ChevronRight size={16} className="text-[#8896B0] group-hover:text-[#F5C518] transition-colors flex-shrink-0" />
              </div>

              {/* Manual Deposit */}
              <div className="bg-[#0D1B3E] border-2 border-[#F5C518]/25 rounded-xl overflow-hidden">
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="w-10 h-10 bg-[#F5C518]/10 border border-[#F5C518]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 size={18} className="text-[#F5C518]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">Manual Cash Deposit</span>
                      <span className="text-[9px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full tracking-wider">NO CARD NEEDED</span>
                    </div>
                    <div className="text-xs text-[#8896B0]">Deposit cash at any Pacific Racing physical shop</div>
                  </div>
                </div>

                {/* Manual deposit instructions */}
                <div className="px-5 pb-5 pt-1 border-t border-[#2756CC]/10 bg-[#080F22]/50">
                  <div className="text-[10px] text-[#F5C518] tracking-widest font-bold mb-3 mt-3">HOW IT WORKS</div>
                  <ol className="space-y-2.5 mb-4">
                    {[
                      { n: '1', t: 'Visit any Pacific Racing physical betting shop near you' },
                      { n: '2', t: 'Give the cashier your cash and your PR Account Number' },
                      { n: '3', t: 'The cashier credits your online wallet — takes under 1 minute' },
                      { n: '4', t: 'You\'ll receive a confirmation and can start betting online immediately' },
                    ].map(step => (
                      <li key={step.n} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-[#F5C518] text-[#0D1B3E] rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {step.n}
                        </div>
                        <span className="text-xs text-[#B8C4D8] leading-relaxed">{step.t}</span>
                      </li>
                    ))}
                  </ol>

                  {/* Account number highlight */}
                  {profile?.pr_account_number && (
                    <div className="bg-[#152347] border border-[#F5C518]/20 rounded-xl p-4">
                      <div className="text-[10px] text-[#8896B0] tracking-widest mb-1">PROVIDE THIS NUMBER AT THE SHOP</div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-display text-2xl text-[#F5C518] tracking-[0.15em] font-bold">
                          {profile.pr_account_number}
                        </div>
                        <button onClick={copyAccountNumber}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex-shrink-0 ${
                            copied
                              ? 'bg-green-500/20 text-green-400 border border-green-500/25'
                              : 'bg-[#080F22] text-[#F5C518] border border-[#F5C518]/25 hover:bg-[#F5C518]/10'
                          }`}>
                          {copied ? <><CheckCircle size={11} />COPIED</> : <><Copy size={11} />COPY</>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Min/max note */}
            <div className="flex items-center gap-2 text-xs text-[#8896B0] bg-[#0D1B3E]/60 border border-[#2756CC]/8 rounded-xl px-4 py-3">
              <Info size={13} className="text-[#8896B0] flex-shrink-0" />
              <span>Minimum: <strong className="text-white">K10</strong> · Maximum: <strong className="text-white">K10,000</strong> per transaction · No fees charged</span>
            </div>

            {/* Phase 2 note */}
            <div className="bg-[#0D1B3E]/40 border border-[#2756CC]/8 rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-[#8896B0]">
                ⚠️ Windcave payment gateway and physical shop network launch in <strong className="text-[#F5C518]">Phase 2</strong>. During demo period, contact our team via the <a href="/contact" className="text-[#F5C518] hover:underline">Contact page</a> for manual account credits.
              </p>
            </div>
          </div>
        )}

        {/* ── WITHDRAW TAB ── */}
        {tab === 'withdraw' && (
          <div className="fade-up space-y-4">
            <div className="bg-[#0D1B3E] border-2 border-[#F5C518]/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#F5C518]/10 border border-[#F5C518]/20 rounded-xl flex items-center justify-center">
                  <Shield size={22} className="text-[#F5C518]" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">ID Verification Required</h3>
                  <p className="text-xs text-[#8896B0]">One-time process · Takes 2–5 minutes</p>
                </div>
              </div>

              <p className="text-sm text-[#8896B0] leading-relaxed mb-5">
                To protect your funds and comply with <strong className="text-white">PNG Gaming Control Board</strong> regulations, we verify your identity before processing any withdrawals.
              </p>

              <div className="space-y-3 mb-5">
                {[
                  { icon: '🪪', title: 'Government-issued ID', desc: "Passport, National ID, or Driver's Licence" },
                  { icon: '🤳', title: 'Selfie verification', desc: 'A photo of you holding your ID document' },
                  { icon: '📄', title: 'Proof of address', desc: 'Utility bill or bank statement (last 3 months)' },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3 bg-[#152347]/60 rounded-xl px-4 py-3">
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-white">{item.title}</div>
                      <div className="text-xs text-[#8896B0]">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full flex items-center justify-center gap-2 bg-[#F5C518] text-[#0D1B3E] font-bold py-3.5 rounded-xl hover:bg-[#FFD94A] transition-all press text-sm">
                <Shield size={15} />Start ID Verification
              </button>

              <p className="text-center text-[10px] text-[#8896B0] mt-3">
                Documents are encrypted and processed securely. We never store raw ID images.
              </p>
            </div>

            {/* Why KYC */}
            <div className="bg-[#0D1B3E]/50 border border-[#2756CC]/8 rounded-xl px-5 py-4">
              <h4 className="text-xs font-bold text-[#8896B0] tracking-widest mb-3 flex items-center gap-2">
                <Info size={11} />WHY IS VERIFICATION REQUIRED?
              </h4>
              <div className="space-y-2 text-xs text-[#8896B0] leading-relaxed">
                <p>🔒 <strong className="text-white">Security:</strong> Protects your account from unauthorised withdrawals</p>
                <p>⚖️ <strong className="text-white">Legal:</strong> Required under Papua New Guinea anti-money laundering laws</p>
                <p>✅ <strong className="text-white">One-time only:</strong> Once verified, you can withdraw anytime with no further checks</p>
                <p>💨 <strong className="text-white">Fast:</strong> Verification usually completes within 24 hours</p>
              </div>
            </div>

            {/* Withdrawal methods */}
            <div>
              <p className="text-xs text-[#8896B0] tracking-widest mb-3 font-medium">WITHDRAWAL METHODS (AFTER VERIFICATION)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 opacity-50">
                {[
                  { icon: 'VISA', name: 'Visa Debit Card' },
                  { icon: 'MC', name: 'Mastercard' },
                  { icon: '🏢', name: 'Physical Shop Collection' },
                ].map(m => (
                  <div key={m.name} className="flex items-center gap-2 bg-[#0D1B3E] border border-[#2756CC]/10 rounded-lg px-3 py-2.5">
                    <Lock size={11} className="text-[#8896B0] flex-shrink-0" />
                    <span className="text-xs text-[#8896B0]">{m.name}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#8896B0]/50 mt-2 text-center">Unlocked after ID verification</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
