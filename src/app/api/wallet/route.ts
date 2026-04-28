import { createClient } from '@/lib/supabase/server'
import { walletService } from '@/lib/services/wallet.service'
import { apiResponse, apiError } from '@/lib/utils'

export async function GET() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)
  try {
    const [balance, transactions] = await Promise.all([
      walletService.getBalance(user.id),
      walletService.getTransactionHistory(user.id),
    ])
    return apiResponse({ balance, transactions })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
