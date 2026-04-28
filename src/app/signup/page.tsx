'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle, Calendar } from 'lucide-react'

// ── Age validation helper ─────────────────────────────────────────────────
function getAgeFromDOB(dd: string, mm: string, yyyy: string): number | null {
  const day = parseInt(dd, 10)
  const month = parseInt(mm, 10)
  const year = parseInt(yyyy, 10)
  if (!day || !month || !year || yyyy.length < 4) return null
  if (month < 1 || month > 12) return null
  if (day < 1 || day > 31) return null
  if (year < 1900 || year > new Date().getFullYear()) return null
  const dob = new Date(year, month - 1, day)
  if (isNaN(dob.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
  return age
}

// ── Smart DOB input component ─────────────────────────────────────────────
interface DOBInputProps {
  dd: string; mm: string; yyyy: string
  onDDChange: (v: string) => void
  onMMChange: (v: string) => void
  onYYYYChange: (v: string) => void
  error?: string
}

function DOBInput({ dd, mm, yyyy, onDDChange, onMMChange, onYYYYChange, error }: DOBInputProps) {
  const mmRef = useRef<HTMLInputElement>(null)
  const yyyyRef = useRef<HTMLInputElement>(null)

  const age = getAgeFromDOB(dd, mm, yyyy)
  const isComplete = dd.length === 2 && mm.length === 2 && yyyy.length === 4
  const isUnderage = isComplete && age !== null && age < 18
  const isValid = isComplete && age !== null && age >= 18

  const handleDD = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 2)
    onDDChange(clean)
    if (clean.length === 2) mmRef.current?.focus()
  }

  const handleMM = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 2)
    onMMChange(clean)
    if (clean.length === 2) yyyyRef.current?.focus()
  }

  const handleYYYY = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4)
    onYYYYChange(clean)
  }

  const segmentCls = `w-full text-center font-bold text-lg text-white placeholder-[#8896B0]/40
    bg-transparent border-0 outline-none focus:outline-none`

  return (
    <div>
      <label className="block text-[11px] text-[#8896B0] tracking-widest font-medium mb-1.5">
        DATE OF BIRTH *
      </label>
      <div className={`flex items-center rounded-xl border transition-all duration-200 overflow-hidden
        ${isUnderage ? 'border-red-500 bg-red-500/5'
          : isValid ? 'border-green-500/50 bg-[#080F22]/80'
          : 'border-[#2756CC]/25 bg-[#080F22]/80 focus-within:border-[#F5C518]'}
      `}>
        {/* DD */}
        <div className="flex flex-col items-center px-4 py-3 border-r border-[#2756CC]/15 flex-1">
          <input
            type="text" inputMode="numeric" value={dd}
            onChange={e => handleDD(e.target.value)}
            placeholder="DD" maxLength={2}
            className={segmentCls}
          />
          <div className="text-[9px] text-[#8896B0]/50 tracking-widest mt-0.5">DAY</div>
        </div>
        {/* Divider */}
        <div className="text-[#2756CC]/40 text-lg font-light px-1 flex-shrink-0">/</div>
        {/* MM */}
        <div className="flex flex-col items-center px-4 py-3 border-r border-[#2756CC]/15 flex-1">
          <input
            ref={mmRef}
            type="text" inputMode="numeric" value={mm}
            onChange={e => handleMM(e.target.value)}
            placeholder="MM" maxLength={2}
            className={segmentCls}
          />
          <div className="text-[9px] text-[#8896B0]/50 tracking-widest mt-0.5">MONTH</div>
        </div>
        {/* Divider */}
        <div className="text-[#2756CC]/40 text-lg font-light px-1 flex-shrink-0">/</div>
        {/* YYYY */}
        <div className="flex flex-col items-center px-4 py-3 flex-[2]">
          <input
            ref={yyyyRef}
            type="text" inputMode="numeric" value={yyyy}
            onChange={e => handleYYYY(e.target.value)}
            placeholder="YYYY" maxLength={4}
            className={segmentCls}
          />
          <div className="text-[9px] text-[#8896B0]/50 tracking-widest mt-0.5">YEAR</div>
        </div>
        {/* Status icon */}
        <div className="px-3 flex-shrink-0">
          {isValid && <CheckCircle size={16} className="text-green-400" />}
          {isUnderage && <AlertCircle size={16} className="text-red-400" />}
          {!isComplete && <Calendar size={16} className="text-[#8896B0]/30" />}
        </div>
      </div>

      {/* Age feedback */}
      {isUnderage && (
        <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1.5">
          <AlertCircle size={11} />
          You must be 18 or older to register. ({age} years old)
        </p>
      )}
      {isValid && (
        <p className="text-green-400 text-xs mt-1.5 flex items-center gap-1.5">
          <CheckCircle size={11} />
          Age verified — {age} years old ✓
        </p>
      )}
      {!isComplete && (
        <p className="text-[#8896B0]/50 text-[10px] mt-1.5">
          Enter DD then MM then YYYY — cursor moves automatically
        </p>
      )}
    </div>
  )
}

