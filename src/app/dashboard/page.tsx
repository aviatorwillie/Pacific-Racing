'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import EventCard from '@/components/ui/EventCard'
import WalletCard from '@/components/ui/WalletCard'
import StatCard from '@/components/ui/StatCard'
import { createClient } from '@/lib/supabase/client'
import { formatKina, getStatusColor } from '@/lib/utils'
import {
  Trophy, Clock, ArrowRight, CheckCircle,
  Copy, Activity
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [wallet, setWallet] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [bets, setBets] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const [wRes, evRes, bRes, pRes, actRes] = await Promise.all([
        fetch('/api/wallet').then(r => r.json()),
        fetch('/api/events').then(r => r.json()),
        fetch('/api/bets').then(r => r.json()),
        fetch('/api/profile').then(r => r.json()),
        fetch('/api/activity').then(r => r.json()),
      ])
      if (wRes.data) { setWallet(wRes.data.balance); setTransactions(wRes.data.transactions?.slice(0, 5) || []) }
      if (evRes.data) setEvents(evRes.data.filter((e: any) => e.status !== 'closed').slice(0, 3))
      if (bRes.data) setBets(bRes.data.slice(0, 3))
      if (pRes.data) setProfile(pRes.data)
      if (actRes.data) setRecentActivity(actRes.data)
      setLoading(false)
    })
  }, [router])

  const copyPR = () => {
    const num = profile?.pr_account_number || profile?.admin_number
    if (!num) return
    navigator.clipboard.writeText(num)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#F5C518] border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  )

  const pendingBets = bets.filter(b => b.status === 'pending').length
  const wonBets = bets.filter(b => b.status === 'won')
  const userName = profile?.given_names || user?.email?.split('@')[0]

  const formatActivityLine = (log: any) => {
    const d = log.details || {}
    const role = log.actor_role === 'admin' ? 'Admin' : 'User'
    switch (log.action) {
      case 'CREATE_EVENT': return `${role} created event "${d.event_name || '?'}"`
      case 'PUBLISH_EVENT': return `${role} published "${d.event_name || '?'}" → LIVE`
      case 'CLOSE_EVENT': return `${role} closed "${d.event_name || '?'}"`
      case 'PLACE_BET': return `${role} placed K${d.stake || '?'} on ${d.selection || '?'}`
      case 'SETTLE_BET': return `${role} settled bet as ${d.result?.toUpperCase() || '?'}`
      case 'SIGN_UP': return `New user signed up`
      case 'LOGIN': return `User logged in`
      case 'CREDIT_WALLET': return `Admin credited K${d.amount || '?'} to wallet`
      default: return `${role}: ${log.action?.replace(/_/g, ' ')}`
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar showBalance />
      <div className="pt-20 pb-12 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-6 fade-up">
          <h1 className="font-display text-3xl sm:text-4xl tracking-widest">MY DASHBOARD</h1>
          <p className="text-[#8896B0] text-sm mt-1">
            Welcome back, <span className="text-white font-medium">{userName}</span>
            {(profile?.pr_account_number || profile?.admin_number) && (
              <>
                <span className="mx-2 text-[#2756CC]/40">·</span>
                <span className="text-[#F5C518] font-mono text-xs">
                  {profile.role === 'admin' ? `Admin #${profile.admin_number}` : profile.pr_account_number}
                </span>
                <button onClick={copyPR} className="ml-1.5 text-[#8896B0] hover:text-[#F5C518] transition-colors" title="Copy">
                  {copied ? <CheckCircle size={11} className="inline text-green-400" /> : <Copy size={11} className="inline" />}
                </button>
              </>
            )}
          </p>
        </div>

        <div className={`grid gap-6 mb-8 ${profile?.role === 'admin' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
          {profile?.role !== 'admin' && wallet && <WalletCard available={wallet.available} total={wallet.total} />}
          <div className={`grid grid-cols-2 gap-3 ${profile?.role === 'admin' ? 'sm:grid-cols-4' : 'lg:col-span-2'}`}>
            {profile?.role !== 'admin' && <StatCard label="ACTIVE BETS" value={String(pendingBets)} sub="Awaiting results" icon={<Clock size={15} />} color="text-blue-400" />}
            {profile?.role !== 'admin' && <StatCard label="TOTAL WINS" value={String(wonBets.length)} sub="All time" icon={<CheckCircle size={15} />} color="text-green-400" />}
            <StatCard label="LIVE EVENTS" value={String(events.filter(e => e.status === 'live').length)} sub="Betting open" icon={<div className="w-2 h-2 bg-green-400 rounded-full live-dot" />} color="text-green-400" />
            <StatCard label="UPCOMING" value={String(events.filter(e => e.status === 'upcoming').length)} sub="Events" icon={<Trophy size={15} />} color="text-[#F5C518]" />
            {profile?.role === 'admin' && <StatCard label="TOTAL EVENTS" value={String(events.length)} sub="All time" icon={<Trophy size={15} />} color="text-white" />}
            {profile?.role === 'admin' && <StatCard label="TOTAL USERS" value="—" sub="See Admin Panel" icon={<Clock size={15} />} color="text-blue-400" />}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: Events + Activity */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl tracking-widest">EVENTS</h2>
                <Link href="/events" className="flex items-center gap-1 text-xs text-[#8896B0] hover:text-[#F5C518]">View all <ArrowRight size={12} /></Link>
              </div>
              <div className="space-y-3">
                {events.length === 0 ? <p className="text-[#8896B0] text-sm">No events available</p>
                  : events.map(e => <EventCard key={e.id} event={e} compact />)}
              </div>
            </div>

            {/* ── RECENT ACTIVITY WIDGET ── */}
            {recentActivity.length > 0 && (
              <div className="bg-[#0D1B3E] border border-[#2756CC]/15 rounded-2xl p-5">
                <h2 className="font-display text-lg tracking-widest mb-4 flex items-center gap-2">
                  <Activity size={15} className="text-[#F5C518]" />RECENT ACTIVITY
                </h2>
                <div className="space-y-2">
                  {recentActivity.slice(0, 8).map(log => (
                    <div key={log.id} className="flex items-center gap-3 text-xs py-1.5 border-b border-[#2756CC]/6 last:border-0">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        log.action === 'PLACE_BET' ? 'bg-[#F5C518]'
                        : log.action.includes('EVENT') ? 'bg-green-400'
                        : log.action === 'SETTLE_BET' ? 'bg-purple-400'
                        : 'bg-blue-400'
                      }`} />
                      <span className="text-[#B8C4D8] flex-1 min-w-0 truncate">{formatActivityLine(log)}</span>
                      <span className="text-[#8896B0] flex-shrink-0 text-[10px]">{format(new Date(log.created_at), 'h:mm a')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column: Bets + Transactions */}
          <div className="space-y-6">
            {bets.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-xl tracking-widest">RECENT BETS</h2>
                  <Link href="/bets" className="flex items-center gap-1 text-xs text-[#8896B0] hover:text-[#F5C518]">View all <ArrowRight size={12} /></Link>
                </div>
                <div className="space-y-2">
                  {bets.map(bet => (
                    <div key={bet.id} className="flex items-center justify-between bg-[#0D1B3E] border border-[#2756CC]/12 rounded-xl px-4 py-3">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wider ${getStatusColor(bet.status)}`}>{bet.status.toUpperCase()}</span>
                        </div>
                        <div className="text-sm font-medium text-white truncate max-w-[160px]">{bet.event?.name}</div>
                        <div className="text-xs text-[#8896B0]">{bet.participant?.name} @ {bet.participant?.odds?.toFixed(2)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-white">{formatKina(bet.stake)}</div>
                        <div className={`text-xs ${bet.status === 'won' ? 'text-green-400' : 'text-[#F5C518]'}`}>→ {formatKina(bet.potential_payout)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {transactions.length > 0 && profile?.role !== 'admin' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-xl tracking-widest">TRANSACTIONS</h2>
                  <Link href="/wallet" className="flex items-center gap-1 text-xs text-[#8896B0] hover:text-[#F5C518]">View all <ArrowRight size={12} /></Link>
                </div>
                <div className="space-y-2">
                  {transactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between bg-[#0D1B3E] border border-[#2756CC]/12 rounded-xl px-4 py-3">
                      <div>
                        <div className="text-xs text-white font-medium capitalize">{tx.type.replace('_', ' ')}</div>
                        <div className="text-[10px] text-[#8896B0] mt-0.5">{tx.description || '-'}</div>
                      </div>
                      <div className={`font-bold text-sm ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.amount > 0 ? '+' : ''}{formatKina(tx.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
