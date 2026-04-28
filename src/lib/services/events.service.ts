// ── Events Service ────────────────────────────────────────────────────────
import { eventsRepository } from '@/lib/repositories/events.repository'
import { betsRepository } from '@/lib/repositories/bets.repository'
import { activityLogger } from '@/lib/services/activity.service'
import type { EventWithParticipants, Event, SportGroup } from '@/lib/types'

// ── Helper: group events by sport → league ──────────────────────────────
function groupEvents(events: EventWithParticipants[]): SportGroup[] {
  const sportMap = new Map<string, Map<string, EventWithParticipants[]>>()

  for (const ev of events) {
    const sport = ev.sport || 'Other'
    const league = ev.league_or_type || 'General'
    if (!sportMap.has(sport)) sportMap.set(sport, new Map())
    const leagueMap = sportMap.get(sport)!
    if (!leagueMap.has(league)) leagueMap.set(league, [])
    leagueMap.get(league)!.push(ev)
  }

  // Sort alphabetically, then by league, then by date
  return Array.from(sportMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([sport, leagueMap]) => ({
      sport,
      leagues: Array.from(leagueMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([league, events]) => ({
          league,
          events: events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        })),
      totalEvents: Array.from(leagueMap.values()).reduce((sum, arr) => sum + arr.length, 0),
    }))
}

export const eventsService = {

  async getAll(status?: string): Promise<EventWithParticipants[]> {
    return eventsRepository.findAll(status)
  },

  async getById(id: string): Promise<EventWithParticipants | null> {
    return eventsRepository.findById(id)
  },

  // ── NEW: Trending events grouped ────────────────────────────────────────
  async getTrendingGrouped(): Promise<SportGroup[]> {
    const events = await eventsRepository.findTrending()
    return groupEvents(events)
  },

  // ── NEW: Upcoming events grouped by hours filter ────────────────────────
  async getUpcomingGrouped(hours: 12 | 24 | 48): Promise<SportGroup[]> {
    const events = await eventsRepository.findUpcomingWithinHours(hours)
    return groupEvents(events)
  },

  // ── NEW: All sports grouped alphabetically ──────────────────────────────
  async getAllSportsGrouped(): Promise<SportGroup[]> {
    const events = await eventsRepository.findAllSorted()
    return groupEvents(events)
  },

  async createEvent(payload: {
    name: string; description?: string | null; date: string
    sport: string; league_or_type?: string; is_trending?: boolean
    participants: { name: string; odds: number; market_name?: string }[]
  }, adminId?: string): Promise<EventWithParticipants> {
    if (!payload.name?.trim()) throw new Error('Event name required')
    if (!payload.date) throw new Error('Event date required')
    if (!payload.participants || payload.participants.length < 2) throw new Error('At least 2 selections required')

    payload.participants.forEach((p, i) => {
      if (!p.name?.trim()) throw new Error(`Selection ${i + 1}: name required`)
      if (!p.odds || p.odds <= 1) throw new Error(`Selection ${i + 1}: odds must be > 1.00`)
    })

    const event = await eventsRepository.create({
      name: payload.name.trim(),
      description: payload.description?.trim() || null,
      date: payload.date,
      status: 'upcoming',
      sport: payload.sport || 'Other',
      league_or_type: payload.league_or_type || '',
      is_trending: payload.is_trending || false,
    })

    const marketNames = new Set<string>()
    for (const p of payload.participants) {
      const mktName = p.market_name?.trim() || 'Head to Head'
      marketNames.add(mktName)
      await eventsRepository.addParticipant({
        event_id: event.id, name: p.name.trim(), odds: p.odds,
        market_name: mktName, position: null,
      })
    }

    if (adminId) {
      await activityLogger.adminCreateEvent(adminId, event.id, {
        event_name: payload.name.trim(), sport: payload.sport,
        league_or_type: payload.league_or_type || '',
        markets_count: marketNames.size,
        selections_count: payload.participants.length,
      })
    }

    return (await eventsRepository.findById(event.id))!
  },

  async updateStatus(id: string, status: Event['status'], adminId?: string): Promise<void> {
    const event = await eventsRepository.findById(id)
    await eventsRepository.updateStatus(id, status)
    if (adminId && event) {
      if (status === 'live') await activityLogger.adminPublishEvent(adminId, id, event.name)
      else if (status === 'closed') await activityLogger.adminCloseEvent(adminId, id, event.name)
      else await activityLogger.adminUpdateEvent(adminId, id, { event_name: event.name, new_status: status })
    }
  },

  // ── NEW: Admin can toggle trending ──────────────────────────────────────
  async toggleTrending(id: string, is_trending: boolean, adminId?: string): Promise<void> {
    const event = await eventsRepository.findById(id)
    await eventsRepository.updateTrending(id, is_trending)
    if (adminId && event) {
      await activityLogger.adminUpdateEvent(adminId, id, {
        event_name: event.name,
        field: 'is_trending',
        new_value: is_trending,
      })
    }
  },

  async getWithBetCounts(id: string): Promise<EventWithParticipants & { betCounts: Record<string, number> }> {
    const event = await eventsRepository.findById(id)
    if (!event) throw new Error('Event not found')
    const betCounts: Record<string, number> = {}
    for (const p of event.participants) {
      betCounts[p.id] = await betsRepository.countByParticipant(p.id)
    }
    return { ...event, betCounts }
  },
}
