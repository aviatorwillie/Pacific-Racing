'use client'
import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import EventCard from '@/components/ui/EventCard'
import type { LeagueGroup as LeagueGroupType } from '@/lib/types'

interface Props { group: LeagueGroupType; defaultOpen?: boolean }

export default function LeagueGroup({ group, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 py-2 px-3 rounded-lg hover:bg-[#152347]/40 transition-colors group"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown size={14} className="text-[#8896B0]" /> : <ChevronRight size={14} className="text-[#8896B0]" />}
          <span className="font-display text-base tracking-wider text-[#F5C518] group-hover:text-[#FFD94A] transition-colors">
            {group.league}
          </span>
          <span className="text-[10px] text-[#8896B0] bg-[#152347] px-2 py-0.5 rounded-full">
            {group.events.length}
          </span>
        </div>
      </button>

      {open && (
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-1">
          {group.events.map(ev => <EventCard key={ev.id} event={ev} compact />)}
        </div>
      )}
    </div>
  )
}
