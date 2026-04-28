import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { usersRepository } from '@/lib/repositories/users.repository'
import { getAdminClient } from '@/lib/supabase/admin'
import { apiResponse, apiError } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)
  const adminProfile = await usersRepository.findById(user.id)
  if (adminProfile?.role !== 'admin') return apiError('Forbidden', 403)

  const pr = req.nextUrl.searchParams.get('pr')?.trim()
  if (!pr) return apiError('PR account number required')

  try {
    const admin = getAdminClient()
    const { data, error } = await admin
      .from('profiles')
      .select('id, email, given_names, surname, pr_account_number, role, kyc_verified')
      .eq('pr_account_number', pr)
      .maybeSingle()

    if (error || !data) {
      return apiResponse({ found: false, user: null })
    }

    // Explicit type cast to avoid TypeScript 'never' errors
    const profile = data as {
      id: string
      email: string
      given_names: string | null
      surname: string | null
      pr_account_number: string | null
      role: string
      kyc_verified: boolean
    }

    return apiResponse({
      found: true,
      user: {
        id: profile.id,
        email: profile.email,
        given_names: profile.given_names,
        surname: profile.surname,
        pr_account_number: profile.pr_account_number,
        role: profile.role,
        kyc_verified: profile.kyc_verified,
      }
    })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
