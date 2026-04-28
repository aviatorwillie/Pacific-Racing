// ── Wallet Service ────────────────────────────────────────────────────────
// Handles wallet creation, deposits (admin-controlled in Phase 1),
// and balance retrieval.

import { walletRepository } from '@/lib/repositories/wallet.repository'
import type { Wallet, Transaction } from '@/lib/types'

export const walletService = {

  async getOrCreateWallet(userId: string): Promise<Wallet> {
    let wallet = await walletRepository.findByUserId(userId)
    if (!wallet) wallet = await walletRepository.createWallet(userId)
    return wallet
  },

  async getBalance(userId: string): Promise<{ available: number; locked: number; total: number }> {
    const wallet = await walletService.getOrCreateWallet(userId)
    return {
      total: wallet.balance,
      locked: wallet.locked_balance,
      available: wallet.balance - wallet.locked_balance,
    }
  },

  async adminDeposit(userId: string, amount: number, note?: string): Promise<void> {
    if (amount <= 0) throw new Error('Deposit amount must be positive')
    if (amount > 100_000) throw new Error('Maximum deposit is K100,000')

    await walletRepository.addBalance(userId, amount)
    await walletRepository.createTransaction({
      user_id: userId,
      type: 'admin_credit',
      amount,
      reference_id: null,
      description: note || 'Admin credit',
      status: 'completed',
    })
  },

  async getTransactionHistory(userId: string): Promise<Transaction[]> {
    return walletRepository.getTransactions(userId, 50)
  },
}
