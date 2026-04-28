import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { activityLogger } from '@/lib/services/activity.service'
import { apiResponse, apiError } from '@/lib/utils'

export async function POST() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return apiError('Not authenticated', 401)

  // Fire and forget — log the login
  await activityLogger.userLogin(user.id, user.email || '')
  return apiResponse({ logged: true })
}
