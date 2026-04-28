import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-[#2756CC]/10 bg-[#0D1B3E]/40 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.png" alt="Pacific Racing" className="w-10 h-10 object-contain" />
              <div>
                <div className="font-display text-sm tracking-[0.15em] text-[#F5C518]">PACIFIC RACING</div>
                <div className="text-[9px] text-[#8896B0] tracking-wider">& SPORTS BETTING LTD</div>
              </div>
            </div>
            <p className="text-xs text-[#8896B0] leading-relaxed">
              Papua New Guinea&apos;s premier digital betting platform. Licensed by the PNG Gaming Control Board.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-widest mb-3">BETTING</h4>
            <ul className="space-y-2 text-xs text-[#8896B0]">
              {['Sports Betting', 'Horse Racing', 'Live Events', 'My Bets'].map(l => (
                <li key={l}><Link href="/events" className="hover:text-[#F5C518] transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-widest mb-3">COMPANY</h4>
            <ul className="space-y-2 text-xs text-[#8896B0]">
              {[['About Us', '/about'], ['How It Works', '/how-it-works'], ['Contact', '/contact'], ['Help', '/contact']].map(([l, h]) => (
                <li key={l}><Link href={h} className="hover:text-[#F5C518] transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-widest mb-3">PAYMENTS</h4>
            <div className="flex flex-wrap gap-2">
              {['💳 Visa', '💳 Mastercard', '🏢 Physical Shop'].map(m => (
                <span key={m} className="text-[10px] text-[#8896B0] bg-[#152347] border border-[#2756CC]/15 px-2.5 py-1 rounded">{m}</span>
              ))}
            </div>
            <p className="text-[10px] text-[#8896B0]/50 mt-2 leading-relaxed">Processed by Windcave</p>
          </div>
        </div>
        <div className="pt-6 border-t border-[#2756CC]/10 flex flex-col sm:flex-row justify-between gap-3 text-[10px] text-[#8896B0]/60">
          <p>© 2024 Pacific Racing & Sports Betting Ltd · Port Moresby, PNG · Licensed by PNG Gaming Control Board</p>
          <p>⚠️ 18+ only · Gamble Responsibly · Problem Gambling Helpline: 1800-XXX-XXX</p>
        </div>
      </div>
    </footer>
  )
}
