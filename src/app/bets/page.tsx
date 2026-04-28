'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/client'
import { formatKina, getStatusColor } from '@/lib/utils'
import { Trophy, CheckCircle, XCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'

export default function BetsPage() {
  const router = useRouter()
  const [bets, setBets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'won' | 'lost'>('all')

  useEffect(() => {
    const sb = createClient()
    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      fetch('/api/bets').then(r => r.json()).then(d => { setBets(d.data || []); setLoading(false) })
    })
  }, [router])

  const filtered = bets.filter(b => filter === 'all' ? true : b.status === filter)
  const totalStaked = bets.reduce((s, b) => s + b.stake, 0)
  const totalWon = bets.filter(b => b.status === 'won').reduce((s, b) => s + b.potential_payout, 0)

  return (
    <div className="min-h-screen">
      <Navbar showBalance />
      <div className="pt-20 pb-12 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8 fade-up">
          <h1 className="font-display text-3xl sm:text-4xl tracking-widest">MY BETS</h1>
          <p className="text-[#8896B0] text-sm mt-1">Your complete bet history</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'TOTAL BETS', value: bets.length, color: 'text-white' },
            { label: 'PENDING', value: bets.filter(b => b.status === 'pending').length, color: 'text-yellow-400' },
            { label: 'WON', value: bets.filter(b => b.status === 'won').length, color: 'text-green-400' },
            { label: 'TOTAL WON', value: formatKina(totalWon), color: 'text-green-400' },
          ].map(s => (
            <div key={s.label} className="bg-[#0D1B3E] border border-[#2756CC]/12 rounded-xl p-4">
              <div className="text-[10px] text-[#8896B0] tracking-widest mb-1">{s.label}</div>
              <div className={`font-display text-2xl ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {(['all', 'pending', 'won', 'lost'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all border ${
                filter === s ? 'bg-[#F5C518]/12 border-[#F5C518]/25 text-[#F5C518]' : 'bg-[#152347] border-[#2756CC]/15 text-[#8896B0] hover:text-white'
              }`}>{s.toUpperCase()}</button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-[#152347]/30 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Trophy size={48} className="mx-auto mb-4 text-[#2756CC]/25" />
            <p className="text-[#8896B0] text-sm">{filter === 'all' ? 'No bets placed yet' : `No ${filter} bets`}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(bet => (
              <div key={bet.id} className="bg-[#0D1B3E] border border-[#2756CC]/12 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wider ${getStatusColor(bet.status)}`}>
                      {bet.status === 'won' && <CheckCircle size={9} />}
                      {bet.status === 'lost' && <XCircle size={9} />}
                      {bet.status === 'pending' && <Clock size={9} />}
                      {bet.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-[#8896B0]">{format(new Date(bet.created_at), 'd MMM yyyy · h:mm a')}</span>
                  </div>
                  <div className="font-semibold text-white text-sm truncate">{bet.event?.name}</div>
                  <div className="text-xs text-[#8896B0] mt-0.5">
                    <span className="text-[#F5C518]">{bet.participant?.name}</span> @ <span className="font-bold text-white">{bet.participant?.odds?.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-[#8896B0]">Stake</div>
                  <div className="font-bold text-white">{formatKina(bet.stake)}</div>
                  <div className={`text-sm font-bold mt-0.5 ${bet.status === 'won' ? 'text-green-400' : bet.status === 'lost' ? 'text-red-400 line-through opacity-50' : 'text-[#F5C518]'}`}>
                    {bet.status === 'won' ? '✓ ' : ''}{formatKina(bet.potential_payout)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
