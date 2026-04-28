import { createClient } from '@/lib/supabase/server'
import { usersRepository } from '@/lib/repositories/users.repository'
import { apiResponse, apiError } from '@/lib/utils'

export async function GET() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)
  const profile = await usersRepository.findById(user.id)
  if (profile?.role !== 'admin') return apiError('Forbidden', 403)
  try {
    const users = await usersRepository.findAll()
    return apiResponse(users)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
