'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/client'
import {
  User, Mail, Calendar, Hash, Shield, CheckCircle,
  Copy, AlertCircle, Lock, Edit2, Save, Loader2
} from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ given_names: '', surname: '' })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    const sb = createClient()
    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      fetch('/api/profile').then(r => r.json()).then(d => {
        if (d.data) {
          setProfile(d.data)
          setEditForm({ given_names: d.data.given_names || '', surname: d.data.surname || '' })
        }
        setLoading(false)
      })
    })
  }, [router])

  const copyAccountNumber = () => {
    const num = profile?.pr_account_number || profile?.admin_number
    if (!num) return
    navigator.clipboard.writeText(num)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async () => {
    setSaving(true); setSaveMsg('')
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          given_names: editForm.given_names.trim(),
          surname: editForm.surname.trim(),
          full_name: `${editForm.given_names.trim()} ${editForm.surname.trim()}`.trim(),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setProfile((p: any) => ({
        ...p,
        given_names: editForm.given_names.trim(),
        surname: editForm.surname.trim(),
        full_name: `${editForm.given_names.trim()} ${editForm.surname.trim()}`.trim(),
      }))
      setSaveMsg('✓ Profile updated')
      setEditing(false)
    } catch (e: any) {
      setSaveMsg(`✗ ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  const formatDOB = (dob: string | null) => {
    if (!dob) return '—'
    const d = new Date(dob)
    if (isNaN(d.getTime())) return '—'
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#F5C518] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!profile) return null

  const isAdmin = profile.role === 'admin'
  const accountNumber = isAdmin ? profile.admin_number : profile.pr_account_number
  const accountLabel = isAdmin ? 'ADMIN ID' : 'PR ACCOUNT NUMBER'

  return (
    <div className="min-h-screen">
      <Navbar showBalance />
      <div className="pt-20 pb-12 max-w-2xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8 fade-up">
          <h1 className="font-display text-3xl sm:text-4xl tracking-widest flex items-center gap-3">
            <User size={26} className="text-[#F5C518]" />MY PROFILE
          </h1>
          <p className="text-[#8896B0] text-sm mt-1">Your personal information and account details</p>
        </div>

        {/* ── Profile Card ── */}
        <div className="bg-[#0D1B3E] border border-[#2756CC]/20 rounded-2xl overflow-hidden mb-6 fade-up">

          {/* Top header with avatar and name */}
          <div className="bg-gradient-to-br from-[#2756CC]/40 to-[#152347] p-6 border-b border-[#2756CC]/15">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-[#F5C518] rounded-full flex items-center justify-center text-2xl font-display text-[#0D1B3E] font-bold flex-shrink-0 shadow-[0_0_24px_rgba(245,197,24,0.25)]">
                {(profile.given_names?.[0] || profile.email[0] || '?').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-2xl tracking-widest text-white leading-tight">
                  {profile.given_names || profile.surname
                    ? `${profile.given_names || ''} ${profile.surname || ''}`.trim()
                    : profile.email.split('@')[0]}
                </h2>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border tracking-wider ${
                    isAdmin
                      ? 'text-[#F5C518] bg-[#F5C518]/10 border-[#F5C518]/20'
                      : 'text-blue-400 bg-blue-400/10 border-blue-400/20'
                  }`}>
                    {isAdmin ? '⚡ ADMIN' : '👤 MEMBER'}
                  </span>
                  {!isAdmin && (
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border tracking-wider ${
                      profile.kyc_verified
                        ? 'text-green-400 bg-green-500/10 border-green-500/20'
                        : 'text-[#8896B0] bg-[#8896B0]/8 border-[#8896B0]/15'
                    }`}>
                      {profile.kyc_verified ? '✓ KYC VERIFIED' : '🔒 KYC PENDING'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account number banner */}
          {accountNumber && (
            <div className="px-6 py-4 bg-[#080F22]/60 border-b border-[#2756CC]/10 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Hash size={11} className="text-[#F5C518]" />
                  <span className="text-[10px] text-[#8896B0] tracking-widest font-medium">{accountLabel}</span>
                </div>
                <div className="font-display text-2xl text-[#F5C518] tracking-[0.15em]">{accountNumber}</div>
              </div>
              <button onClick={copyAccountNumber}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
                  copied
                    ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                    : 'bg-[#152347] text-[#F5C518] border border-[#F5C518]/20 hover:bg-[#F5C518]/10'
                }`}>
                {copied ? <><CheckCircle size={13} />COPIED</> : <><Copy size={13} />COPY</>}
              </button>
            </div>
          )}

          {/* Personal details */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg tracking-widest text-white">PERSONAL DETAILS</h3>
              {!editing ? (
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 text-xs text-[#F5C518] hover:text-[#FFD94A] transition-colors font-semibold">
                  <Edit2 size={12} />Edit
                </button>
              ) : (
                <button onClick={() => { setEditing(false); setEditForm({ given_names: profile.given_names || '', surname: profile.surname || '' }) }}
                  className="text-xs text-[#8896B0] hover:text-white transition-colors">
                  Cancel
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Given Names */}
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-[#152347] border border-[#2756CC]/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={14} className="text-[#8896B0]" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] text-[#8896B0] tracking-widest mb-1">GIVEN NAME(S)</label>
                  {editing ? (
                    <input
                      value={editForm.given_names}
                      onChange={e => setEditForm(f => ({ ...f, given_names: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg text-sm text-white bg-[#080F22]/80 border border-[#2756CC]/25 focus:outline-none focus:border-[#F5C518] transition-colors"
                      placeholder="Your given name(s)"
                    />
                  ) : (
                    <div className="text-white text-sm font-medium">{profile.given_names || <span className="text-[#8896B0] italic">Not set</span>}</div>
                  )}
                </div>
              </div>

              {/* Surname */}
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-[#152347] border border-[#2756CC]/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={14} className="text-[#8896B0]" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] text-[#8896B0] tracking-widest mb-1">SURNAME</label>
                  {editing ? (
                    <input
                      value={editForm.surname}
                      onChange={e => setEditForm(f => ({ ...f, surname: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg text-sm text-white bg-[#080F22]/80 border border-[#2756CC]/25 focus:outline-none focus:border-[#F5C518] transition-colors"
                      placeholder="Your surname"
                    />
                  ) : (
                    <div className="text-white text-sm font-medium">{profile.surname || <span className="text-[#8896B0] italic">Not set</span>}</div>
                  )}
                </div>
              </div>

              {/* Save button when editing */}
              {editing && (
                <div className="pl-[52px]">
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 bg-[#F5C518] text-[#0D1B3E] font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-[#FFD94A] transition-all press disabled:opacity-60">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}

              {saveMsg && (
                <div className={`pl-[52px] text-sm ${saveMsg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>
                  {saveMsg}
                </div>
              )}

              {/* Date of Birth — read only */}
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-[#152347] border border-[#2756CC]/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar size={14} className="text-[#8896B0]" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] text-[#8896B0] tracking-widest mb-1">DATE OF BIRTH</label>
                  <div className="text-white text-sm font-medium">{formatDOB(profile.date_of_birth)}</div>
                  <div className="text-[10px] text-[#8896B0] mt-0.5">Cannot be changed after registration</div>
                </div>
              </div>

              {/* Email — read only */}
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-[#152347] border border-[#2756CC]/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail size={14} className="text-[#8896B0]" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] text-[#8896B0] tracking-widest mb-1">EMAIL ADDRESS</label>
                  <div className="text-white text-sm font-medium">{profile.email}</div>
                  <div className="text-[10px] text-[#8896B0] mt-0.5">Used for login · Contact support to change</div>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-[#152347] border border-[#2756CC]/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Shield size={14} className="text-[#8896B0]" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] text-[#8896B0] tracking-widest mb-1">ACCOUNT TYPE</label>
                  <div className="text-white text-sm font-medium capitalize">{profile.role}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KYC Verification status (regular users only) */}
        {!isAdmin && (
          <div className="bg-[#0D1B3E] border border-[#2756CC]/15 rounded-2xl p-6 mb-6">
            <h3 className="font-display text-lg tracking-widest text-white mb-4 flex items-center gap-2">
              <Shield size={16} className="text-[#F5C518]" />
              ID VERIFICATION (KYC)
            </h3>
            {profile.kyc_verified ? (
              <div className="flex items-start gap-3 bg-green-500/8 border border-green-500/20 rounded-xl px-5 py-4">
                <CheckCircle size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-green-400 font-bold text-sm mb-0.5">Identity Verified</div>
                  <p className="text-xs text-[#8896B0]">Your identity has been verified. You can deposit and withdraw funds without restrictions.</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start gap-3 bg-[#F5C518]/6 border border-[#F5C518]/15 rounded-xl px-5 py-4 mb-4">
                  <AlertCircle size={18} className="text-[#F5C518] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[#F5C518] font-bold text-sm mb-0.5">Not Yet Verified</div>
                    <p className="text-xs text-[#8896B0]">
                      You can deposit and bet freely. ID verification is only required when you want to withdraw winnings.
                    </p>
                  </div>
                </div>
                <button onClick={() => router.push('/wallet')}
                  className="flex items-center gap-2 bg-[#F5C518] text-[#0D1B3E] font-bold px-5 py-3 rounded-xl text-sm hover:bg-[#FFD94A] transition-all press">
                  <Shield size={14} />Start Verification
                </button>
              </div>
            )}
          </div>
        )}

        {/* Account security */}
        <div className="bg-[#0D1B3E] border border-[#2756CC]/15 rounded-2xl p-6">
          <h3 className="font-display text-lg tracking-widest text-white mb-4 flex items-center gap-2">
            <Lock size={16} className="text-[#F5C518]" />
            ACCOUNT SECURITY
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-[#080F22]/50 border border-[#2756CC]/10 rounded-xl px-4 py-3">
              <div>
                <div className="text-sm font-medium text-white">Password</div>
                <div className="text-xs text-[#8896B0]">Last changed: Unknown</div>
              </div>
              <button className="text-xs text-[#F5C518] font-semibold hover:text-[#FFD94A] transition-colors">
                Change Password
              </button>
            </div>
            <div className="flex items-center justify-between bg-[#080F22]/50 border border-[#2756CC]/10 rounded-xl px-4 py-3">
              <div>
                <div className="text-sm font-medium text-white">Two-Factor Authentication</div>
                <div className="text-xs text-[#8896B0]">Not enabled · Coming in Phase 2</div>
              </div>
              <span className="text-[10px] text-[#8896B0] bg-[#152347] px-2.5 py-1 rounded-full border border-[#2756CC]/15">COMING SOON</span>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-6 flex items-start gap-3 bg-[#0D1B3E]/40 border border-[#2756CC]/8 rounded-xl px-5 py-4">
          <AlertCircle size={13} className="text-[#8896B0] flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-[#8896B0] leading-relaxed">
            Your personal data is stored securely and processed in accordance with the <strong className="text-[#B8C4D8]">PNG Privacy Act</strong>. We never share your information with third parties without your consent.
          </p>
        </div>
      </div>
    </div>
  )
}
