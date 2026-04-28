import { getAdminClient } from '@/lib/supabase/admin'
import type { Wallet, Transaction, TransactionType, TransactionStatus } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DB = any

export const walletRepository = {

  async findByUserId(userId: string): Promise<Wallet | null> {
    const sb: DB = getAdminClient()
    const { data } = await sb.from('wallets').select('*').eq('user_id', userId).maybeSingle()
    return data as Wallet | null
  },

  async create(userId: string): Promise<Wallet> {
    const sb: DB = getAdminClient()
    const { data, error } = await sb.from('wallets').insert({ user_id: userId, balance: 0, locked_balance: 0 }).select().single()
    if (error) throw new Error(error.message)
    return data as Wallet
  },

  async deductBalance(userId: string, amount: number): Promise<void> {
    const sb: DB = getAdminClient()
    const { error } = await sb.rpc('deduct_wallet_balance', { p_user_id: userId, p_amount: amount })
    if (error) throw new Error(error.message)
  },

  async addBalance(userId: string, amount: number): Promise<void> {
    const sb: DB = getAdminClient()
    const { error } = await sb.rpc('add_wallet_balance', { p_user_id: userId, p_amount: amount })
    if (error) throw new Error(error.message)
  },

  async getBalance(userId: string): Promise<{ available: number; total: number; locked: number }> {
    const sb: DB = getAdminClient()
    const { data } = await sb.from('wallets').select('balance, locked_balance').eq('user_id', userId).maybeSingle()
    if (!data) return { available: 0, total: 0, locked: 0 }
    return {
      total: data.balance,
      locked: data.locked_balance,
      available: data.balance - data.locked_balance,
    }
  },

  async createTransaction(payload: {
    user_id: string; type: TransactionType; amount: number
    reference_id?: string | null; description?: string | null; status: TransactionStatus
  }): Promise<Transaction> {
    const sb: DB = getAdminClient()
    const { data, error } = await sb.from('transactions').insert(payload).select().single()
    if (error) throw new Error(error.message)
    return data as Transaction
  },

  async getTransactions(userId: string, limit = 20): Promise<Transaction[]> {
    const sb: DB = getAdminClient()
    const { data } = await sb.from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return (data || []) as Transaction[]
  },
}
