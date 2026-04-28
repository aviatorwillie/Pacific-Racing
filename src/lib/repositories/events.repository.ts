import { getAdminClient } from '@/lib/supabase/admin'
import type { Event, EventWithParticipants, Participant } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DB = any

export const eventsRepository = {

  async findAll(status?: string): Promise<EventWithParticipants[]> {
    const sb: DB = getAdminClient()
    let query = sb.from('events').select('*, participants(*)').order('date', { ascending: true })
    if (status) query = query.eq('status', status)
    const { data, error } = await query
    if (error) throw new Error(error.message)
    return (data || []) as EventWithParticipants[]
  },

  async findTrending(): Promise<EventWithParticipants[]> {
    const sb: DB = getAdminClient()
    const { data, error } = await sb.from('events')
      .select('*, participants(*)')
      .eq('is_trending', true)
      .in('status', ['upcoming', 'live'])
      .order('date', { ascending: true })
    if (error) throw new Error(error.message)
    return (data || []) as EventWithParticipants[]
  },

  async findUpcomingWithinHours(hours: number): Promise<EventWithParticipants[]> {
    const sb: DB = getAdminClient()
    const now = new Date()
    const cutoff = new Date(now.getTime() + hours * 60 * 60 * 1000)
    const { data, error } = await sb.from('events')
      .select('*, participants(*)')
      .in('status', ['upcoming', 'live'])
      .gte('date', now.toISOString())
      .lte('date', cutoff.toISOString())
      .order('sport', { ascending: true })
      .order('league_or_type', { ascending: true })
      .order('date', { ascending: true })
    if (error) throw new Error(error.message)
    return (data || []) as EventWithParticipants[]
  },

  async findAllSorted(): Promise<EventWithParticipants[]> {
    const sb: DB = getAdminClient()
    const { data, error } = await sb.from('events')
      .select('*, participants(*)')
      .in('status', ['upcoming', 'live'])
      .order('sport', { ascending: true })
      .order('league_or_type', { ascending: true })
      .order('date', { ascending: true })
    if (error) throw new Error(error.message)
    return (data || []) as EventWithParticipants[]
  },

  async findById(id: string): Promise<EventWithParticipants | null> {
    const sb: DB = getAdminClient()
    const { data, error } = await sb.from('events').select('*, participants(*)').eq('id', id).single()
    if (error) return null
    return data as EventWithParticipants
  },

  async create(payload: Omit<Event, 'id' | 'created_at' | 'is_trending'> & { is_trending?: boolean }): Promise<Event> {
    const sb: DB = getAdminClient()
    const { data, error } = await sb.from('events').insert(payload).select().single()
    if (error) throw new Error(error.message)
    return data as Event
  },

  async updateStatus(id: string, status: Event['status']): Promise<void> {
    const sb: DB = getAdminClient()
    const { error } = await sb.from('events').update({ status }).eq('id', id)
    if (error) throw new Error(error.message)
  },

  async updateTrending(id: string, is_trending: boolean): Promise<void> {
    const sb: DB = getAdminClient()
    const { error } = await sb.from('events').update({ is_trending }).eq('id', id)
    if (error) throw new Error(error.message)
  },

  async addParticipant(payload: {
    event_id: string; name: string; odds: number; market_name: string; position: number | null
  }): Promise<Participant> {
    const sb: DB = getAdminClient()
    const { data, error } = await sb.from('participants').insert(payload).select().single()
    if (error) throw new Error(error.message)
    return data as Participant
  },

  async deleteEvent(id: string): Promise<void> {
    const sb: DB = getAdminClient()
    const { error } = await sb.from('events').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },
}
