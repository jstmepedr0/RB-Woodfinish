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

  // Profile não existe (utilizador criado antes do trigger) — criar automaticamente
  if (!profile) {
    const nome = user.user_metadata?.nome ?? user.email ?? 'Utilizador'
    const role = user.user_metadata?.role ?? 'comercial'

    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({ id: user.id, nome, email: user.email!, role })
      .select('*')
      .single()

    return newProfile
  }

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
