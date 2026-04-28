'use client'
import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import LeagueGroup from '@/components/ui/LeagueGroup'
import type { SportGroup } from '@/lib/types'

interface Props { group: SportGroup; defaultOpen?: boolean }

const SPORT_ICONS: Record<string, string> = {
  'NRL': '🏉', 'Rugby League': '🏉', 'Rugby Union': '🏉',
  'Soccer': '⚽', 'Football': '⚽',
  'Horse Racing': '🐎', 'Greyhound Racing': '🐕',
  'Cricket': '🏏', 'AFL': '🏈', 'NBA': '🏀', 'Basketball': '🏀',
  'Tennis': '🎾', 'Boxing': '🥊', 'MMA': '🥋',
  'Boxing / MMA': '🥊',
}

export default function EventGroup({ group, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const icon = SPORT_ICONS[group.sport] || '🏆'

  return (
    <div className="mb-6 bg-[#0D1B3E]/60 border border-[#2756CC]/15 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-[#152347]/40 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl flex-shrink-0">{icon}</span>
          <div className="text-left">
            <div className="font-display text-xl tracking-widest text-white group-hover:text-[#F5C518] transition-colors">
              {group.sport.toUpperCase()}
            </div>
            <div className="text-[10px] text-[#8896B0] tracking-wider">
              {group.leagues.length} league{group.leagues.length !== 1 ? 's' : ''} · {group.totalEvents} event{group.totalEvents !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        {open ? <ChevronDown size={16} className="text-[#8896B0]" /> : <ChevronRight size={16} className="text-[#8896B0]" />}
      </button>

      {open && (
        <div className="px-5 pb-4 border-t border-[#2756CC]/10">
          <div className="pt-3">
            {group.leagues.map(lg => <LeagueGroup key={lg.league} group={lg} />)}
          </div>
        </div>
      )}
    </div>
  )
}
