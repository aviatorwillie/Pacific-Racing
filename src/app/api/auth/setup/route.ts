import { NextRequest } from 'next/server'
import { authService } from '@/lib/services/auth.service'
import { apiResponse, apiError } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { user_id, email } = body
    if (!user_id || !email) return apiError('user_id and email required')

    await authService.onUserSignUp({
      user_id,
      email,
      full_name: body.full_name || null,
      given_names: body.given_names || null,
      surname: body.surname || null,
      date_of_birth: body.date_of_birth || null,
    })

    return apiResponse({ success: true }, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
