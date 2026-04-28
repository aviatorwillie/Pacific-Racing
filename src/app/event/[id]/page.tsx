'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import OddsButton from '@/components/ui/OddsButton'
import BetSlip from '@/components/ui/BetSlip'
import { createClient } from '@/lib/supabase/client'
import { format, differenceInMinutes } from 'date-fns'
import { Calendar, ArrowLeft, Clock, Users, BarChart2, Info, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { getStatusColor, formatKina } from '@/lib/utils'

export default function EventPage() {
  const { id } = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<any>(null)
  const [betCounts, setBetCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [walletBalance, setWalletBalance] = useState(0)
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null)
  const [showBetSlip, setShowBetSlip] = useState(false)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetch('/api/wallet').then(r => r.json()).then(d => {
          if (d.data?.balance) setWalletBalance(d.data.balance.available)
        })
      }
    })
  }, [])

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.data) { setEvent(d.data); setBetCounts(d.data.betCounts || {}) }
        setLoading(false)
      })
    // Real-time
    const sb = createClient()
    const sub = sb.channel(`event-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants', filter: `event_id=eq.${id}` },
        () => fetch(`/api/events/${id}`).then(r => r.json()).then(d => { if (d.data) setEvent(d.data) }))
      .subscribe()
    return () => { sb.removeChannel(sub) }
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-[#F5C518] border-t-transparent rounded-full animate-spin" /></div>
  if (!event) return <div className="min-h-screen flex items-center justify-center text-[#8896B0]">Event not found</div>

  const eventDate = new Date(event.date)
  const mins = differenceInMinutes(eventDate, new Date())
  const closingSoon = mins > 0 && mins < 60
  const isClosed = event.status === 'closed' || event.status === 'resulted'
  const totalBets = Object.values(betCounts as Record<string, number>).reduce((a, b) => a + b, 0)
  const mostPickedId = Object.entries(betCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
  const sorted = [...(event.participants || [])].sort((a: any, b: any) => a.odds - b.odds)

  return (
    <div className="min-h-screen pb-36">
      <Navbar showBalance />
      <div className="pt-20 max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/events" className="inline-flex items-center gap-2 text-xs text-[#8896B0] hover:text-white mt-6 mb-5 group transition-colors">
          <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />Back to Events
        </Link>

        {/* Header card */}
        <div className="bg-[#0D1B3E] border border-[#2756CC]/15 rounded-2xl p-6 mb-5 fade-up">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border tracking-wider ${getStatusColor(event.status)}`}>
              {event.status === 'live' && <span className="w-1.5 h-1.5 bg-green-400 rounded-full live-dot inline-block mr-1.5" />}
              {event.status.toUpperCase()}
            </span>
            {closingSoon && !isClosed && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-400/8 border border-red-400/20 px-2.5 py-0.5 rounded-full urgency">
                <Clock size={9} />{mins}m LEFT
              </span>
            )}
            {totalBets > 0 && <span className="text-[10px] text-[#F5C518] bg-[#F5C518]/8 border border-[#F5C518]/12 px-2.5 py-0.5 rounded-full">{totalBets} bets placed</span>}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl tracking-widest text-white mb-3">{event.name}</h1>
          {event.description && <p className="text-[#8896B0] text-sm mb-3 leading-relaxed">{event.description}</p>}
          <div className="flex flex-wrap gap-4 text-xs text-[#8896B0]">
            <span className="flex items-center gap-1.5"><Calendar size={11} className="text-[#F5C518]" />{format(eventDate, 'EEEE, d MMMM yyyy · h:mm a')}</span>
            <span className="flex items-center gap-1.5"><Users size={11} className="text-[#F5C518]" />{event.participants?.length || 0} participants</span>
            <span className="flex items-center gap-1.5"><BarChart2 size={11} className="text-[#F5C518]" />Sport: {event.sport}</span>
          </div>
        </div>

        {isClosed && (
          <div className="flex items-center gap-3 bg-[#8896B0]/6 border border-[#8896B0]/12 rounded-xl px-5 py-3.5 mb-5">
            <Info size={15} className="text-[#8896B0] flex-shrink-0" />
            <p className="text-sm text-[#8896B0]">This event is closed. No more bets are being accepted.</p>
          </div>
        )}

        {!isClosed && (
          <h2 className="font-display text-xl tracking-widest mb-4">SELECT YOUR PICK</h2>
        )}

        {/* Odds grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {sorted.map((p: any) => {
            const count = betCounts[p.id] || 0
            const pct = totalBets > 0 ? Math.round((count / totalBets) * 100) : 0
            return (
              <OddsButton
                key={p.id}
                participant={p}
                selected={selectedParticipant?.id === p.id}
                onClick={() => {
                  if (isClosed) return
                  if (selectedParticipant?.id === p.id) { setSelectedParticipant(null); setShowBetSlip(false) }
                  else { setSelectedParticipant(p); setShowBetSlip(true) }
                }}
                mostPicked={p.id === mostPickedId && totalBets > 2}
                pickPct={pct}
                totalBets={totalBets}
                disabled={isClosed}
              />
            )
          })}
        </div>

        {/* Info box */}
        <div className="bg-[#0D1B3E]/50 border border-[#2756CC]/8 rounded-xl px-5 py-4">
          <h3 className="text-xs font-bold text-[#8896B0] tracking-widest mb-3 flex items-center gap-2"><Info size={11} />UNDERSTANDING ODDS</h3>
          <p className="text-xs text-[#8896B0] leading-relaxed">
            Decimal odds show your total return per Kina bet. Odds of <strong className="text-white">2.50</strong> means a K10 stake returns <strong className="text-green-400">K25.00</strong> (K10 stake + K15 profit).
          </p>
        </div>
      </div>

      {showBetSlip && selectedParticipant && (
        <BetSlip
          event={event}
          participant={selectedParticipant}
          userBalance={walletBalance}
          isLoggedIn={!!user}
          onClose={() => { setShowBetSlip(false); setSelectedParticipant(null) }}
          onSuccess={(nb) => { setWalletBalance(nb) }}
        />
      )}
    </div>
  )
}
