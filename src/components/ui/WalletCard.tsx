import Link from 'next/link'
import { Wallet, ArrowUpRight, ArrowDownLeft, TrendingUp, Plus } from 'lucide-react'
import { formatKina } from '@/lib/utils'
import type { Transaction } from '@/lib/types'

interface Props { available: number; total: number; recentTx?: Transaction[] }

const txIcon = (type: string) => {
  if (type === 'bet') return <ArrowUpRight size={12} className="text-red-400" />
  if (type === 'payout' || type === 'deposit' || type === 'admin_credit') return <ArrowDownLeft size={12} className="text-green-400" />
  return <TrendingUp size={12} className="text-blue-400" />
}
const txColor = (type: string) => (type === 'bet' || type === 'withdrawal') ? 'text-red-400' : 'text-green-400'

export default function WalletCard({ available, total, recentTx }: Props) {
  return (
    <div className="bg-gradient-to-br from-[#2756CC] to-[#1A3DB8] rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'repeating-linear-gradient(-45deg,#F5C518 0,#F5C518 1px,transparent 0,transparent 50%)', backgroundSize: '16px 16px' }} />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <Wallet size={16} className="text-[#F5C518]" />
          <span className="text-xs text-[#B8C4D8] tracking-widest">WALLET BALANCE</span>
        </div>
        <div className="font-display text-5xl text-[#F5C518] tracking-wide leading-none mb-1">
          {formatKina(available)}
        </div>
        <div className="text-sm text-[#B8C4D8] mb-5">Available to bet</div>
        <div className="flex gap-3">
          <Link href="/wallet" className="flex items-center gap-1.5 bg-[#F5C518] text-[#0D1B3E] text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#FFD94A] transition-all press">
            <Plus size={13} />Deposit
          </Link>
          <Link href="/bets" className="flex items-center gap-1.5 border border-white/20 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-white/8 transition-all">
            View Bets
          </Link>
        </div>
      </div>
    </div>
  )
}
