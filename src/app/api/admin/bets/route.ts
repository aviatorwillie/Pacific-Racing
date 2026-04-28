import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { usersRepository } from '@/lib/repositories/users.repository'
import { betsRepository } from '@/lib/repositories/bets.repository'
import { bettingService } from '@/lib/services/betting.service'
import { apiResponse, apiError } from '@/lib/utils'

async function getAdminUser() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return null
  const p = await usersRepository.findById(user.id)
  if (p?.role !== 'admin') return null
  return user
}

export async function GET() {
  const user = await getAdminUser()
  if (!user) return apiError('Forbidden', 403)
  try {
    return apiResponse(await betsRepository.findAll(100))
  } catch (e: any) { return apiError(e.message, 500) }
}

export async function PATCH(req: NextRequest) {
  const user = await getAdminUser()
  if (!user) return apiError('Forbidden', 403)
  try {
    const { bet_id, won } = await req.json()
    await bettingService.settleBet(bet_id, won, user.id) // ← adminId passed
    return apiResponse({ success: true })
  } catch (e: any) { return apiError(e.message) }
}
