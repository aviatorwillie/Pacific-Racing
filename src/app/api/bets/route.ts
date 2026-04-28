import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { bettingService } from '@/lib/services/betting.service'
import { betsRepository } from '@/lib/repositories/bets.repository'
import { apiResponse, apiError } from '@/lib/utils'

export async function GET() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)
  try {
    const bets = await betsRepository.findByUser(user.id)
    return apiResponse(bets)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(req: NextRequest) {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)
  try {
    const body = await req.json()
    const { event_id, participant_id, stake } = body
    if (!event_id || !participant_id || !stake) {
      return apiError('event_id, participant_id, and stake are required')
    }
    const bet = await bettingService.placeBet(user.id, {
      event_id, participant_id,
      stake: parseFloat(stake),
    })
    return apiResponse(bet, 201)
  } catch (e: any) {
    return apiError(e.message)
  }
}
