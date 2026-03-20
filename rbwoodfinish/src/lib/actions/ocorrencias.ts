'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/supabase/auth'
import { TipoOcorrencia } from '@/lib/types/database'

export async function criarOcorrencia(
  processoId: string,
  tipo: TipoOcorrencia,
  conteudo: string
) {
  const profile = await requireUser()
  const supabase = await createClient()

  const { error } = await supabase.from('ocorrencias').insert({
    processo_id: processoId,
    utilizador_id: profile.id,
    tipo,
    conteudo,
  })

  if (error) throw new Error(error.message)

  revalidatePath(`/processos/${processoId}`)
}
