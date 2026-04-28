import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { usersRepository } from '@/lib/repositories/users.repository'
import { apiResponse, apiError } from '@/lib/utils'

export async function GET() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)
  try {
    const profile = await usersRepository.findById(user.id)
    if (!profile) return apiError('Profile not found', 404)
    return apiResponse(profile)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function PATCH(req: NextRequest) {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)
  try {
    const body = await req.json()
    // Only allow updating certain fields
    const updates: Record<string, any> = {}
    if (body.given_names !== undefined) updates.given_names = body.given_names
    if (body.surname !== undefined) updates.surname = body.surname
    if (body.full_name !== undefined) updates.full_name = body.full_name

    if (Object.keys(updates).length === 0) return apiError('No fields to update')

    await usersRepository.upsertProfile({ id: user.id, ...updates })
    const profile = await usersRepository.findById(user.id)
    return apiResponse(profile)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
