'use client'
import { Flame, Clock, Grid3x3 } from 'lucide-react'

export type EventTab = 'trending' | 'upcoming' | 'all_sports'
export type UpcomingHours = 12 | 24 | 48

interface Props {
  activeTab: EventTab
  onTabChange: (tab: EventTab) => void
  upcomingHours: UpcomingHours
  onUpcomingHoursChange: (h: UpcomingHours) => void
  counts?: { trending?: number; upcoming?: number; all?: number }
}

export default function EventTabs({
  activeTab, onTabChange, upcomingHours, onUpcomingHoursChange, counts,
}: Props) {
  const tabs = [
    { id: 'trending' as const, label: 'Trending', icon: <Flame size={14} />, count: counts?.trending },
    { id: 'upcoming' as const, label: 'Upcoming', icon: <Clock size={14} />, count: counts?.upcoming },
    { id: 'all_sports' as const, label: 'All Sports', icon: <Grid3x3 size={14} />, count: counts?.all },
  ]

  return (
    <div className="mb-6">
      {/* Main tabs */}
      <div className="flex gap-1 bg-[#0D1B3E] border border-[#2756CC]/15 rounded-xl p-1 w-fit mb-4 overflow-x-auto max-w-full">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === t.id ? 'bg-[#F5C518] text-[#0D1B3E]' : 'text-[#8896B0] hover:text-white'
            }`}
          >
            {t.icon}{t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === t.id ? 'bg-[#0D1B3E]/20 text-[#0D1B3E]' : 'bg-[#152347] text-[#8896B0]'
              }`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Upcoming sub-menu */}
      {activeTab === 'upcoming' && (
        <div className="flex items-center gap-2 flex-wrap fade-up">
          <span className="text-[10px] text-[#8896B0] tracking-widest font-medium mr-1">TIME WINDOW:</span>
          {([12, 24, 48] as const).map(h => (
            <button
              key={h}
              onClick={() => onUpcomingHoursChange(h)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all border ${
                upcomingHours === h
                  ? 'bg-[#F5C518]/12 border-[#F5C518]/25 text-[#F5C518]'
                  : 'bg-[#152347] border-[#2756CC]/15 text-[#8896B0] hover:text-white'
              }`}
            >
              NEXT {h}H
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
