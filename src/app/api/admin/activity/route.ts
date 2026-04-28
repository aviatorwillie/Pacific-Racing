import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { usersRepository } from '@/lib/repositories/users.repository'
import { activityLogger } from '@/lib/services/activity.service'
import { apiResponse, apiError } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)
  const profile = await usersRepository.findById(user.id)
  if (profile?.role !== 'admin') return apiError('Forbidden', 403)

  try {
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '100')
    const search = req.nextUrl.searchParams.get('search')?.trim()

    let logs
    if (search && search.length >= 2) {
      logs = await activityLogger.searchByAccountNumber(search, Math.min(limit, 200))
    } else {
      logs = await activityLogger.getRecent(Math.min(limit, 200))
    }

    return apiResponse(logs)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
