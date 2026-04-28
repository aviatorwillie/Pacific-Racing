'use client'
import { useEffect, useState, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import EventTabs, { type EventTab, type UpcomingHours } from '@/components/ui/EventTabs'
import EventGroup from '@/components/ui/EventGroup'
import { Trophy, Flame, Clock, RefreshCw } from 'lucide-react'
import type { SportGroup } from '@/lib/types'

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<EventTab>('trending')
  const [upcomingHours, setUpcomingHours] = useState<UpcomingHours>(24)
  const [groups, setGroups] = useState<SportGroup[]>([])
  const [counts, setCounts] = useState<{ trending?: number; upcoming?: number; all?: number }>({})
  const [loading, setLoading] = useState(true)

  // ── Fetch per active tab ────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      let url = '/api/events?view=trending'
      if (activeTab === 'upcoming') url = `/api/events?view=upcoming&hours=${upcomingHours}`
      else if (activeTab === 'all_sports') url = '/api/events?view=all_sports'

      const res = await fetch(url)
      const json = await res.json()
      setGroups(json.data || [])
    } catch (e) {
      console.error('Failed to load events:', e)
      setGroups([])
    } finally {
      setLoading(false)
    }
  }, [activeTab, upcomingHours])

  // ── Fetch counts for tab badges (one-off) ───────────────────────────────
  const fetchCounts = useCallback(async () => {
    try {
      const [tr, up, all] = await Promise.all([
        fetch('/api/events?view=trending').then(r => r.json()),
        fetch(`/api/events?view=upcoming&hours=${upcomingHours}`).then(r => r.json()),
        fetch('/api/events?view=all_sports').then(r => r.json()),
      ])
      const count = (data: SportGroup[] | null | undefined) =>
        (data || []).reduce((s: number, g: SportGroup) => s + g.totalEvents, 0)
      setCounts({
        trending: count(tr.data),
        upcoming: count(up.data),
        all: count(all.data),
      })
    } catch (e) { /* silent */ }
  }, [upcomingHours])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { fetchCounts() }, [fetchCounts])

  const totalEvents = groups.reduce((s, g) => s + g.totalEvents, 0)

  // ── Loading skeleton ───────────────────────────────────────────────────
  const Skeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-[#0D1B3E]/50 border border-[#2756CC]/10 rounded-2xl p-5 animate-pulse">
          <div className="h-6 bg-[#152347] rounded w-40 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(3)].map((_, j) => <div key={j} className="h-32 bg-[#152347]/70 rounded-xl" />)}
          </div>
        </div>
      ))}
    </div>
  )

  // ── Empty state ────────────────────────────────────────────────────────
  const EmptyState = () => {
    const icons = { trending: <Flame size={48} />, upcoming: <Clock size={48} />, all_sports: <Trophy size={48} /> }
    const messages = {
      trending: { title: 'No trending events', sub: 'Check back soon for featured events handpicked by our team' },
      upcoming: { title: 'No upcoming events', sub: `No events scheduled in the next ${upcomingHours} hours. Try a longer window.` },
      all_sports: { title: 'No events available', sub: 'The calendar is empty — new events coming soon!' },
    }
    const m = messages[activeTab]
    return (
      <div className="text-center py-20 text-[#8896B0] bg-[#0D1B3E]/40 border border-[#2756CC]/10 rounded-2xl">
        <div className="mx-auto mb-4 opacity-25">{icons[activeTab]}</div>
        <p className="text-lg font-semibold text-white mb-1">{m.title}</p>
        <p className="text-sm">{m.sub}</p>
      </div>
    )
  }

  // ── Header config per tab ──────────────────────────────────────────────
  const tabHeader = {
    trending: {
      icon: <Flame size={22} className="text-[#F5C518]" />,
      title: 'TRENDING',
      subtitle: 'Featured events handpicked by our team',
    },
    upcoming: {
      icon: <Clock size={22} className="text-[#F5C518]" />,
      title: 'UPCOMING',
      subtitle: `Events in the next ${upcomingHours} hours`,
    },
    all_sports: {
      icon: <Trophy size={22} className="text-[#F5C518]" />,
      title: 'ALL SPORTS',
      subtitle: 'Complete events calendar — all sports and leagues',
    },
  }
  const header = tabHeader[activeTab]

  return (
    <div className="min-h-screen">
      <Navbar showBalance />
      <div className="pt-20 pb-12 max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Header ── */}
        <div className="mb-6 fade-up">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-1">
                {header.icon}
                <h1 className="font-display text-3xl sm:text-4xl tracking-widest">{header.title}</h1>
                {totalEvents > 0 && (
                  <span className="bg-[#F5C518]/10 border border-[#F5C518]/20 text-[#F5C518] text-xs font-bold px-2.5 py-1 rounded-full tracking-wider">
                    {totalEvents} {totalEvents === 1 ? 'EVENT' : 'EVENTS'}
                  </span>
                )}
              </div>
              <p className="text-[#8896B0] text-sm">{header.subtitle}</p>
            </div>
            <button onClick={fetchData} className="flex items-center gap-1.5 text-xs text-[#8896B0] hover:text-white border border-[#2756CC]/15 hover:border-[#2756CC]/30 px-3 py-2 rounded-lg transition-all">
              <RefreshCw size={11} />Refresh
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <EventTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          upcomingHours={upcomingHours}
          onUpcomingHoursChange={setUpcomingHours}
          counts={counts}
        />

        {/* ── Content ── */}
        {loading ? <Skeleton /> : groups.length === 0 ? <EmptyState /> : (
          <div className="space-y-4 fade-up">
            {groups.map(g => (
              <EventGroup
                key={g.sport}
                group={g}
                defaultOpen={activeTab === 'trending' || groups.length <= 3}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
