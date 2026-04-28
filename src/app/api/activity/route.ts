import { createClient } from '@/lib/supabase/server'
import { activityLogger } from '@/lib/services/activity.service'
import { apiResponse, apiError } from '@/lib/utils'

export async function GET() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)
  try {
    const logs = await activityLogger.getRecent(10)
    // Sanitize: remove actor_id for non-admin
    const sanitized = logs.map(l => ({
      id: l.id,
      action: l.action,
      actor_role: l.actor_role,
      entity_type: l.entity_type,
      details: l.details ? {
        event_name: (l.details as any).event_name,
        selection: (l.details as any).selection,
        stake: (l.details as any).stake,
        result: (l.details as any).result,
        new_status: (l.details as any).new_status,
      } : null,
      created_at: l.created_at,
    }))
    return apiResponse(sanitized)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