// ── Password strength indicator ───────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const checks = [
    password.length >= 6,
    password.length >= 10,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const labels = ['Weak', 'Fair', 'Good', 'Strong']
  const colors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score - 1] : 'bg-[#2756CC]/20'}`} />
        ))}
      </div>
      <p className={`text-[10px] ${score <= 1 ? 'text-red-400' : score === 2 ? 'text-orange-400' : score === 3 ? 'text-yellow-400' : 'text-green-400'}`}>
        {labels[score - 1] || 'Too short'}
      </p>
    </div>
  )
}

// ── Main Signup Page ──────────────────────────────────────────────────────
export default function SignupPage() {
  const router = useRouter()

  // Personal info
  const [givenNames, setGivenNames] = useState('')
  const [surname, setSurname] = useState('')
  const [dobDD, setDobDD] = useState('')
  const [dobMM, setDobMM] = useState('')
  const [dobYYYY, setDobYYYY] = useState('')

  // Auth
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [terms, setTerms] = useState(false)

  // State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Derived
  const age = getAgeFromDOB(dobDD, dobMM, dobYYYY)
  const dobComplete = dobDD.length === 2 && dobMM.length === 2 && dobYYYY.length === 4
  const isOver18 = dobComplete && age !== null && age >= 18
  const passwordsMatch = password && confirm && password === confirm

  // Check if all required fields are filled — gate the submit button
  const canSubmit =
    givenNames.trim().length >= 2 &&
    surname.trim().length >= 2 &&
    dobComplete &&
    isOver18 &&
    email.includes('@') &&
    password.length >= 6 &&
    passwordsMatch &&
    terms &&
    !loading

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Double-check all validations server-side
    if (!givenNames.trim()) { setError('Please enter your given name(s)'); return }
    if (!surname.trim()) { setError('Please enter your surname'); return }
    if (!dobComplete) { setError('Please enter your complete date of birth'); return }
    if (!isOver18) { setError(`You must be 18 or older to register. You are ${age} years old.`); return }
    if (!email.includes('@')) { setError('Please enter a valid email address'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (!terms) { setError('You must agree to the Terms & Conditions'); return }

    setLoading(true)

    const fullName = `${givenNames.trim()} ${surname.trim()}`
    const dob = `${dobYYYY}-${dobMM.padStart(2, '0')}-${dobDD.padStart(2, '0')}` // ISO format for DB

    const { data, error: signUpError } = await createClient().auth.signUp({ email, password })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    if (data.user) {
      await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: data.user.id,
          email,
          full_name: fullName,
          given_names: givenNames.trim(),
          surname: surname.trim(),
          date_of_birth: dob,
        }),
      })
    }

    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 2500)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center fade-up">
          <div className="w-20 h-20 bg-green-500/15 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={36} className="text-green-400" />
          </div>
          <h2 className="font-display text-3xl tracking-widest mb-2">WELCOME!</h2>
          <p className="text-white font-semibold mb-1">Account created successfully.</p>
          <p className="text-[#8896B0] text-sm">K50 free credit has been added to your wallet.</p>
          <p className="text-[#8896B0] text-xs mt-3">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  const inputCls = "input-field"
  const labelCls = "block text-[11px] text-[#8896B0] tracking-widest font-medium mb-1.5"

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,#152347,transparent)]" />

      <div className="relative w-full max-w-lg fade-up">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <img src="/logo.png" alt="Pacific Racing" className="w-20 h-20 object-contain" />
            <div className="font-display text-xl tracking-[0.2em] text-[#F5C518]">PACIFIC RACING</div>
            <div className="text-[9px] text-[#8896B0] tracking-widest">& SPORTS BETTING LTD</div>
          </Link>
        </div>

        <div className="glass rounded-2xl p-8 shadow-[0_8px_48px_rgba(0,0,0,0.5)]">
          <h2 className="font-display text-2xl tracking-widest mb-1">CREATE ACCOUNT</h2>
          <p className="text-[#8896B0] text-xs mb-4">All fields are required. You must be 18 or older to register.</p>

          {/* Welcome bonus */}
          <div className="flex items-center gap-2.5 bg-[#F5C518]/8 border border-[#F5C518]/15 rounded-xl px-4 py-3 mb-6">
            <span className="text-2xl flex-shrink-0">🎁</span>
            <div>
              <div className="text-[#F5C518] font-bold text-sm">K50 Free Betting Credit</div>
              <div className="text-[10px] text-[#8896B0]">Credited to your wallet instantly on sign up · No deposit required</div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">

            {/* ── PERSONAL DETAILS ── */}
            <div className="pb-1">
              <div className="text-[10px] text-[#F5C518] tracking-[0.2em] font-bold mb-3 flex items-center gap-2">
                <div className="h-px flex-1 bg-[#F5C518]/15" />
                PERSONAL DETAILS
                <div className="h-px flex-1 bg-[#F5C518]/15" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>GIVEN NAME(S) *</label>
                  <input
                    type="text" value={givenNames}
                    onChange={e => setGivenNames(e.target.value)}
                    placeholder="e.g. John Peter"
                    className={inputCls}
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label className={labelCls}>SURNAME *</label>
                  <input
                    type="text" value={surname}
                    onChange={e => setSurname(e.target.value)}
                    placeholder="e.g. Kama"
                    className={inputCls}
                    autoComplete="family-name"
                  />
                </div>
              </div>
            </div>

            {/* ── DATE OF BIRTH ── */}
            <DOBInput
              dd={dobDD} mm={dobMM} yyyy={dobYYYY}
              onDDChange={setDobDD}
              onMMChange={setDobMM}
              onYYYYChange={setDobYYYY}
            />

            {/* ── ACCOUNT DETAILS ── */}
            <div className="pt-1">
              <div className="text-[10px] text-[#F5C518] tracking-[0.2em] font-bold mb-3 flex items-center gap-2">
                <div className="h-px flex-1 bg-[#F5C518]/15" />
                ACCOUNT DETAILS
                <div className="h-px flex-1 bg-[#F5C518]/15" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelCls}>EMAIL ADDRESS *</label>
                  <input
                    type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className={inputCls}
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className={labelCls}>PASSWORD *</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className={inputCls + ' pr-11'}
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8896B0] hover:text-white transition-colors">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <PasswordStrength password={password} />
                </div>

                <div>
                  <label className={labelCls}>CONFIRM PASSWORD *</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'} value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Re-enter your password"
                      className={`${inputCls} pr-11 ${
                        confirm && !passwordsMatch ? 'border-red-500/60' :
                        passwordsMatch ? 'border-green-500/50' : ''
                      }`}
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8896B0] hover:text-white transition-colors">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirm && !passwordsMatch && (
                    <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={11} />Passwords do not match</p>
                  )}
                  {passwordsMatch && (
                    <p className="text-green-400 text-xs mt-1.5 flex items-center gap-1"><CheckCircle size={11} />Passwords match ✓</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── TERMS ── */}
            <label className="flex items-start gap-3 cursor-pointer group mt-1">
              <button type="button" onClick={() => setTerms(!terms)}
                className={`mt-0.5 w-4 h-4 flex-shrink-0 rounded border transition-all flex items-center justify-center ${
                  terms ? 'bg-[#F5C518] border-[#F5C518]' : 'border-[#2756CC]/40 group-hover:border-[#F5C518]/50'
                }`}>
                {terms && <svg className="w-2.5 h-2.5 text-[#0D1B3E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>}
              </button>
              <span className="text-xs text-[#8896B0] leading-relaxed">
                I agree to the <span className="text-[#F5C518]">Terms & Conditions</span> and <span className="text-[#F5C518]">Privacy Policy</span>. I understand that gambling involves financial risk and is strictly for adults 18+.
              </span>
            </label>

            {/* ── FIELD COMPLETION CHECKLIST ── */}
            {!canSubmit && (givenNames || surname || dobDD || email || password) && (
              <div className="bg-[#080F22]/60 border border-[#2756CC]/15 rounded-xl p-4">
                <p className="text-[10px] text-[#8896B0] tracking-widest mb-2.5 font-medium">REQUIRED TO CONTINUE</p>
                <div className="space-y-1.5">
                  {[
                    { done: givenNames.trim().length >= 2, label: 'Given name(s) entered' },
                    { done: surname.trim().length >= 2, label: 'Surname entered' },
                    { done: dobComplete && isOver18, label: dobComplete && !isOver18 ? `Must be 18+ (you are ${age})` : 'Date of birth (18+)' },
                    { done: email.includes('@') && email.includes('.'), label: 'Valid email address' },
                    { done: password.length >= 6, label: 'Password (min 6 characters)' },
                    { done: !!passwordsMatch, label: 'Passwords match' },
                    { done: terms, label: 'Terms & Conditions agreed' },
                  ].map(item => (
                    <div key={item.label} className={`flex items-center gap-2 text-xs transition-colors ${item.done ? 'text-green-400' : 'text-[#8896B0]'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${item.done ? 'bg-green-500 border-green-500' : 'border-[#2756CC]/30'}`}>
                        {item.done && <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ERROR ── */}
            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/25 px-3 py-2.5 rounded-lg text-red-400 text-sm">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* ── SUBMIT ── */}
            <button
              type="submit"
              disabled={!canSubmit}
              title={!canSubmit ? 'Please complete all required fields above' : 'Create your account'}
              className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-all text-sm mt-2 ${
                canSubmit
                  ? 'bg-[#F5C518] text-[#0D1B3E] hover:bg-[#FFD94A] press shadow-[0_0_20px_rgba(245,197,24,0.2)] cursor-pointer'
                  : 'bg-[#152347] text-[#8896B0] border border-[#2756CC]/20 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <UserPlus size={15} />
              )}
              {loading ? 'Creating Account...' : canSubmit ? 'Create Account' : 'Complete All Fields to Continue'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-[#2756CC]/12 text-center text-sm text-[#8896B0]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#F5C518] font-semibold hover:text-[#FFD94A] transition-colors">Login</Link>
          </div>

          <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-[#8896B0]/50">
            <span>🔒 SSL Secured</span>
            <span>·</span>
            <span>18+ Only</span>
            <span>·</span>
            <span>PNG Licensed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
