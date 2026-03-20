import { createClient } from '@/lib/supabase/server'
import { Profile } from '@/lib/types/database'

export async function getUser(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function requireUser(): Promise<Profile> {
  const profile = await getUser()
  if (!profile) {
    throw new Error('Não autenticado')
  }
  return profile
}

export async function requireRole(roles: string[]): Promise<Profile> {
  const profile = await requireUser()
  if (!roles.includes(profile.role)) {
    throw new Error('Sem permissão')
  }
  return profile
}
