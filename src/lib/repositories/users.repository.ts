import { getAdminClient } from '@/lib/supabase/admin'
import type { Profile } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DB = any

export const usersRepository = {

  async findById(id: string): Promise<Profile | null> {
    const sb: DB = getAdminClient()
    const { data } = await sb.from('profiles').select('*').eq('id', id).maybeSingle()
    return data as Profile | null
  },

  async findAll(): Promise<Profile[]> {
    const sb: DB = getAdminClient()
    const { data } = await sb.from('profiles').select('*').order('created_at', { ascending: false })
    return (data || []) as Profile[]
  },

  async upsertProfile(profile: Partial<Profile> & { id: string }): Promise<void> {
    const sb: DB = getAdminClient()
    const { error } = await sb.from('profiles').upsert(profile)
    if (error) throw new Error(error.message)
  },
}
