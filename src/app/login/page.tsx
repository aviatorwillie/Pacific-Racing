'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    const { error } = await createClient().auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }

    // Log the login activity (fire and forget)
    fetch('/api/auth/login', { method: 'POST' }).catch(() => {})

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,#152347,transparent)]" />
      <div className="relative w-full max-w-md fade-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <img src="/logo.png" alt="Pacific Racing" className="w-20 h-20 object-contain" />
            <div className="font-display text-xl tracking-[0.2em] text-[#F5C518]">PACIFIC RACING</div>
            <div className="text-[9px] text-[#8896B0] tracking-widest">& SPORTS BETTING LTD</div>
          </Link>
        </div>
        <div className="glass rounded-2xl p-8 shadow-[0_8px_48px_rgba(0,0,0,0.5)]">
          <h2 className="font-display text-2xl tracking-widest mb-1">WELCOME BACK</h2>
          <p className="text-[#8896B0] text-sm mb-7">Sign in to your account</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] text-[#8896B0] tracking-widest mb-1.5">EMAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" className="input-field" />
            </div>
            <div>
              <label className="block text-[11px] text-[#8896B0] tracking-widest mb-1.5">PASSWORD</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="input-field pr-11" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8896B0] hover:text-white transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 px-3 py-2.5 rounded-lg text-red-400 text-sm"><AlertCircle size={14} />{error}</div>}
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#F5C518] text-[#0D1B3E] font-bold py-3.5 rounded-xl hover:bg-[#FFD94A] transition-all press disabled:opacity-60 mt-2">
              {loading ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                : <><LogIn size={15} />Login</>}
            </button>
          </form>
          <div className="mt-5 pt-5 border-t border-[#2756CC]/12 text-center text-sm text-[#8896B0]">
            No account? <Link href="/signup" className="text-[#F5C518] font-semibold hover:text-[#FFD94A]">Register free</Link>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-[#8896B0]/50">
            <span>🔒 SSL Secured</span><span>·</span><span>18+ Only</span><span>·</span><span>Gamble Responsibly</span>
          </div>
        </div>
      </div>
    </div>
  )
}
