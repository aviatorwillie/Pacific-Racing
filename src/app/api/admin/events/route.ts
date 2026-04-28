import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { usersRepository } from '@/lib/repositories/users.repository'
import { eventsService } from '@/lib/services/events.service'
import { apiResponse, apiError } from '@/lib/utils'

async function getAdminUser() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return null
  const profile = await usersRepository.findById(user.id)
  if (profile?.role !== 'admin') return null
  return user
}

export async function GET() {
  const user = await getAdminUser()
  if (!user) return apiError('Forbidden', 403)
  try { return apiResponse(await eventsService.getAll()) }
  catch (e: any) { return apiError(e.message, 500) }
}

export async function POST(req: NextRequest) {
  const user = await getAdminUser()
  if (!user) return apiError('Forbidden', 403)
  try {
    const body = await req.json()
    const event = await eventsService.createEvent(body, user.id)
    return apiResponse(event, 201)
  } catch (e: any) { return apiError(e.message) }
}

export async function PATCH(req: NextRequest) {
  const user = await getAdminUser()
  if (!user) return apiError('Forbidden', 403)
  try {
    const body = await req.json()
    const { id } = body

    // Trending toggle
    if (typeof body.is_trending === 'boolean') {
      await eventsService.toggleTrending(id, body.is_trending, user.id)
      return apiResponse({ success: true })
    }
    // Status change
    if (body.status) {
      await eventsService.updateStatus(id, body.status, user.id)
      return apiResponse({ success: true })
    }
    return apiError('No valid update field provided')
  } catch (e: any) { return apiError(e.message) }
}
