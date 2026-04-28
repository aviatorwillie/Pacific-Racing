// ── Activity Log Repository ────────────────────────────────────────────────
// INSERT-only. No updates or deletes — enforced at DB level via triggers.
// All Supabase calls use (sb.from(...) as any) because activity_logs is not
// in the generated types — this is intentional and safe.

import { getAdminClient } from '@/lib/supabase/admin'

export interface CreateActivityLog {
  actor_id: string | null
  actor_role: 'user' | 'admin' | 'system'
  action: string
  entity_type?: string | null
  entity_id?: string | null
  details?: Record<string, any> | null
}

// Enrich log rows with actor's account number and name from profiles
async function enrichWithAccountNumbers(logs: any[]): Promise<any[]> {
  if (!logs.length) return logs
  const sb = getAdminClient()

  const allIds = logs.map((l: any) => l.actor_id).filter(Boolean) as string[]
  const actorIds = Array.from(new Set(allIds))
  if (!actorIds.length) return logs

  const { data } = await (sb.from('profiles') as any)
    .select('id, pr_account_number, admin_number, given_names, surname, email')
    .in('id', actorIds)

  const profileMap = new Map<string, any>()
  if (data) {
    (data as any[]).forEach((p: any) => profileMap.set(p.id, p))
  }

  return logs.map((log: any) => {
    const profile = log.actor_id ? profileMap.get(log.actor_id) : null
    return {
      ...log,
      actor_account_number: profile
        ? (profile.admin_number
            ? `ADM-${profile.admin_number}`
            : profile.pr_account_number || null)
        : null,
      actor_name: profile
        ? `${profile.given_names || ''} ${profile.surname || ''}`.trim() || profile.email
        : null,
      actor_email: profile?.email || null,
    }
  })
}

export const activityRepository = {

  async create(entry: CreateActivityLog): Promise<void> {
    const sb = getAdminClient()
    const { error } = await (sb.from('activity_logs') as any).insert({
      actor_id: entry.actor_id,
      actor_role: entry.actor_role,
      action: entry.action,
      entity_type: entry.entity_type || null,
      entity_id: entry.entity_id || null,
      details: entry.details || null,
    })
    if (error) console.error('[ActivityLog] Insert failed:', error.message)
  },

  async findRecent(limit = 50): Promise<any[]> {
    const sb = getAdminClient()
    const { data, error } = await (sb.from('activity_logs') as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) { console.error('[ActivityLog] Fetch failed:', error.message); return [] }
    return enrichWithAccountNumbers((data as any[]) || [])
  },

  async findByActor(actorId: string, limit = 30): Promise<any[]> {
    const sb = getAdminClient()
    const { data, error } = await (sb.from('activity_logs') as any)
      .select('*')
      .eq('actor_id', actorId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) return []
    return enrichWithAccountNumbers((data as any[]) || [])
  },

  async findByAction(action: string, limit = 30): Promise<any[]> {
    const sb = getAdminClient()
    const { data } = await (sb.from('activity_logs') as any)
      .select('*')
      .eq('action', action)
      .order('created_at', { ascending: false })
      .limit(limit)
    return enrichWithAccountNumbers((data as any[]) || [])
  },

  async searchByAccountNumber(accountNumber: string, limit = 100): Promise<any[]> {
    const sb = getAdminClient()

    const clean = accountNumber.trim().toUpperCase()
    let profileQuery = (sb.from('profiles') as any).select('id')

    if (clean.startsWith('ADM-')) {
      profileQuery = profileQuery.eq('admin_number', clean.replace('ADM-', ''))
    } else if (clean.startsWith('PR-')) {
      profileQuery = profileQuery.eq('pr_account_number', clean)
    } else {
      profileQuery = profileQuery.or(
        `pr_account_number.eq.${clean},admin_number.eq.${clean},pr_account_number.eq.PR-${clean}`
      )
    }

    const { data: profileResults } = await profileQuery
    if (!profileResults || (profileResults as any[]).length === 0) return []

    const userIds = (profileResults as any[]).map((p: any) => p.id)

    const { data: logs } = await (sb.from('activity_logs') as any)
      .select('*')
      .in('actor_id', userIds)
      .order('created_at', { ascending: false })
      .limit(limit)

    return enrichWithAccountNumbers((logs as any[]) || [])
  },
}
