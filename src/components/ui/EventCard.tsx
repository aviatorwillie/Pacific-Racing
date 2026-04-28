import Link from 'next/link'
import { Calendar, Clock, Zap, Flame } from 'lucide-react'
import { format, differenceInMinutes } from 'date-fns'
import { getStatusColor } from '@/lib/utils'
import type { EventWithParticipants } from '@/lib/types'

interface Props { event: EventWithParticipants; compact?: boolean }

export default function EventCard({ event, compact }: Props) {
  const eventDate = new Date(event.date)
  const mins = differenceInMinutes(eventDate, new Date())
  const closingSoon = mins > 0 && mins < 60
  const isLive = event.status === 'live'
  const isTrending = event.is_trending

  return (
    <Link href={`/event/${event.id}`} className="block group">
      <div className={`relative rounded-xl border overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${
        isLive ? 'border-green-500/25 bg-gradient-to-br from-green-950/30 via-[#152347] to-[#0D1B3E]'
        : closingSoon ? 'border-red-500/25 bg-gradient-to-br from-red-950/20 via-[#152347] to-[#0D1B3E]'
        : isTrending ? 'border-[#F5C518]/25 bg-gradient-to-br from-[#F5C518]/5 via-[#152347] to-[#0D1B3E]'
        : 'border-[#2756CC]/15 bg-gradient-to-br from-[#152347] to-[#0D1B3E] hover:border-[#F5C518]/20'
      } ${compact ? 'p-4' : 'p-5'}`}>

        {isLive && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent" />}
        {isTrending && !isLive && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#F5C518] to-transparent" />}

        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wider ${getStatusColor(event.status)}`}>
            {isLive && <span className="w-1.5 h-1.5 bg-green-400 rounded-full live-dot" />}
            {event.status.toUpperCase()}
          </span>
          {isTrending && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#F5C518] bg-[#F5C518]/15 border border-[#F5C518]/30 px-2 py-0.5 rounded-full">
              <Flame size={9} />TRENDING
            </span>
          )}
          {closingSoon && !isLive && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/25 px-2 py-0.5 rounded-full urgency">
              <Clock size={9} />{mins}m LEFT
            </span>
          )}
        </div>

        <h3 className={`font-bold text-white group-hover:text-[#F5C518] transition-colors leading-tight mb-2 ${compact ? 'text-sm' : 'text-base'}`}>
          {event.name}
        </h3>

        <div className="flex items-center gap-1.5 text-[11px] text-[#8896B0] mb-3 flex-wrap">
          <Calendar size={11} className="text-[#F5C518]" />
          <span>{format(eventDate, 'EEE d MMM · h:mm a')}</span>
          {event.league_or_type && (
            <>
              <span className="text-[#2756CC]/40">·</span>
              <span className="text-[#F5C518]/80">{event.league_or_type}</span>
            </>
          )}
        </div>

        {event.participants?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.participants.slice(0, compact ? 3 : 4).map(p => (
              <div key={p.id} className="flex items-center gap-1.5 bg-[#080F22]/60 border border-[#2756CC]/15 group-hover:border-[#F5C518]/15 px-2.5 py-1 rounded-lg transition-all">
                <span className="text-[11px] text-white font-medium truncate max-w-[90px]">{p.name}</span>
                <span className="text-sm font-bold text-[#F5C518]">{p.odds.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {event.status !== 'closed' && event.participants?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#2756CC]/8 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[10px] text-[#8896B0]">
              <Zap size={9} className="text-[#F5C518]" />
              From <span className="text-[#F5C518] font-bold ml-1">{Math.min(...event.participants.map(p => p.odds)).toFixed(2)}</span>
            </div>
            <span className="text-[10px] font-bold text-[#2756CC] group-hover:text-[#F5C518] transition-colors tracking-wider">BET NOW →</span>
          </div>
        )}
      </div>
    </Link>
  )
}
