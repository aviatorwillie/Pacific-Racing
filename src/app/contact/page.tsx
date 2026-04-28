'use client'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle, Loader2 } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200)) // Simulate send
    setSent(true)
    setLoading(false)
  }

  const inputCls = "w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#8896B0]/60 border border-[#2756CC]/25 bg-[#080F22]/80 focus:outline-none focus:border-[#F5C518] transition-colors"
  const labelCls = "block text-[11px] text-[#8896B0] tracking-widest font-medium mb-1.5"

  return (
    <div>
      <Navbar />
      <div className="pt-20">
        <section className="relative py-20 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,#152347,transparent)]" />
          <div className="relative max-w-3xl mx-auto px-4">
            <h1 className="font-display text-5xl sm:text-7xl tracking-widest mb-5">CONTACT US</h1>
            <p className="text-[#8896B0] text-lg">Our local Port Moresby team is here to help you — 7 days a week.</p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Contact info */}
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-3xl tracking-widest mb-6">GET IN TOUCH</h2>
                {[
                  { icon: <Phone size={18} />, label: 'Phone', value: '+675 XXX XXXX', sub: 'Mon–Fri 8am–6pm AEST' },
                  { icon: <Mail size={18} />, label: 'Email', value: 'support@pacificracing.com.pg', sub: 'We reply within 2 hours' },
                  { icon: <MapPin size={18} />, label: 'Office', value: 'Port Moresby, NCD', sub: 'Papua New Guinea' },
                  { icon: <MessageSquare size={18} />, label: 'Live Chat', value: 'Available on platform', sub: 'For logged-in members' },
                ].map(c => (
                  <div key={c.label} className="flex items-start gap-4 p-4 bg-[#0D1B3E] border border-[#2756CC]/12 rounded-xl mb-3">
                    <div className="w-10 h-10 bg-[#F5C518]/10 border border-[#F5C518]/15 rounded-lg flex items-center justify-center text-[#F5C518] flex-shrink-0">{c.icon}</div>
                    <div>
                      <div className="text-[10px] text-[#8896B0] tracking-widest mb-0.5">{c.label.toUpperCase()}</div>
                      <div className="text-sm font-semibold text-white">{c.value}</div>
                      <div className="text-xs text-[#8896B0]">{c.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Responsible gambling */}
              <div className="bg-[#F5C518]/6 border border-[#F5C518]/12 rounded-xl p-5">
                <div className="text-xl mb-2">⚠️</div>
                <h4 className="text-sm font-bold text-[#F5C518] mb-1.5">Need help with gambling?</h4>
                <p className="text-xs text-[#8896B0] leading-relaxed">
                  If gambling is causing problems in your life, please reach out. Problem Gambling Helpline PNG: <strong className="text-white">1800-XXX-XXX</strong> — free, confidential, available 24/7.
                </p>
              </div>
            </div>

            {/* Contact form */}
            <div className="bg-[#0D1B3E] border border-[#2756CC]/15 rounded-2xl p-7">
              {sent ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-green-500/12 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-400" />
                  </div>
                  <h3 className="font-display text-2xl tracking-widest mb-2">MESSAGE SENT!</h3>
                  <p className="text-[#8896B0] text-sm">We&apos;ll get back to you within 2 hours.</p>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-2xl tracking-widest mb-1">SEND A MESSAGE</h2>
                  <p className="text-[#8896B0] text-xs mb-6">Fill out the form and our team will respond promptly.</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>YOUR NAME</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Kama" className={inputCls} required />
                      </div>
                      <div>
                        <label className={labelCls}>EMAIL</label>
                        <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@email.com" className={inputCls} required />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>SUBJECT</label>
                      <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className={inputCls + ' cursor-pointer'} required>
                        <option value="">Select a topic...</option>
                        {['Account Help', 'Deposit / Withdrawal', 'Bet Query', 'Technical Issue', 'Responsible Gambling', 'Other'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>MESSAGE</label>
                      <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={5} placeholder="Describe your issue or question in detail..." className={inputCls + ' resize-none'} required />
                    </div>
                    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#F5C518] text-[#0D1B3E] font-bold py-3.5 rounded-xl hover:bg-[#FFD94A] transition-all press disabled:opacity-70">
                      {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
