import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { usersRepository } from '@/lib/repositories/users.repository'
import { walletService } from '@/lib/services/wallet.service'
import { activityLogger } from '@/lib/services/activity.service'
import { apiResponse, apiError } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)
  const adminProfile = await usersRepository.findById(user.id)
  if (adminProfile?.role !== 'admin') return apiError('Forbidden', 403)

  try {
    const body = await req.json()
    const { user_id, amount, credit_type, note } = body

    if (!user_id) return apiError('User ID required')
    if (!amount || amount <= 0) return apiError('Amount must be positive')
    if (!credit_type) return apiError('Credit type required')

    // Verify the target user exists
    const targetUser = await usersRepository.findById(user_id)
    if (!targetUser) return apiError('User not found')
    if (targetUser.role === 'admin') return apiError('Cannot credit admin accounts')

    // Determine description
    const typeLabel = credit_type === 'withdrawable' ? 'Withdrawable cash deposit' : 'Bet credit'
    const description = note
      ? `${typeLabel} — ${note}`
      : `${typeLabel} via admin (${adminProfile.admin_number || 'admin'})`

    // Credit the wallet
    await walletService.adminDeposit(user_id, amount, description)

    // Log the activity
    await activityLogger.adminCreditWallet(user.id, user_id, amount, description)

    return apiResponse({
      success: true,
      message: `K${amount.toFixed(2)} credited to ${targetUser.given_names || targetUser.email} (${targetUser.pr_account_number})`,
    })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
