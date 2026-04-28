// ── Activity Logger ─────────────────────────────────────────────────────
// Fire-and-forget logging. Must NEVER break main application flow.

import { activityRepository } from '@/lib/repositories/activity.repository'
import type { ActivityLog } from '@/lib/types'

export const activityLogger = {

  // ── User Actions ────────────────────────────────────────────────────────
  async userSignUp(userId: string, email: string) {
    await activityRepository.create({
      actor_id: userId, actor_role: 'user', action: 'SIGN_UP',
      entity_type: 'user', entity_id: userId, details: { email },
    })
  },

  async userLogin(userId: string, email: string) {
    await activityRepository.create({
      actor_id: userId, actor_role: 'user', action: 'LOGIN',
      entity_type: 'user', entity_id: userId, details: { email },
    })
  },

  async userPlaceBet(userId: string, betId: string, details: {
    event_name: string; selection: string; stake: number; odds: number; potential_payout: number
  }) {
    await activityRepository.create({
      actor_id: userId, actor_role: 'user', action: 'PLACE_BET',
      entity_type: 'bet', entity_id: betId, details,
    })
  },

  // ── Admin Actions ───────────────────────────────────────────────────────
  async adminCreateEvent(adminId: string, eventId: string, details: {
    event_name: string; sport: string; league_or_type: string; markets_count: number; selections_count: number
  }) {
    await activityRepository.create({
      actor_id: adminId, actor_role: 'admin', action: 'CREATE_EVENT',
      entity_type: 'event', entity_id: eventId, details,
    })
  },

  async adminUpdateEvent(adminId: string, eventId: string, details: Record<string, any>) {
    await activityRepository.create({
      actor_id: adminId, actor_role: 'admin', action: 'UPDATE_EVENT',
      entity_type: 'event', entity_id: eventId, details,
    })
  },

  async adminPublishEvent(adminId: string, eventId: string, eventName: string) {
    await activityRepository.create({
      actor_id: adminId, actor_role: 'admin', action: 'PUBLISH_EVENT',
      entity_type: 'event', entity_id: eventId,
      details: { event_name: eventName, new_status: 'live' },
    })
  },

  async adminCloseEvent(adminId: string, eventId: string, eventName: string) {
    await activityRepository.create({
      actor_id: adminId, actor_role: 'admin', action: 'CLOSE_EVENT',
      entity_type: 'event', entity_id: eventId,
      details: { event_name: eventName, new_status: 'closed' },
    })
  },

  async adminSettleBet(adminId: string, betId: string, details: {
    result: 'won' | 'lost'; user_id: string; amount: number
  }) {
    await activityRepository.create({
      actor_id: adminId, actor_role: 'admin', action: 'SETTLE_BET',
      entity_type: 'bet', entity_id: betId, details,
    })
  },

  async adminCreditWallet(adminId: string, userId: string, amount: number, note: string) {
    await activityRepository.create({
      actor_id: adminId, actor_role: 'admin', action: 'CREDIT_WALLET',
      entity_type: 'wallet', entity_id: userId,
      details: { target_user: userId, amount, note },
    })
  },

  // ── Query ───────────────────────────────────────────────────────────────
  async getRecent(limit = 50): Promise<any[]> {
    return activityRepository.findRecent(limit)
  },

  async getByActor(actorId: string, limit = 30): Promise<any[]> {
    return activityRepository.findByActor(actorId, limit)
  },

  async searchByAccountNumber(accountNumber: string, limit = 100): Promise<any[]> {
    return activityRepository.searchByAccountNumber(accountNumber, limit)
  },
}
