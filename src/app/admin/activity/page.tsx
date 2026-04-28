'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import {
  Shield, ArrowLeft, Activity, RefreshCw,
  Search, X, Filter, Hash
} from 'lucide-react'

const ACTION_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  SIGN_UP:        { label: 'User Signed Up',     color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: '👤' },
  LOGIN:          { label: 'User Logged In',      color: 'text-[#8896B0] bg-[#8896B0]/10 border-[#8896B0]/20', icon: '🔑' },
  PLACE_BET:      { label: 'Bet Placed',          color: 'text-[#F5C518] bg-[#F5C518]/10 border-[#F5C518]/20', icon: '🎰' },
  CREATE_EVENT:   { label: 'Event Created',       color: 'text-green-400 bg-green-400/10 border-green-400/20', icon: '➕' },
  UPDATE_EVENT:   { label: 'Event Updated',       color: 'text-purple-400 bg-purple-400/10 border-purple-400/20', icon: '✏️' },
  PUBLISH_EVENT:  { label: 'Event Published',     color: 'text-green-400 bg-green-400/10 border-green-400/20', icon: '🟢' },
  CLOSE_EVENT:    { label: 'Event Closed',        color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: '🔴' },
  SETTLE_BET:     { label: 'Bet Settled',         color: 'text-purple-400 bg-purple-400/10 border-purple-400/20', icon: '⚖️' },
  CREDIT_WALLET:  { label: 'Wallet Credited',     color: 'text-green-400 bg-green-400/10 border-green-400/20', icon: '💰' },
  DELETE_EVENT:   { label: 'Event Deleted',       color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: '🗑️' },
  TOGGLE_TRENDING:{ label: 'Trending Toggled',    color: 'text-orange-400 bg-orange-400/10 border-orange-400/20', icon: '🔥' },
}

