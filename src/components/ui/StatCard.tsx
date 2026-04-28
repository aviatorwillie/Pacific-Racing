import { ReactNode } from 'react'

interface Props { label: string; value: string; sub?: string; icon: ReactNode; color?: string }
export default function StatCard({ label, value, sub, icon, color = 'text-white' }: Props) {
  return (
    <div className="bg-[#0D1B3E] border border-[#2756CC]/15 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="text-[#F5C518]">{icon}</div>
        <span className="text-[10px] text-[#8896B0] tracking-widest font-medium">{label}</span>
      </div>
      <div className={`font-display text-2xl sm:text-3xl tracking-wide leading-none ${color}`}>{value}</div>
      {sub && <div className="text-[10px] text-[#8896B0] mt-1">{sub}</div>}
    </div>
  )
}
