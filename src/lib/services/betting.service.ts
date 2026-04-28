// ── Betting Service ───────────────────────────────────────────────────────
import { walletRepository } from '@/lib/repositories/wallet.repository'
import { betsRepository } from '@/lib/repositories/bets.repository'
import { eventsRepository } from '@/lib/repositories/events.repository'
import { activityLogger } from '@/lib/services/activity.service'
import { getAdminClient } from '@/lib/supabase/admin'
import type { PlaceBetInput, BetWithDetails } from '@/lib/types'

const MIN_BET = 1
const MAX_BET = 10_000

export const bettingService = {

  async placeBet(userId: string, input: PlaceBetInput): Promise<BetWithDetails> {
    const { event_id, participant_id, stake } = input

    if (!stake || stake < MIN_BET) throw new Error(`Minimum bet is K${MIN_BET}.00`)
    if (stake > MAX_BET) throw new Error(`Maximum bet is K${MAX_BET.toLocaleString()}.00`)

    const event = await eventsRepository.findById(event_id)
    if (!event) throw new Error('Event not found')
    if (event.status === 'closed' || event.status === 'resulted') {
      throw new Error('This event is no longer accepting bets')
    }

    const participant = event.participants.find(p => p.id === participant_id)
    if (!participant) throw new Error('Participant not found')

    const wallet = await walletRepository.findByUserId(userId)
    if (!wallet) throw new Error('Wallet not found')

    const available = wallet.balance - wallet.locked_balance
    if (available < stake) throw new Error(`Insufficient funds. Available: K${available.toFixed(2)}`)

    const potential_payout = Math.round(stake * participant.odds * 100) / 100

    await walletRepository.deductBalance(userId, stake)

    const bet = await betsRepository.create({
      user_id: userId, event_id, participant_id,
      stake, potential_payout, status: 'pending',
    })

    await walletRepository.createTransaction({
      user_id: userId, type: 'bet', amount: -stake,
      reference_id: bet.id,
      description: `Bet on ${participant.name} in ${event.name}`,
      status: 'completed',
    })

    await activityLogger.userPlaceBet(userId, bet.id, {
      event_name: event.name,
      selection: participant.name,
      stake, odds: participant.odds, potential_payout,
    })

    const bets = await betsRepository.findByUser(userId)
    return bets.find(b => b.id === bet.id)!
  },

  async settleBet(betId: string, won: boolean, adminId?: string): Promise<void> {
    const sb = getAdminClient()
    // Use maybeSingle + explicit type to avoid TypeScript 'never' errors
    const { data } = await sb
      .from('bets')
      .select('*')
      .eq('id', betId)
      .maybeSingle()

    const bet = data as {
      id: string; user_id: string; stake: number
      potential_payout: number; status: string
    } | null

    if (!bet) throw new Error('Bet not found')
    if (bet.status !== 'pending') throw new Error('Bet already settled')

    const newStatus = won ? 'won' : 'lost'
    await betsRepository.updateStatus(betId, newStatus)

    if (won) {
      await walletRepository.addBalance(bet.user_id, bet.potential_payout)
      await walletRepository.createTransaction({
        user_id: bet.user_id, type: 'payout',
        amount: bet.potential_payout, reference_id: betId,
        description: 'Winning payout', status: 'completed',
      })
    }

    if (adminId) {
      await activityLogger.adminSettleBet(adminId, betId, {
        result: newStatus as 'won' | 'lost',
        user_id: bet.user_id,
        amount: won ? bet.potential_payout : bet.stake,
      })
    }
  },
}
