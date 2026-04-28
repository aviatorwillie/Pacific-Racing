// ═══════════════════════════════════════════════════════════════════════════
//  PACIFIC RACING — Shared TypeScript Types
// ═══════════════════════════════════════════════════════════════════════════

export type UserRole = 'user' | 'admin'

export interface Profile {
  id: string; email: string; full_name: string | null
  given_names: string | null; surname: string | null; date_of_birth: string | null
  pr_account_number: string | null; admin_number: string | null
  role: UserRole; kyc_verified: boolean; kyc_submitted: boolean
  created_at: string
}

export interface Wallet {
  id: string; user_id: string; balance: number; locked_balance: number; updated_at: string
}

export type EventStatus = 'upcoming' | 'live' | 'closed' | 'resulted'

export interface Event {
  id: string; name: string; description: string | null; date: string
  status: EventStatus; sport: string; league_or_type: string
  is_trending: boolean
  created_at: string
}

export interface Participant {
  id: string; event_id: string; market_name: string
  name: string; odds: number; position: number | null; created_at: string
}

export interface EventWithParticipants extends Event { participants: Participant[] }

export type BetStatus = 'pending' | 'won' | 'lost' | 'void'

export interface Bet {
  id: string; user_id: string; event_id: string; participant_id: string
  stake: number; potential_payout: number; status: BetStatus; created_at: string
}

export interface BetWithDetails extends Bet {
  event: Pick<Event, 'id' | 'name' | 'date' | 'status'>
  participant: Pick<Participant, 'id' | 'name' | 'odds'>
}

export type TransactionType = 'deposit' | 'withdrawal' | 'bet' | 'payout' | 'refund' | 'admin_credit'
export type TransactionStatus = 'completed' | 'pending' | 'failed'

export interface Transaction {
  id: string; user_id: string; type: TransactionType; amount: number
  reference_id: string | null; description: string | null
  status: TransactionStatus; created_at: string
}

export type ActivityAction =
  | 'SIGN_UP' | 'LOGIN' | 'PLACE_BET' | 'VIEW_EVENT'
  | 'CREATE_EVENT' | 'UPDATE_EVENT' | 'DELETE_EVENT'
  | 'UPDATE_ODDS' | 'PUBLISH_EVENT' | 'CLOSE_EVENT'
  | 'SETTLE_BET' | 'CREDIT_WALLET' | 'TOGGLE_TRENDING'

export type ActivityEntityType = 'user' | 'event' | 'bet' | 'wallet' | 'participant'

export interface ActivityLog {
  id: string
  actor_id: string | null
  actor_role: 'user' | 'admin' | 'system'
  action: ActivityAction
  entity_type: ActivityEntityType | null
  entity_id: string | null
  details: Record<string, any> | null
  created_at: string
}

export interface SportConfig {
  label: string
  categoryType: 'league' | 'type' | 'tournament'
  options: string[]
  markets: string[]
}

export interface ApiResponse<T> { data: T | null; error: string | null }
export interface PlaceBetInput { event_id: string; participant_id: string; stake: number }

// ── Event grouping for UI ───────────────────────────────────────────────
export interface LeagueGroup {
  league: string
  events: EventWithParticipants[]
}

export interface SportGroup {
  sport: string
  leagues: LeagueGroup[]
  totalEvents: number
}
