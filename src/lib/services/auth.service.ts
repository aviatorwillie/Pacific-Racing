// ── Auth Service ──────────────────────────────────────────────────────────
import { usersRepository } from '@/lib/repositories/users.repository'
import { walletService } from '@/lib/services/wallet.service'
import { activityLogger } from '@/lib/services/activity.service'

interface SignUpPayload {
  user_id: string; email: string
  full_name?: string | null; given_names?: string | null
  surname?: string | null; date_of_birth?: string | null
}

export const authService = {

  async onUserSignUp(payload: SignUpPayload): Promise<void> {
    const { user_id, email } = payload
    const isAdmin = email === process.env.NEXT_PUBLIC_ADMIN_EMAIL

    await usersRepository.upsertProfile({
      id: user_id, email,
      full_name: payload.full_name || null,
      given_names: payload.given_names || null,
      surname: payload.surname || null,
      date_of_birth: payload.date_of_birth || null,
      role: isAdmin ? 'admin' : 'user',
    })

    await walletService.getOrCreateWallet(user_id)
    if (!isAdmin) {
      await walletService.adminDeposit(user_id, 50, 'Welcome bonus — K50 free credit!')
    }

    // ── LOG: User sign up ────────────────────────────────────────────
    await activityLogger.userSignUp(user_id, email)
  },

  async getProfile(userId: string) {
    return usersRepository.findById(userId)
  },
}
