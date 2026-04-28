'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/client'
import { formatKina, getStatusColor } from '@/lib/utils'
import { SPORT_CONFIG } from '@/lib/config/sports'
import {
  Shield, Plus, Minus, Trophy, Users, BarChart2, Activity,
  ChevronDown, ChevronUp, Loader2, CheckCircle, XCircle,
  AlertTriangle, Save, Trash2, Hash, CreditCard, ExternalLink,
  Wallet, Search, User
} from 'lucide-react'
import { format } from 'date-fns'

type AdminTab = 'overview' | 'events' | 'bets' | 'users' | 'credit'

interface Selection { name: string; odds: string }
interface Market { name: string; selections: Selection[] }
interface EventForm {
  name: string; description: string; date: string
  sport_key: string; league_or_type: string
  is_trending: boolean
  markets: Market[]
}

function emptySelection(): Selection { return { name: '', odds: '' } }
function emptyMarket(name = ''): Market { return { name, selections: [emptySelection(), emptySelection()] } }
function emptyForm(): EventForm {
  const firstKey = Object.keys(SPORT_CONFIG)[0]
  return { name: '', description: '', date: '', sport_key: firstKey, league_or_type: '', is_trending: false, markets: [emptyMarket(SPORT_CONFIG[firstKey].markets[0])] }
}

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<AdminTab>('overview')
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<any[]>([])
  const [bets, setBets] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  const [adminProfile, setAdminProfile] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  // Event form
  const [form, setForm] = useState<EventForm>(emptyForm())
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  // Credit wallet form
  const [creditGivenNames, setCreditGivenNames] = useState('')
  const [creditSurname, setCreditSurname] = useState('')
  const [creditPR, setCreditPR] = useState('')
  const [creditAmount, setCreditAmount] = useState('')
  const [creditType, setCreditType] = useState<'withdrawable' | 'bet_credit'>('withdrawable')
  const [creditNote, setCreditNote] = useState('')
  const [creditLoading, setCreditLoading] = useState(false)
  const [creditMsg, setCreditMsg] = useState('')
  const [creditMsgType, setCreditMsgType] = useState<'success' | 'error'>('success')

  // User lookup state
  const [lookupUser, setLookupUser] = useState<any>(null)
  const [lookupStatus, setLookupStatus] = useState<'idle' | 'loading' | 'found' | 'not_found' | 'mismatch'>('idle')
  const [lookupTimer, setLookupTimer] = useState<any>(null)

  // Derived sport config
  const currentSport = useMemo(() => SPORT_CONFIG[form.sport_key], [form.sport_key])
  const availableMarkets = useMemo(() => currentSport?.markets || [], [currentSport])

  useEffect(() => {
    const sb = createClient()
    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) { router.push('/'); return }
      fetch('/api/profile').then(r => r.json()).then(d => { if (d.data) setAdminProfile(d.data) })
      fetchAll()
    })
  }, [router])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [evRes, bRes, uRes, actRes] = await Promise.all([
      fetch('/api/admin/events').then(r => r.json()),
      fetch('/api/admin/bets').then(r => r.json()),
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/admin/activity?limit=10').then(r => r.json()),
    ])
    setEvents(evRes.data || [])
    setBets(bRes.data || [])
    setUsers(uRes.data || [])
    setRecentActivity(actRes.data || [])
    setLoading(false)
  }, [])

  const updateEventStatus = async (id: string, status: string) => {
    await fetch('/api/admin/events', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    fetchAll()
  }

  const settleBet = async (bet_id: string, won: boolean) => {
    await fetch('/api/admin/bets', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bet_id, won }) })
    fetchAll()
  }

  const toggleTrending = async (id: string, is_trending: boolean) => {
    await fetch('/api/admin/events', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_trending })
    })
    fetchAll()
  }

  // ── User lookup (debounced) ───────────────────────────────────────────
  const doLookup = useCallback(async (pr: string) => {
    if (!pr || pr.length < 4) {
      setLookupStatus('idle'); setLookupUser(null); return
    }
    setLookupStatus('loading')
    try {
      const res = await fetch(`/api/admin/lookup?pr=${encodeURIComponent(pr)}`)
      const json = await res.json()
      if (json.data?.found && json.data.user) {
        setLookupUser(json.data.user)
        // Check if given names and surname match (case-insensitive partial)
        const nameMatch =
          (!creditGivenNames.trim() || json.data.user.given_names?.toLowerCase().includes(creditGivenNames.trim().toLowerCase())) &&
          (!creditSurname.trim() || json.data.user.surname?.toLowerCase().includes(creditSurname.trim().toLowerCase()))
        setLookupStatus(nameMatch ? 'found' : 'mismatch')
      } else {
        setLookupUser(null); setLookupStatus('not_found')
      }
    } catch {
      setLookupUser(null); setLookupStatus('not_found')
    }
  }, [creditGivenNames, creditSurname])

  // Re-validate whenever name fields change and we have a user
  useEffect(() => {
    if (lookupUser) {
      const nameMatch =
        (!creditGivenNames.trim() || lookupUser.given_names?.toLowerCase().includes(creditGivenNames.trim().toLowerCase())) &&
        (!creditSurname.trim() || lookupUser.surname?.toLowerCase().includes(creditSurname.trim().toLowerCase()))
      setLookupStatus(nameMatch ? 'found' : 'mismatch')
    }
  }, [creditGivenNames, creditSurname, lookupUser])

  const handlePRChange = (val: string) => {
    const upper = val.toUpperCase()
    setCreditPR(upper)
    setCreditMsg('')
    if (lookupTimer) clearTimeout(lookupTimer)
    const timer = setTimeout(() => doLookup(upper), 500)
    setLookupTimer(timer)
  }

  const handleCreditSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setCreditMsg('')
    if (lookupStatus !== 'found' || !lookupUser) {
      setCreditMsg('Please enter a valid PR account number with matching name'); setCreditMsgType('error'); return
    }
    const amt = parseFloat(creditAmount)
    if (!amt || amt <= 0) { setCreditMsg('Enter a valid amount'); setCreditMsgType('error'); return }
    if (amt > 100000) { setCreditMsg('Maximum credit is K100,000'); setCreditMsgType('error'); return }

    setCreditLoading(true)
    try {
      const res = await fetch('/api/admin/credit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: lookupUser.id,
          amount: amt,
          credit_type: creditType,
          note: creditNote.trim() || `${creditType === 'withdrawable' ? 'Cash deposit' : 'Bet credit'} via shop`,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setCreditMsg(json.data?.message || `✓ K${amt.toFixed(2)} credited successfully!`)
      setCreditMsgType('success')
      // Reset form
      setCreditGivenNames(''); setCreditSurname(''); setCreditPR('')
      setCreditAmount(''); setCreditNote(''); setLookupUser(null); setLookupStatus('idle')
      fetchAll()
    } catch (err: any) {
      setCreditMsg(err.message); setCreditMsgType('error')
    } finally {
      setCreditLoading(false)
    }
  }

  // ── Sport change handler ──────────────────────────────────────────────
  const handleSportChange = (key: string) => {
    const config = SPORT_CONFIG[key]
    if (!config) return
    setForm(f => ({
      ...f,
      sport_key: key,
      league_or_type: '',
      markets: [emptyMarket(config.markets[0] || '')],
    }))
  }

  // ── Market helpers ────────────────────────────────────────────────────
  const addMarket = () => {
    const nextMarket = availableMarkets.find(m => !form.markets.some(fm => fm.name === m)) || availableMarkets[0] || ''
    setForm(f => ({ ...f, markets: [...f.markets, emptyMarket(nextMarket)] }))
  }
  const removeMarket = (mi: number) => { if (form.markets.length <= 1) return; setForm(f => ({ ...f, markets: f.markets.filter((_, i) => i !== mi) })) }
  const updateMarketName = (mi: number, name: string) => setForm(f => { const m = [...f.markets]; m[mi] = { ...m[mi], name }; return { ...f, markets: m } })
  const addSelection = (mi: number) => setForm(f => { const m = [...f.markets]; m[mi] = { ...m[mi], selections: [...m[mi].selections, emptySelection()] }; return { ...f, markets: m } })
  const removeSelection = (mi: number, si: number) => { if (form.markets[mi].selections.length <= 2) return; setForm(f => { const m = [...f.markets]; m[mi] = { ...m[mi], selections: m[mi].selections.filter((_, i) => i !== si) }; return { ...f, markets: m } }) }
  const updateSelection = (mi: number, si: number, field: keyof Selection, val: string) => setForm(f => { const m = [...f.markets]; const s = [...m[mi].selections]; s[si] = { ...s[si], [field]: val }; m[mi] = { ...m[mi], selections: s }; return { ...f, markets: m } })

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError(''); setFormSuccess(''); setFormLoading(true)
    try {
      if (!form.name.trim()) throw new Error('Event name required')
      if (!form.date) throw new Error('Date & time required')
      const participants: any[] = []
      for (const mkt of form.markets) {
        const valid = mkt.selections.filter(s => s.name.trim() && parseFloat(s.odds) > 1)
        if (valid.length < 2) throw new Error(`Market "${mkt.name}": needs at least 2 selections with odds > 1.00`)
        valid.forEach(s => participants.push({ name: s.name.trim(), odds: parseFloat(s.odds), market_name: mkt.name.trim() }))
      }
      const res = await fetch('/api/admin/events', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(), description: form.description.trim() || null,
          date: form.date, sport: currentSport.label, league_or_type: form.league_or_type,
          is_trending: form.is_trending,
          participants,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setFormSuccess(`✓ "${form.name}" created successfully!`)
      setForm(emptyForm()); fetchAll()
    } catch (err: any) { setFormError(err.message) }
    finally { setFormLoading(false) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-[#F5C518] border-t-transparent rounded-full animate-spin" /></div>

  const totalRevenue = bets.reduce((s: number, b: any) => s + b.stake, 0)
  const pendingBets = bets.filter((b: any) => b.status === 'pending').length

  const inputLg = "w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-[#8896B0]/50 border border-[#2756CC]/25 bg-[#080F22]/80 focus:outline-none focus:border-[#F5C518] transition-colors"
  const inputMd = "w-full px-3.5 py-3 rounded-lg text-sm text-white placeholder-[#8896B0]/50 border border-[#2756CC]/20 bg-[#080F22]/80 focus:outline-none focus:border-[#F5C518] transition-colors"
  const inputSm = "w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-[#8896B0]/50 border border-[#2756CC]/20 bg-[#080F22]/80 focus:outline-none focus:border-[#F5C518] transition-colors"
  const labelLg = "block text-xs text-[#8896B0] tracking-widest font-semibold mb-2 uppercase"

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-4 fade-up flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#F5C518]/10 border border-[#F5C518]/20 rounded-xl flex items-center justify-center">
              <Shield size={22} className="text-[#F5C518]" />
            </div>
            <div>
              <h1 className="font-display text-3xl tracking-widest">ADMIN PANEL</h1>
              <p className="text-[#8896B0] text-xs mt-0.5">Pacific Racing & Sports Betting Ltd</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {adminProfile?.admin_number && (
              <div className="flex items-center gap-2 bg-[#F5C518]/8 border border-[#F5C518]/15 px-4 py-2.5 rounded-xl">
                <Hash size={13} className="text-[#F5C518]" />
                <div>
                  <div className="text-[9px] text-[#8896B0] tracking-widest">ADMIN ID</div>
                  <div className="font-display text-lg text-[#F5C518] tracking-widest leading-none">{adminProfile.admin_number}</div>
                </div>
              </div>
            )}
            <Link href="/admin/activity" className="flex items-center gap-2 bg-[#152347] border border-[#2756CC]/25 px-4 py-2.5 rounded-xl text-xs text-[#8896B0] hover:text-[#F5C518] hover:border-[#F5C518]/25 transition-all">
              <Activity size={13} />Activity Log <ExternalLink size={10} />
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { l: 'EVENTS', v: events.length, c: 'text-white' },
            { l: 'LIVE', v: events.filter((e:any) => e.status === 'live').length, c: 'text-green-400' },
            { l: 'BETS', v: bets.length, c: 'text-[#F5C518]' },
            { l: 'REVENUE', v: `K ${totalRevenue.toFixed(2)}`, c: 'text-green-400' },
          ].map(k => (
            <div key={k.l} className="bg-[#0D1B3E] border border-[#2756CC]/15 rounded-xl p-4">
              <div className="text-[9px] text-[#8896B0] tracking-widest mb-2">{k.l}</div>
              <div className={`font-display text-2xl sm:text-3xl ${k.c}`}>{k.v}</div>
            </div>
          ))}
        </div>

        {/* Tabs — wallet removed, activity moved to separate page */}
        <div className="flex gap-1 bg-[#0D1B3E] border border-[#2756CC]/15 rounded-xl p-1 w-fit mb-7 flex-wrap">
          {([
            { id: 'overview', label: 'Overview', icon: <BarChart2 size={13} /> },
            { id: 'events', label: 'Events', icon: <Trophy size={13} /> },
            { id: 'bets', label: 'Bets', icon: <CreditCard size={13} />, badge: pendingBets },
            { id: 'users', label: 'Users', icon: <Users size={13} /> },
            { id: 'credit', label: 'Credit Wallet', icon: <Wallet size={13} /> },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id as AdminTab)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? 'bg-[#F5C518] text-[#0D1B3E]' : 'text-[#8896B0] hover:text-white'}`}>
              {t.icon}{t.label}
              {'badge' in t && (t.badge as number) > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab === t.id ? 'bg-[#0D1B3E]/20 text-[#0D1B3E]' : 'bg-[#F5C518]/12 text-[#F5C518]'}`}>{t.badge}</span>}
            </button>
          ))}
        </div>

        {/* ══ OVERVIEW ══ */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-up">
            <div className="bg-[#0D1B3E] border border-[#2756CC]/15 rounded-2xl p-6">
              <h3 className="font-display text-lg tracking-widest mb-5 flex items-center gap-2">
                <Activity size={15} className="text-[#F5C518]" />RECENT ACTIVITY
              </h3>
              {recentActivity.length === 0 ? <p className="text-[#8896B0] text-sm">No activity yet</p> : (
                <div className="space-y-2.5">
                  {recentActivity.slice(0, 8).map((log: any) => (
                    <div key={log.id} className="flex items-start gap-3 text-xs border-b border-[#2756CC]/6 pb-2.5 last:border-0">
                      <span className={`flex-shrink-0 mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border tracking-wider ${
                        log.actor_role === 'admin' ? 'text-[#F5C518] bg-[#F5C518]/8 border-[#F5C518]/15' : 'text-blue-400 bg-blue-400/8 border-blue-400/15'
                      }`}>{log.actor_role === 'admin' ? 'ADM' : 'USR'}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[#B8C4D8]">{log.action.replace(/_/g, ' ')}</span>
                        {log.details?.event_name && <span className="text-[#F5C518] ml-1">&quot;{log.details.event_name}&quot;</span>}
                        {log.details?.selection && <span className="text-white ml-1">{log.details.selection}</span>}
                        {log.details?.stake && <span className="text-green-400 ml-1">K{log.details.stake}</span>}
                        {log.details?.result && <span className={`ml-1 ${log.details.result === 'won' ? 'text-green-400' : 'text-red-400'}`}>{log.details.result.toUpperCase()}</span>}
                      </div>
                      <span className="text-[#8896B0] flex-shrink-0 text-[10px]">{format(new Date(log.created_at), 'h:mm a')}</span>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/admin/activity" className="flex items-center gap-1 text-xs text-[#F5C518] hover:text-[#FFD94A] mt-4 transition-colors">
                View full activity log <ExternalLink size={10} />
              </Link>
            </div>

            <div className="bg-[#0D1B3E] border border-[#2756CC]/15 rounded-2xl p-6">
              <h3 className="font-display text-lg tracking-widest mb-5">EVENTS BY STATUS</h3>
              {(['live', 'upcoming', 'closed'] as const).map(s => {
                const count = events.filter((e: any) => e.status === s).length
                const pct = events.length ? Math.round((count / events.length) * 100) : 0
                return (
                  <div key={s} className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className={`font-bold tracking-wider ${getStatusColor(s).split(' ')[0]}`}>{s.toUpperCase()}</span>
                      <span className="text-white font-bold">{count}</span>
                    </div>
                    <div className="h-2 bg-[#152347] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#2756CC] to-[#F5C518] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ══ EVENTS ══ */}
        {tab === 'events' && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 fade-up">
            {/* Create Form */}
            <div className="xl:col-span-2">
              <div className="bg-[#0D1B3E] border border-[#2756CC]/15 rounded-2xl overflow-hidden">
                <div className="bg-[#152347] border-b border-[#2756CC]/15 px-6 py-4">
                  <h3 className="font-display text-xl tracking-widest">CREATE EVENT</h3>
                  <p className="text-[#8896B0] text-xs mt-0.5">Select sport first, then build markets and selections</p>
                </div>

                <form onSubmit={handleCreateEvent} className="p-6 space-y-6">
                  {/* ── STEP 1: SPORT + LEAGUE ── */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-[#F5C518] text-[#0D1B3E] rounded font-display text-sm flex items-center justify-center font-bold flex-shrink-0">1</div>
                      <span className="font-display text-base tracking-widest text-[#F5C518]">SPORT & CATEGORY</span>
                    </div>
                    <div className="space-y-3 pl-8">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelLg}>Sport</label>
                          <select value={form.sport_key} onChange={e => handleSportChange(e.target.value)} className={inputMd + ' cursor-pointer'}>
                            {Object.entries(SPORT_CONFIG).map(([key, cfg]) => (
                              <option key={key} value={key}>{cfg.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelLg}>
                            {currentSport.categoryType === 'league' ? 'League' : currentSport.categoryType === 'tournament' ? 'Tournament' : 'Type'}
                          </label>
                          <select value={form.league_or_type} onChange={e => setForm(f => ({ ...f, league_or_type: e.target.value }))} className={inputMd + ' cursor-pointer'}>
                            <option value="">Select...</option>
                            {currentSport.options.map(opt => <option key={opt}>{opt}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── STEP 2: EVENT DETAILS ── */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-[#F5C518] text-[#0D1B3E] rounded font-display text-sm flex items-center justify-center font-bold flex-shrink-0">2</div>
                      <span className="font-display text-base tracking-widest text-[#F5C518]">EVENT DETAILS</span>
                    </div>
                    <div className="space-y-3 pl-8">
                      <div>
                        <label className={labelLg}>Event Name</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Brisbane Broncos vs Sydney Roosters" className={inputLg} required />
                      </div>
                      <div>
                        <label className={labelLg}>Date & Time</label>
                        <input type="datetime-local" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputMd} required />
                      </div>
                      <div>
                        <label className={labelLg}>Description <span className="text-[#8896B0] font-normal normal-case">(optional)</span></label>
                        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Brief description..." className={inputMd + ' resize-none'} />
                      </div>

                      {/* ── Trending toggle ── */}
                      <label className="flex items-center justify-between gap-3 bg-[#080F22]/50 border border-[#2756CC]/15 rounded-lg px-4 py-3 cursor-pointer hover:border-[#F5C518]/30 transition-all">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">🔥</span>
                          <div>
                            <div className="text-sm font-semibold text-white">Mark as Trending</div>
                            <div className="text-[10px] text-[#8896B0]">Featured on the Trending tab</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, is_trending: !f.is_trending }))}
                          className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${form.is_trending ? 'bg-[#F5C518]' : 'bg-[#2756CC]/30'}`}
                          aria-label="Toggle trending"
                        >
                          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_trending ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-[#2756CC]/15" />

                  {/* ── STEP 3: MARKETS & SELECTIONS ── */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#F5C518] text-[#0D1B3E] rounded font-display text-sm flex items-center justify-center font-bold flex-shrink-0">3</div>
                        <span className="font-display text-base tracking-widest text-[#F5C518]">MARKETS & ODDS</span>
                        <span className="text-[10px] text-[#8896B0] bg-[#152347] px-2 py-0.5 rounded-full">{form.markets.length} market{form.markets.length !== 1 ? 's' : ''}</span>
                      </div>
                      <button type="button" onClick={addMarket} className="flex items-center gap-1.5 text-xs text-[#F5C518] hover:text-[#FFD94A] font-bold border border-[#F5C518]/25 hover:border-[#F5C518]/50 px-3 py-1.5 rounded-lg transition-all">
                        <Plus size={12} />Add Market
                      </button>
                    </div>

                    <div className="space-y-4 pl-8">
                      {form.markets.map((mkt, mi) => (
                        <div key={mi} className="bg-[#080F22]/60 border border-[#2756CC]/20 rounded-xl overflow-hidden">
                          {/* Market header */}
                          <div className="flex items-center justify-between gap-2 px-4 py-3 bg-[#152347]/40 border-b border-[#2756CC]/15">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-[10px] text-[#8896B0] bg-[#0D1B3E] border border-[#2756CC]/20 px-2 py-0.5 rounded font-bold flex-shrink-0">MKT {mi + 1}</span>
                              <select value={mkt.name} onChange={e => updateMarketName(mi, e.target.value)}
                                className="flex-1 text-sm font-semibold text-white bg-transparent border-b border-transparent focus:border-[#F5C518]/40 outline-none cursor-pointer transition-colors">
                                {availableMarkets.map(m => <option key={m} className="bg-[#0D1B3E] text-white">{m}</option>)}
                                <option value="Custom" className="bg-[#0D1B3E] text-white">Custom...</option>
                              </select>
                            </div>
                            {form.markets.length > 1 && (
                              <button type="button" onClick={() => removeMarket(mi)} className="p-1 text-[#8896B0] hover:text-red-400 rounded transition-all"><Trash2 size={13} /></button>
                            )}
                          </div>

                          {/* Selections */}
                          <div className="p-3 space-y-2">
                            <div className="grid grid-cols-[1fr_80px] gap-2 px-7 mb-1">
                              <span className="text-[9px] text-[#8896B0] tracking-widest">SELECTION</span>
                              <span className="text-[9px] text-[#8896B0] tracking-widest text-center">ODDS</span>
                            </div>
                            {mkt.selections.map((sel, si) => (
                              <div key={si} className="flex items-center gap-2">
                                <div className="w-5 h-5 flex-shrink-0 bg-[#152347] border border-[#2756CC]/20 rounded text-[9px] font-bold text-[#8896B0] flex items-center justify-center">{si + 1}</div>
                                <div className="grid grid-cols-[1fr_80px] gap-2 flex-1">
                                  <input value={sel.name} onChange={e => updateSelection(mi, si, 'name', e.target.value)} placeholder={`Selection ${si + 1}...`} className={inputSm} />
                                  <input type="number" value={sel.odds} onChange={e => updateSelection(mi, si, 'odds', e.target.value)} placeholder="2.00" min="1.01" step="0.01" className={`${inputSm} text-center font-bold text-[#F5C518]`} />
                                </div>
                                <button type="button" onClick={() => removeSelection(mi, si)} disabled={mkt.selections.length <= 2} className="p-1 text-[#8896B0] hover:text-red-400 disabled:opacity-20 transition-colors flex-shrink-0"><Minus size={12} /></button>
                              </div>
                            ))}
                            <button type="button" onClick={() => addSelection(mi)} className="flex items-center gap-1.5 text-[10px] text-[#8896B0] hover:text-[#F5C518] transition-colors mt-1 pl-7"><Plus size={10} />Add selection</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {formError && <p className="text-red-400 text-xs bg-red-500/8 border border-red-500/20 px-4 py-3 rounded-xl">{formError}</p>}
                  {formSuccess && <p className="text-green-400 text-xs bg-green-500/8 border border-green-500/20 px-4 py-3 rounded-xl">{formSuccess}</p>}

                  <button type="submit" disabled={formLoading} className="w-full flex items-center justify-center gap-2 bg-[#F5C518] text-[#0D1B3E] font-bold py-3.5 rounded-xl hover:bg-[#FFD94A] transition-all press disabled:opacity-60 text-sm">
                    {formLoading ? <><Loader2 size={15} className="animate-spin" />Creating...</> : <><Save size={15} />Publish Event</>}
                  </button>
                </form>
              </div>
            </div>

            {/* Manage Events */}
            <div className="xl:col-span-3 space-y-3">
              <h3 className="font-display text-xl tracking-widest">MANAGE EVENTS ({events.length})</h3>
              {events.length === 0 ? (
                <div className="text-center py-12 text-[#8896B0] bg-[#0D1B3E] border border-[#2756CC]/12 rounded-xl">
                  <Trophy size={36} className="mx-auto mb-3 opacity-25" /><p className="text-sm">No events yet</p>
                </div>
              ) : events.map((ev: any) => (
                <div key={ev.id} className="bg-[#0D1B3E] border border-[#2756CC]/12 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <button onClick={() => setExpandedEvent(expandedEvent === ev.id ? null : ev.id)} className="text-[#8896B0] hover:text-white transition-colors flex-shrink-0">
                      {expandedEvent === ev.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border tracking-wider ${getStatusColor(ev.status)}`}>{ev.status.toUpperCase()}</span>
                        <span className="text-[10px] text-[#8896B0]">{format(new Date(ev.date), 'd MMM yyyy · h:mm a')}</span>
                        <span className="text-[10px] text-[#F5C518]">{ev.sport}{ev.league_or_type ? ` · ${ev.league_or_type}` : ''}</span>
                      </div>
                      <div className="text-sm font-semibold text-white truncate">{ev.name}</div>
                      <div className="text-[10px] text-[#8896B0]">{ev.participants?.length || 0} selections · {ev.bets?.length || 0} bets</div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Trending toggle */}
                      <button
                        onClick={() => toggleTrending(ev.id, !ev.is_trending)}
                        title={ev.is_trending ? 'Remove from Trending' : 'Mark as Trending'}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold border tracking-wider transition-all ${
                          ev.is_trending
                            ? 'bg-[#F5C518]/15 border-[#F5C518]/30 text-[#F5C518] hover:bg-[#F5C518]/25'
                            : 'border-[#2756CC]/15 text-[#8896B0] hover:text-[#F5C518] hover:border-[#F5C518]/25'
                        }`}
                      >
                        🔥{ev.is_trending ? 'ON' : 'OFF'}
                      </button>

                      <span className="w-px h-5 bg-[#2756CC]/15 mx-1" />

                      {(['upcoming', 'live', 'closed'] as const).map(s => (
                        <button key={s} onClick={() => updateEventStatus(ev.id, s)} disabled={ev.status === s}
                          className={`px-2 py-1 rounded text-[9px] font-bold border tracking-wider transition-all disabled:opacity-50 ${ev.status === s ? getStatusColor(s) : 'border-[#2756CC]/15 text-[#8896B0] hover:text-[#F5C518] hover:border-[#F5C518]/25'}`}>
                          {s === 'upcoming' ? 'UPCOM' : s === 'live' ? 'LIVE' : 'CLOSE'}
                        </button>
                      ))}
                    </div>
                  </div>
                  {expandedEvent === ev.id && ev.participants?.length > 0 && (
                    <div className="px-4 pb-4 border-t border-[#2756CC]/8">
                      {(() => {
                        const grouped: Record<string, any[]> = {}
                        ev.participants.forEach((p: any) => { const k = p.market_name || 'Head to Head'; if (!grouped[k]) grouped[k] = []; grouped[k].push(p) })
                        return Object.entries(grouped).map(([name, parts]) => (
                          <div key={name} className="mt-3">
                            <div className="text-[10px] text-[#F5C518] tracking-widest font-bold mb-2">{name}</div>
                            <div className="flex flex-wrap gap-2">
                              {parts.map((p: any) => (
                                <div key={p.id} className="flex items-center gap-2 bg-[#152347] border border-[#2756CC]/15 px-3 py-1.5 rounded-lg">
                                  <span className="text-xs text-white">{p.name}</span>
                                  <span className="font-display text-base text-[#F5C518]">{p.odds.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      })()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ BETS ══ */}
        {tab === 'bets' && (
          <div className="fade-up">
            <h3 className="font-display text-xl tracking-widest mb-5">ALL BETS ({bets.length})</h3>
            <div className="space-y-2.5">
              {bets.map((b: any) => (
                <div key={b.id} className="flex items-center gap-4 bg-[#0D1B3E] border border-[#2756CC]/10 rounded-xl px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wider ${getStatusColor(b.status)}`}>{b.status.toUpperCase()}</span>
                      <span className="text-[10px] text-[#8896B0] font-mono">{b.user_id?.slice(0, 8)}...</span>
                      <span className="text-[10px] text-[#8896B0]">{format(new Date(b.created_at), 'd MMM · h:mm a')}</span>
                    </div>
                    <div className="text-sm font-medium text-white truncate">{b.event?.name}</div>
                    <div className="text-xs text-[#8896B0]"><span className="text-[#F5C518]">{b.participant?.name}</span> @ {b.participant?.odds?.toFixed(2)}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-white">{formatKina(b.stake)}</div>
                    <div className="text-xs text-[#F5C518]">→ {formatKina(b.potential_payout)}</div>
                  </div>
                  {b.status === 'pending' && (
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <button onClick={() => settleBet(b.id, true)} className="flex items-center gap-1 px-2.5 py-1 bg-green-500/8 border border-green-500/20 text-green-400 text-[10px] font-bold rounded-lg hover:bg-green-500/15 transition-all"><CheckCircle size={10} />WON</button>
                      <button onClick={() => settleBet(b.id, false)} className="flex items-center gap-1 px-2.5 py-1 bg-red-500/8 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-lg hover:bg-red-500/15 transition-all"><XCircle size={10} />LOST</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-start gap-3 bg-[#0D1B3E]/60 border border-[#2756CC]/8 rounded-xl px-5 py-4">
              <AlertTriangle size={14} className="text-[#F5C518] flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-[#8896B0]">Settling <strong className="text-green-400">WON</strong> credits the payout. Settling <strong className="text-red-400">LOST</strong> closes with no payout. Cannot be undone. All settlements are logged.</p>
            </div>
          </div>
        )}

        {/* ══ USERS ══ */}
        {tab === 'users' && (
          <div className="fade-up">
            <h3 className="font-display text-xl tracking-widest mb-5">ALL USERS ({users.length})</h3>
            <div className="bg-[#0D1B3E] border border-[#2756CC]/12 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead><tr className="border-b border-[#2756CC]/15">
                    {['Email', 'Account #', 'Role', 'Joined'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] text-[#8896B0] tracking-widest font-medium">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {users.map((u: any) => (
                      <tr key={u.id} className="border-b border-[#2756CC]/6 hover:bg-[#152347]/30 transition-colors">
                        <td className="px-5 py-3.5 text-sm text-white">{u.email}</td>
                        <td className="px-5 py-3.5">
                          <span className={`font-mono text-xs px-2 py-0.5 rounded border ${u.role === 'admin' ? 'text-[#F5C518] bg-[#F5C518]/8 border-[#F5C518]/15' : 'text-blue-400 bg-blue-400/8 border-blue-400/15'}`}>
                            {u.role === 'admin' ? u.admin_number : u.pr_account_number || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wider ${u.role === 'admin' ? 'text-[#F5C518] bg-[#F5C518]/8 border-[#F5C518]/20' : 'text-blue-400 bg-blue-400/8 border-blue-400/20'}`}>{u.role?.toUpperCase()}</span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-[#8896B0]">{format(new Date(u.created_at), 'd MMM yyyy')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══ CREDIT WALLET ══ */}
        {tab === 'credit' && (
          <div className="fade-up max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
                <Wallet size={20} className="text-green-400" />
              </div>
              <div>
                <h3 className="font-display text-xl tracking-widest">CREDIT USER WALLET</h3>
                <p className="text-[#8896B0] text-xs">Credit a user&apos;s wallet via physical shop deposit or promotional bonus</p>
              </div>
            </div>

            <div className="bg-[#0D1B3E] border border-[#2756CC]/15 rounded-2xl overflow-hidden">
              <div className="bg-[#152347] border-b border-[#2756CC]/15 px-6 py-4">
                <p className="text-xs text-[#8896B0] leading-relaxed">
                  Enter the customer&apos;s details below. The PR account number will be validated in real-time to ensure credits go to the correct account.
                </p>
              </div>

              <form onSubmit={handleCreditSubmit} className="p-6 space-y-5">

                {/* ── Customer Identity ── */}
                <div>
                  <div className="text-[10px] text-[#F5C518] tracking-[0.2em] font-bold mb-4 flex items-center gap-2">
                    <div className="h-px flex-1 bg-[#F5C518]/15" />
                    CUSTOMER IDENTITY
                    <div className="h-px flex-1 bg-[#F5C518]/15" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {/* Given Names */}
                    <div className="relative">
                      <label className="block text-[10px] text-[#8896B0] tracking-widest font-medium mb-1.5">GIVEN NAME(S)</label>
                      <div className="relative">
                        <input
                          value={creditGivenNames}
                          onChange={e => setCreditGivenNames(e.target.value)}
                          placeholder="e.g. John Peter"
                          className={`${inputLg} pr-10 ${
                            lookupStatus === 'found' && creditGivenNames.trim() ? 'border-green-500/40' :
                            lookupStatus === 'mismatch' && creditGivenNames.trim() ? 'border-red-500/40' : ''
                          }`}
                        />
                        {creditGivenNames.trim() && lookupStatus !== 'idle' && lookupStatus !== 'loading' && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">
                            {lookupStatus === 'found' ? '✅' : '❌'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Surname */}
                    <div className="relative">
                      <label className="block text-[10px] text-[#8896B0] tracking-widest font-medium mb-1.5">SURNAME</label>
                      <div className="relative">
                        <input
                          value={creditSurname}
                          onChange={e => setCreditSurname(e.target.value)}
                          placeholder="e.g. Kama"
                          className={`${inputLg} pr-10 ${
                            lookupStatus === 'found' && creditSurname.trim() ? 'border-green-500/40' :
                            lookupStatus === 'mismatch' && creditSurname.trim() ? 'border-red-500/40' : ''
                          }`}
                        />
                        {creditSurname.trim() && lookupStatus !== 'idle' && lookupStatus !== 'loading' && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">
                            {lookupStatus === 'found' ? '✅' : '❌'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PR Account Number */}
                  <div>
                    <label className="block text-[10px] text-[#8896B0] tracking-widest font-medium mb-1.5">PR ACCOUNT NUMBER</label>
                    <div className="relative">
                      <input
                        value={creditPR}
                        onChange={e => handlePRChange(e.target.value)}
                        placeholder="e.g. PR-1000001"
                        className={`${inputLg} pr-12 font-mono tracking-wider ${
                          lookupStatus === 'found' ? 'border-green-500/50 bg-green-500/5' :
                          lookupStatus === 'not_found' ? 'border-red-500/50 bg-red-500/5' :
                          lookupStatus === 'mismatch' ? 'border-orange-500/50 bg-orange-500/5' :
                          lookupStatus === 'loading' ? 'border-[#F5C518]/30' : ''
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {lookupStatus === 'loading' && (
                          <Loader2 size={16} className="text-[#F5C518] animate-spin" />
                        )}
                        {lookupStatus === 'found' && <span className="text-lg">✅</span>}
                        {lookupStatus === 'not_found' && <span className="text-lg">❌</span>}
                        {lookupStatus === 'mismatch' && <span className="text-lg">⚠️</span>}
                      </span>
                    </div>

                    {/* Lookup result feedback */}
                    {lookupStatus === 'found' && lookupUser && (
                      <div className="mt-2 bg-green-500/8 border border-green-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
                        <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-bold text-green-400">Account Verified ✓</div>
                          <div className="text-xs text-[#B8C4D8] mt-0.5">
                            <strong className="text-white">{lookupUser.given_names} {lookupUser.surname}</strong>
                            <span className="mx-2 text-[#2756CC]/40">·</span>
                            <span className="text-[#F5C518] font-mono">{lookupUser.pr_account_number}</span>
                            <span className="mx-2 text-[#2756CC]/40">·</span>
                            <span>{lookupUser.email}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {lookupStatus === 'not_found' && creditPR.length >= 4 && (
                      <div className="mt-2 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
                        <XCircle size={14} className="text-red-400 flex-shrink-0" />
                        <span className="text-xs text-red-400">No account found with PR number &quot;{creditPR}&quot;</span>
                      </div>
                    )}
                    {lookupStatus === 'mismatch' && lookupUser && (
                      <div className="mt-2 bg-orange-500/8 border border-orange-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
                        <AlertTriangle size={16} className="text-orange-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-bold text-orange-400">Name Mismatch ⚠️</div>
                          <div className="text-xs text-[#B8C4D8] mt-0.5">
                            Account holder: <strong className="text-white">{lookupUser.given_names} {lookupUser.surname}</strong>
                            <br />
                            Entered: <strong className="text-orange-300">{creditGivenNames} {creditSurname}</strong>
                            <br />
                            <span className="text-orange-400 mt-1 block">Please verify the customer&apos;s identity before crediting.</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Credit Details ── */}
                <div>
                  <div className="text-[10px] text-[#F5C518] tracking-[0.2em] font-bold mb-4 flex items-center gap-2">
                    <div className="h-px flex-1 bg-[#F5C518]/15" />
                    CREDIT DETAILS
                    <div className="h-px flex-1 bg-[#F5C518]/15" />
                  </div>

                  {/* Amount */}
                  <div className="mb-4">
                    <label className="block text-[10px] text-[#8896B0] tracking-widest font-medium mb-1.5">AMOUNT (KINA)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F5C518] font-bold text-sm">K</span>
                      <input
                        type="number"
                        value={creditAmount}
                        onChange={e => setCreditAmount(e.target.value)}
                        placeholder="0.00"
                        min="1" max="100000" step="0.01"
                        className={`${inputLg} pl-9 text-lg font-bold text-[#F5C518]`}
                      />
                    </div>
                  </div>

                  {/* Credit type checkboxes */}
                  <div className="mb-4">
                    <label className="block text-[10px] text-[#8896B0] tracking-widest font-medium mb-2">CREDIT TYPE</label>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                          creditType === 'withdrawable'
                            ? 'border-green-500/40 bg-green-500/8'
                            : 'border-[#2756CC]/20 bg-[#080F22]/60 hover:border-[#2756CC]/40'
                        }`}
                        onClick={() => setCreditType('withdrawable')}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                          creditType === 'withdrawable' ? 'border-green-400 bg-green-500' : 'border-[#8896B0]/40'
                        }`}>
                          {creditType === 'withdrawable' && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">Withdrawable Cash</div>
                          <div className="text-[10px] text-[#8896B0] mt-0.5 leading-relaxed">
                            Physical cash deposit. User can bet with it and withdraw it later.
                          </div>
                        </div>
                      </label>

                      <label
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                          creditType === 'bet_credit'
                            ? 'border-[#F5C518]/40 bg-[#F5C518]/8'
                            : 'border-[#2756CC]/20 bg-[#080F22]/60 hover:border-[#2756CC]/40'
                        }`}
                        onClick={() => setCreditType('bet_credit')}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                          creditType === 'bet_credit' ? 'border-[#F5C518] bg-[#F5C518]' : 'border-[#8896B0]/40'
                        }`}>
                          {creditType === 'bet_credit' && (
                            <svg className="w-3 h-3 text-[#0D1B3E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">Bet Credit</div>
                          <div className="text-[10px] text-[#8896B0] mt-0.5 leading-relaxed">
                            Promotional bonus, sign-up reward, or promo credit. For betting only.
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Note */}
                  <div className="mb-4">
                    <label className="block text-[10px] text-[#8896B0] tracking-widest font-medium mb-1.5">
                      NOTE <span className="font-normal normal-case">(optional — recorded in audit trail)</span>
                    </label>
                    <input
                      value={creditNote}
                      onChange={e => setCreditNote(e.target.value)}
                      placeholder="e.g. Cash deposit at Waigani shop, Sign-up promo K50"
                      className={inputLg}
                    />
                  </div>
                </div>

                {/* Feedback message */}
                {creditMsg && (
                  <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-sm ${
                    creditMsgType === 'success'
                      ? 'bg-green-500/8 border-green-500/20 text-green-400'
                      : 'bg-red-500/8 border-red-500/20 text-red-400'
                  }`}>
                    {creditMsgType === 'success' ? <CheckCircle size={15} className="flex-shrink-0 mt-0.5" /> : <XCircle size={15} className="flex-shrink-0 mt-0.5" />}
                    <span>{creditMsg}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={creditLoading || lookupStatus !== 'found' || !creditAmount}
                  className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl text-sm transition-all ${
                    lookupStatus === 'found' && creditAmount
                      ? 'bg-green-500 text-white hover:bg-green-400 press shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                      : 'bg-[#152347] text-[#8896B0] border border-[#2756CC]/20 cursor-not-allowed'
                  }`}
                >
                  {creditLoading ? (
                    <><Loader2 size={15} className="animate-spin" />Processing...</>
                  ) : (
                    <><Wallet size={15} />Credit K{creditAmount || '0.00'} to Account</>
                  )}
                </button>

                {lookupStatus !== 'found' && (
                  <p className="text-center text-[10px] text-[#8896B0]">
                    ⬆ Enter a valid PR account number with matching name to enable the Credit button
                  </p>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Compliance footer */}
        <div className="mt-12 flex items-start gap-3 bg-[#0D1B3E]/40 border border-[#2756CC]/8 rounded-xl px-5 py-4">
          <Shield size={13} className="text-[#F5C518] flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-[#8896B0]">All admin actions are immutably logged. Admin ID: <strong className="text-[#F5C518]">{adminProfile?.admin_number || '—'}</strong>. Compliant with PNG Gaming Control Board regulations.</p>
        </div>
      </div>
    </div>
  )
}
