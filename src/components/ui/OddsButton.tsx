import { TrendingUp, Check } from 'lucide-react'
import type { Participant } from '@/lib/types'

interface Props {
  participant: Participant
  selected: boolean
  onClick: () => void
  mostPicked?: boolean
  pickPct?: number
  totalBets?: number
  disabled?: boolean
}

export default function OddsButton({ participant, selected, onClick, mostPicked, pickPct, totalBets, disabled }: Props) {
  return (
    <div className="space-y-1.5">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-150 press relative ${
          disabled ? 'opacity-40 cursor-not-allowed border-[#2756CC]/10 bg-[#080F22]/30'
          : selected ? 'border-[#F5C518] bg-[#F5C518]/8 shadow-[0_0_16px_rgba(245,197,24,0.15)]'
          : 'border-[#2756CC]/20 bg-[#0D1B3E]/60 hover:border-[#F5C518]/40 hover:bg-[#F5C518]/4 cursor-pointer'
        }`}
      >
        {mostPicked && !disabled && (
          <div className="absolute -top-2.5 left-3 flex items-center gap-1 bg-[#2756CC] text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider">
            <TrendingUp size={8} />MOST PICKED
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-white text-sm truncate">{participant.name}</div>
            <div className="text-[10px] mt-0.5 text-[#8896B0]">
              {selected ? <span className="text-[#F5C518]">✓ Selected</span> : 'Click to select'}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className={`font-display text-3xl leading-none ${selected ? 'text-[#F5C518]' : 'text-[#F5C518]/80'}`}>
              {participant.odds.toFixed(2)}
            </div>
            <div className="text-[9px] text-[#8896B0] tracking-wider">ODDS</div>
          </div>
        </div>
        {selected && (
          <div className="absolute top-2 right-2 w-5 h-5 bg-[#F5C518] rounded-full flex items-center justify-center">
            <Check size={11} strokeWidth={3} className="text-[#0D1B3E]" />
          </div>
        )}
      </button>

      {/* Bet distribution bar */}
      {totalBets !== undefined && totalBets > 0 && pickPct !== undefined && (
        <div className="px-0.5">
          <div className="flex justify-between text-[9px] text-[#8896B0] mb-1">
            <span>{pickPct}% of bets</span>
          </div>
          <div className="h-1 bg-[#152347] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#2756CC] to-[#F5C518] rounded-full transition-all duration-700" style={{ width: `${pickPct}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}
