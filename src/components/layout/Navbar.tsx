'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Menu, X, Wallet, LogOut, User, Shield, Trophy } from 'lucide-react'

interface NavbarProps { showBalance?: boolean }

export default function Navbar({ showBalance }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sb = createClient()
    sb.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setIsAdmin(session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL)
        if (showBalance) {
          fetch('/api/wallet').then(r => r.json()).then(d => {
            if (d.data?.balance) setBalance(d.data.balance.available)
          })
        }
      }
    })
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [showBalance])

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.push('/')
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#0D1B3E]/95 backdrop-blur-md border-b border-[#2756CC]/20 shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img src="/logo.png" alt="Pacific Racing" className="w-10 h-10 object-contain flex-shrink-0" />
          <div className="hidden sm:block">
            <div className="font-display text-base tracking-[0.2em] text-[#F5C518] leading-none">PACIFIC RACING</div>
            <div className="text-[9px] text-[#8896B0] tracking-[0.15em]">& SPORTS BETTING LTD</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {user ? (
            <>
              <NavLink href="/dashboard" active={isActive('/dashboard')}>Dashboard</NavLink>
              <NavLink href="/events" active={isActive('/events')}><Trophy size={13} className="mr-1" />Events</NavLink>
              {!isAdmin && <NavLink href="/bets" active={isActive('/bets')}>My Bets</NavLink>}
              {!isAdmin && <NavLink href="/wallet" active={isActive('/wallet')}><Wallet size={13} className="mr-1" />Wallet</NavLink>}
              <NavLink href="/profile" active={isActive('/profile')}><User size={13} className="mr-1" />Profile</NavLink>
              {isAdmin && <NavLink href="/admin" active={isActive('/admin')} gold><Shield size={13} className="mr-1" />Admin</NavLink>}
            </>
          ) : (
            <>
              <NavLink href="/" active={pathname === '/'}>Home</NavLink>
              <NavLink href="/about" active={isActive('/about')}>About</NavLink>
              <NavLink href="/how-it-works" active={isActive('/how-it-works')}>How It Works</NavLink>
              <NavLink href="/contact" active={isActive('/contact')}>Contact</NavLink>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {balance !== null && !isAdmin && (
                <Link href="/wallet" className="hidden sm:flex items-center gap-1.5 bg-[#152347] border border-[#2756CC]/25 px-3 py-1.5 rounded-lg hover:border-[#F5C518]/30 transition-all">
                  <Wallet size={12} className="text-[#F5C518]" />
                  <span className="text-xs font-bold text-[#F5C518]">K {balance.toFixed(2)}</span>
                </Link>
              )}
              <button onClick={handleLogout} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#8896B0] hover:text-red-400 hover:bg-red-400/8 rounded-lg transition-all">
                <LogOut size={13} /> Logout
              </button>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-[#B8C4D8] hover:text-white transition-colors">Login</Link>
              <Link href="/signup" className="px-5 py-2 bg-[#F5C518] text-[#0D1B3E] text-sm font-bold rounded-lg hover:bg-[#FFD94A] transition-all press shadow-[0_0_16px_rgba(245,197,24,0.2)]">
                Join Free
              </Link>
            </div>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-[#8896B0] hover:text-white hover:bg-white/5">
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#2756CC]/20 bg-[#0D1B3E]/97 backdrop-blur-md px-4 py-3 space-y-1">
          {user ? (
            <>
              <MobileLink href="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</MobileLink>
              <MobileLink href="/events" onClick={() => setMobileOpen(false)}>Events</MobileLink>
              {!isAdmin && <MobileLink href="/bets" onClick={() => setMobileOpen(false)}>My Bets</MobileLink>}
              {!isAdmin && <MobileLink href="/wallet" onClick={() => setMobileOpen(false)}>Wallet</MobileLink>}
              <MobileLink href="/profile" onClick={() => setMobileOpen(false)}>Profile</MobileLink>
              {isAdmin && <MobileLink href="/admin" onClick={() => setMobileOpen(false)}>Admin Panel</MobileLink>}
              <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/8 rounded-lg transition-all">Logout</button>
            </>
          ) : (
            <>
              <MobileLink href="/" onClick={() => setMobileOpen(false)}>Home</MobileLink>
              <MobileLink href="/about" onClick={() => setMobileOpen(false)}>About</MobileLink>
              <MobileLink href="/how-it-works" onClick={() => setMobileOpen(false)}>How It Works</MobileLink>
              <MobileLink href="/contact" onClick={() => setMobileOpen(false)}>Contact</MobileLink>
              <div className="flex gap-2 pt-2 border-t border-[#2756CC]/15">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 text-sm font-medium text-[#B8C4D8] border border-[#2756CC]/25 rounded-lg">Login</Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 text-sm font-bold bg-[#F5C518] text-[#0D1B3E] rounded-lg">Join Free</Link>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

function NavLink({ href, active, gold, children }: { href: string; active: boolean; gold?: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      active ? (gold ? 'text-[#F5C518] bg-[#F5C518]/8' : 'text-white bg-white/8') :
      gold ? 'text-[#F5C518] hover:bg-[#F5C518]/8' : 'text-[#B8C4D8] hover:text-white hover:bg-white/5'
    }`}>
      {children}
    </Link>
  )
}

function MobileLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="block px-4 py-2.5 text-sm text-[#B8C4D8] hover:text-white hover:bg-white/5 rounded-lg transition-all">
      {children}
    </Link>
  )
}