export default function AdminActivityPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearch, setActiveSearch] = useState('')

  useEffect(() => {
    const sb = createClient()
    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        router.push('/'); return
      }
      fetchLogs()
    })
  }, [router])

  const fetchLogs = useCallback(async (search?: string) => {
    setLoading(true)
    const params = new URLSearchParams({ limit: '200' })
    if (search && search.trim().length >= 2) {
      params.set('search', search.trim())
    }
    const res = await fetch(`/api/admin/activity?${params}`)
    const json = await res.json()
    setLogs(json.data || [])
    setLoading(false)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveSearch(searchQuery)
    fetchLogs(searchQuery)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setActiveSearch('')
    fetchLogs()
  }

  const filtered = filter === 'all' ? logs : logs.filter(l => {
    if (filter === 'user') return l.actor_role === 'user'
    if (filter === 'admin') return l.actor_role === 'admin'
    return l.action === filter
  })

  const formatDetails = (log: any): string => {
    const d = log.details
    if (!d) return '—'
    const parts: string[] = []
    if (d.event_name) parts.push(`Event: "${d.event_name}"`)
    if (d.selection) parts.push(`Selection: ${d.selection}`)
    if (d.stake) parts.push(`Stake: K${d.stake}`)
    if (d.odds) parts.push(`Odds: ${d.odds}`)
    if (d.potential_payout) parts.push(`Payout: K${d.potential_payout}`)
    if (d.result) parts.push(`Result: ${d.result.toUpperCase()}`)
    if (d.amount) parts.push(`Amount: K${d.amount}`)
    if (d.email && log.action === 'SIGN_UP') parts.push(d.email)
    if (d.new_status) parts.push(`→ ${d.new_status.toUpperCase()}`)
    if (d.sport) parts.push(`Sport: ${d.sport}`)
    if (d.markets_count) parts.push(`${d.markets_count} market(s)`)
    if (d.selections_count) parts.push(`${d.selections_count} selection(s)`)
    if (d.note) parts.push(`Note: ${d.note}`)
    return parts.join(' · ') || '—'
  }

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <div className="pt-20 max-w-6xl mx-auto px-4 sm:px-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-xs text-[#8896B0] hover:text-white mt-6 mb-5 group transition-colors">
          <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />Back to Admin
        </Link>

        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F5C518]/10 border border-[#F5C518]/20 rounded-xl flex items-center justify-center">
              <Activity size={20} className="text-[#F5C518]" />
            </div>
            <div>
              <h1 className="font-display text-3xl tracking-widest">ACTIVITY LOG</h1>
              <p className="text-[#8896B0] text-xs">
                {activeSearch
                  ? `Showing results for "${activeSearch}" · ${filtered.length} records`
                  : `${filtered.length} records · Immutable audit trail`}
              </p>
            </div>
          </div>
          <button onClick={() => fetchLogs(activeSearch)} className="flex items-center gap-1.5 text-xs text-[#8896B0] hover:text-white border border-[#2756CC]/20 px-3 py-2 rounded-lg transition-all">
            <RefreshCw size={12} />Refresh
          </button>
        </div>

        {/* ── Search Bar ── */}
        <div className="mb-5">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8896B0]" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by account number (PR-1000001 or ADM-10001)..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm text-white placeholder-[#8896B0]/50 border border-[#2756CC]/25 bg-[#080F22]/80 focus:outline-none focus:border-[#F5C518] transition-colors"
              />
              {searchQuery && (
                <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8896B0] hover:text-white transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>
            <button type="submit" className="flex items-center gap-1.5 bg-[#F5C518] text-[#0D1B3E] font-bold px-4 py-2.5 rounded-xl text-xs hover:bg-[#FFD94A] transition-all press">
              <Search size={12} />Search
            </button>
          </form>
          {activeSearch && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-[#8896B0]">Filtered by:</span>
              <span className="flex items-center gap-1.5 bg-[#F5C518]/10 border border-[#F5C518]/20 text-[#F5C518] text-xs font-bold px-3 py-1 rounded-full">
                <Hash size={10} />{activeSearch}
                <button onClick={clearSearch} className="ml-1 hover:text-white transition-colors"><X size={10} /></button>
              </span>
            </div>
          )}
        </div>

        {/* ── Filters ── */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Filter size={12} className="text-[#8896B0]" />
          {[
            { id: 'all', label: 'All' },
            { id: 'user', label: 'Users' },
            { id: 'admin', label: 'Admins' },
            { id: 'PLACE_BET', label: 'Bets' },
            { id: 'CREATE_EVENT', label: 'Events' },
            { id: 'SETTLE_BET', label: 'Settlements' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-all border ${
                filter === f.id ? 'bg-[#F5C518]/12 border-[#F5C518]/25 text-[#F5C518]'
                : 'bg-[#152347] border-[#2756CC]/12 text-[#8896B0] hover:text-white'
              }`}>{f.label}</button>
          ))}
        </div>

        {/* ── Log entries ── */}
        {loading ? (
          <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-16 bg-[#152347]/30 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[#8896B0] bg-[#0D1B3E]/40 border border-[#2756CC]/10 rounded-2xl">
            <Activity size={48} className="mx-auto mb-4 opacity-25" />
            <p className="text-lg font-semibold text-white mb-1">
              {activeSearch ? `No activity found for "${activeSearch}"` : 'No activity logs found'}
            </p>
            <p className="text-sm">
              {activeSearch ? 'Try a different account number or clear the search.' : 'Actions will appear here as they occur.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(log => {
              const meta = ACTION_LABELS[log.action] || { label: log.action, color: 'text-[#8896B0] bg-[#8896B0]/8 border-[#8896B0]/15', icon: '📋' }
              return (
                <div key={log.id} className="bg-[#0D1B3E] border border-[#2756CC]/10 rounded-xl px-5 py-3.5 flex items-start gap-4">
                  {/* Icon */}
                  <div className="text-xl flex-shrink-0 w-8 text-center mt-0.5">{meta.icon}</div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wider ${meta.color}`}>
                        {meta.label}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border tracking-wider ${
                        log.actor_role === 'admin' ? 'text-[#F5C518] bg-[#F5C518]/8 border-[#F5C518]/15' : 'text-blue-400 bg-blue-400/8 border-blue-400/15'
                      }`}>{log.actor_role?.toUpperCase()}</span>

                      {/* Account number badge */}
                      {log.actor_account_number && (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded border text-[#F5C518] bg-[#F5C518]/5 border-[#F5C518]/15">
                          <Hash size={8} />{log.actor_account_number}
                        </span>
                      )}
                    </div>

                    {/* Actor name */}
                    {log.actor_name && (
                      <div className="text-xs text-white font-medium mb-0.5">
                        {log.actor_name}
                        {log.actor_email && <span className="text-[#8896B0] ml-1.5 font-normal">({log.actor_email})</span>}
                      </div>
                    )}

                    {/* Details */}
                    <div className="text-xs text-[#B8C4D8] truncate">{formatDetails(log)}</div>
                  </div>

                  {/* Time */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-[10px] text-[#8896B0]">{format(new Date(log.created_at), 'd MMM yyyy')}</div>
                    <div className="text-[10px] text-[#8896B0]">{format(new Date(log.created_at), 'h:mm:ss a')}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
