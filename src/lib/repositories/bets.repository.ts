import { getAdminClient } from '@/lib/supabase/admin'
import type { Bet, BetWithDetails, BetStatus } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DB = any

export const betsRepository = {

  async findByUser(userId: string): Promise<BetWithDetails[]> {
    const sb: DB = getAdminClient()
    const { data } = await sb.from('bets')
      .select('*, event:events(id,name,date,status), participant:participants(id,name,odds)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return (data || []) as BetWithDetails[]
  },

  async findAll(limit = 100): Promise<BetWithDetails[]> {
    const sb: DB = getAdminClient()
    const { data } = await sb.from('bets')
      .select('*, event:events(id,name,date,status), participant:participants(id,name,odds)')
      .order('created_at', { ascending: false })
      .limit(limit)
    return (data || []) as BetWithDetails[]
  },

  async create(payload: Omit<Bet, 'id' | 'created_at'>): Promise<Bet> {
    const sb: DB = getAdminClient()
    const { data, error } = await sb.from('bets').insert(payload).select().single()
    if (error) throw new Error(error.message)
    return data as Bet
  },

  async updateStatus(id: string, status: BetStatus): Promise<void> {
    const sb: DB = getAdminClient()
    const { error } = await sb.from('bets').update({ status }).eq('id', id)
    if (error) throw new Error(error.message)
  },

  async countByParticipant(participantId: string): Promise<number> {
    const sb: DB = getAdminClient()
    const { count } = await sb.from('bets')
      .select('*', { count: 'exact', head: true })
      .eq('participant_id', participantId)
    return count || 0
  },
}
