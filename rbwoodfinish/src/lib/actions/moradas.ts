'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/supabase/auth'

export async function criarMoradaObra(formData: FormData) {
  await requireRole(['admin', 'comercial'])
  const supabase = await createClient()

  const clienteId = formData.get('cliente_id') as string
  const morada = formData.get('morada') as string
  const descricao = (formData.get('descricao') as string) || null

  const { data, error } = await supabase
    .from('moradas_obra')
    .insert({
      cliente_id: clienteId,
      morada,
      descricao,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  revalidatePath(`/clientes/${clienteId}`)
  return data
}

export async function eliminarMoradaObra(id: string, clienteId: string) {
  await requireRole(['admin', 'comercial'])
  const supabase = await createClient()

  const { error } = await supabase.from('moradas_obra').delete().eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath(`/clientes/${clienteId}`)
}
