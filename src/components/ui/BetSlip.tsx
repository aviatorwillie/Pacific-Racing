'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Wallet, AlertCircle, CheckCircle, ChevronRight, Lock, Loader2 } from 'lucide-react'
import { formatKina, calcPayout } from '@/lib/utils'
import type { Event, Participant } from '@/lib/types'

interface Props {
  event: Event
  participant: Participant
  userBalance: number
  isLoggedIn: boolean
  onClose: () => void
  onSuccess: (newBalance: number) => void
}

const QUICK_STAKES = [5, 10, 20, 50, 100, 200]

export default function BetSlip({ event, participant, userBalance, isLoggedIn, onClose, onSuccess }: Props) {
  const router = useRouter()
  const [stake, setStake] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const stakeNum = parseFloat(stake) || 0
  const payout = calcPayout(stakeNum, participant.odds)
  const profit = payout - stakeNum

  const handlePlaceBet = async () => {
    if (!isLoggedIn) { router.push('/login'); return }
    if (stakeNum < 1) { setError('Minimum stake is K1.00'); return }
    if (stakeNum > userBalance) { setError(`Insufficient funds. Available: ${formatKina(userBalance)}`); return }

    setLoading(true); setError('')
    try {
      const res = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: event.id, participant_id: participant.id, stake: stakeNum }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to place bet')
      setSuccess(true)
      onSuccess(userBalance - stakeNum)
      setTimeout(() => { onClose(); router.push('/bets') }, 2000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed bottom-0 right-0 w-full sm:w-[380px] sm:bottom-6 sm:right-6 z-50 bg-[#0D1B3E] border border-green-500/30 rounded-t-2xl sm:rounded-2xl p-8 shadow-2xl text-center animate-slide-right">
        <div className="w-16 h-16 bg-green-500/15 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-1">Bet Placed!</h3>
        <p className="text-sm text-[#8896B0]">
          <span className="text-[#F5C518] font-bold">{formatKina(stakeNum)}</span> on {participant.name}
        </p>
        <p className="text-green-400 text-sm mt-1">Potential win: {formatKina(payout)}</p>
        <p className="text-[#8896B0] text-xs mt-3">Redirecting...</p>
      </div>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 sm:hidden" onClick={onClose} />
      <div className="fixed bottom-0 right-0 w-full sm:w-[380px] sm:bottom-6 sm:right-6 z-50 bg-[#0D1B3E] border border-[#2756CC]/30 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#152347] border-b border-[#2756CC]/15">
          <div>
            <div className="text-[10px] text-[#8896B0] tracking-widest">BET SLIP</div>
            <div className="font-semibold text-white text-sm truncate max-w-[240px]">{event.name}</div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#8896B0] hover:text-white hover:bg-white/8 transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Selection */}
          <div className="bg-[#080F22]/70 border border-[#F5C518]/15 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-[#8896B0] tracking-wider mb-0.5">YOUR SELECTION</div>
              <div className="font-bold text-white">{participant.name}</div>
            </div>
            <div className="text-right">
              <div className="font-display text-3xl text-[#F5C518] leading-none">{participant.odds.toFixed(2)}</div>
              <div className="text-[9px] text-[#8896B0]">ODDS</div>
            </div>
          </div>

          {/* Balance */}
          {isLoggedIn && (
            <div className="flex items-center gap-2 text-xs text-[#8896B0]">
              <Wallet size={12} className="text-[#F5C518]" />
              Available: <span className="text-[#F5C518] font-bold ml-1">{formatKina(userBalance)}</span>
            </div>
          )}

          {/* Quick stakes */}
          <div>
            <div className="text-[10px] text-[#8896B0] tracking-wider mb-2">QUICK STAKE (K)</div>
            <div className="grid grid-cols-6 gap-1.5">
              {QUICK_STAKES.map(s => (
                <button key={s} onClick={() => { setStake(String(s)); setError('') }}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all press ${
                    stakeNum === s ? 'bg-[#F5C518] text-[#0D1B3E] border-[#F5C518]'
                    : 'bg-[#152347] border-[#2756CC]/25 text-[#B8C4D8] hover:border-[#F5C518]/30'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Custom stake input */}
          <div>
            <label className="text-[10px] text-[#8896B0] tracking-wider block mb-1.5">STAKE AMOUNT</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F5C518] font-bold text-sm">K</span>
              <input
                type="number" value={stake} min="1" step="0.50"
                onChange={e => { setStake(e.target.value); setError('') }}
                placeholder="0.00"
                className="input-field pl-8 text-lg font-bold"
              />
            </div>
          </div>

          {/* Payout calc */}
          {stakeNum > 0 && (
            <div className="bg-[#080F22]/60 border border-[#2756CC]/15 rounded-xl p-4 space-y-2">
              {[['Stake', formatKina(stakeNum)], ['Odds', participant.odds.toFixed(2)]].map(([l, v]) => (
                <div key={l} className="flex justify-between text-sm">
                  <span className="text-[#8896B0]">{l}</span>
                  <span className="text-white font-medium">{v}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm border-t border-[#2756CC]/12 pt-2">
                <span className="text-[#8896B0]">Profit</span>
                <span className="text-green-400 font-semibold">+ {formatKina(profit)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white font-bold">Total payout</span>
                <span className="font-display text-2xl text-[#F5C518] leading-none">{formatKina(payout)}</span>
              </div>
            </div>
          )}

          {!isLoggedIn && (
            <p className="text-center text-xs text-[#8896B0] bg-[#152347] px-4 py-2.5 rounded-lg">
              ⚡ Don&apos;t miss out — <span className="text-[#F5C518]">login</span> to place bets
            </p>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 px-3 py-2.5 rounded-lg text-red-400 text-sm">
              <AlertCircle size={14} />{error}
            </div>
          )}

          {/* CTA */}
          {!isLoggedIn ? (
            <button onClick={() => router.push('/login')}
              className="w-full flex items-center justify-center gap-2 bg-[#2756CC] text-white font-bold py-3.5 rounded-xl hover:bg-[#3467DD] transition-all press text-sm">
              <Lock size={14} />Login to Place Bet
            </button>
          ) : (
            <button onClick={handlePlaceBet} disabled={loading || stakeNum < 1}
              className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl text-sm transition-all press ${
                stakeNum >= 1 ? 'bg-[#F5C518] text-[#0D1B3E] hover:bg-[#FFD94A] shadow-[0_0_16px_rgba(245,197,24,0.2)]'
                : 'bg-[#152347] text-[#8896B0] border border-[#2756CC]/15 cursor-not-allowed'
              }`}>
              {loading ? <><Loader2 size={15} className="animate-spin" />Placing...</>
                : stakeNum >= 1 ? <>Place Bet — {formatKina(payout)} to win <ChevronRight size={15} /></>
                : 'Enter stake to continue'}
            </button>
          )}

          <div className="flex items-center justify-center gap-4 text-[10px] text-[#8896B0]/60">
            <span>🔒 Secure</span><span>·</span><span>Instant</span><span>·</span><span>18+ Only</span>
          </div>
        </div>
      </div>
    </>
  )
}
