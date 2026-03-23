'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireRole, requireUser } from '@/lib/supabase/auth'
import { EstadoProcesso } from '@/lib/types/database'

export async function criarProcesso(formData: FormData) {
  const profile = await requireRole(['admin', 'comercial'])
  const supabase = await createClient()

  const clienteId = formData.get('cliente_id') as string
  const moradaObraId = (formData.get('morada_obra_id') as string) || null
  const notas = (formData.get('notas') as string) || null

  if (!clienteId) throw new Error('Cliente obrigatório')
  if (!moradaObraId) throw new Error('Morada de obra obrigatória')

  const { data: processo, error } = await supabase
    .from('processos')
    .insert({
      cliente_id: clienteId,
      morada_obra_id: moradaObraId,
      comercial_id: profile.id,
      notas,
      estado_global: 'contacto',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Criar ocorrência inicial
  await supabase.from('ocorrencias').insert({
    processo_id: processo.id,
    utilizador_id: profile.id,
    tipo: 'estado_mudou',
    conteudo: 'Processo criado — Estado: Contacto Inicial',
  })

  revalidatePath('/processos')
  redirect(`/processos/${processo.id}`)
}

export async function atualizarEstadoProcesso(
  processoId: string,
  novoEstado: EstadoProcesso
) {
  const profile = await requireUser()
  const supabase = await createClient()

  const updateData: Record<string, unknown> = { estado_global: novoEstado }

  if (novoEstado === 'adjudicacao') {
    updateData.data_adjudicacao = new Date().toISOString()
  }
  if (novoEstado === 'concluido') {
    updateData.data_conclusao = new Date().toISOString()
  }

  const { error } = await supabase
    .from('processos')
    .update(updateData)
    .eq('id', processoId)

  if (error) throw new Error(error.message)

  await supabase.from('ocorrencias').insert({
    processo_id: processoId,
    utilizador_id: profile.id,
    tipo: 'estado_mudou',
    conteudo: `Estado alterado para: ${novoEstado}`,
  })

  revalidatePath(`/processos/${processoId}`)
  revalidatePath('/processos')
  revalidatePath('/')
}

export async function atualizarProcesso(id: string, formData: FormData) {
  await requireRole(['admin', 'comercial'])
  const supabase = await createClient()

  const clienteId = formData.get('cliente_id') as string
  const moradaObraId = (formData.get('morada_obra_id') as string) || null
  const notas = (formData.get('notas') as string) || null

  if (!clienteId) throw new Error('Cliente obrigatório')
  if (!moradaObraId) throw new Error('Morada de obra obrigatória')

  const { error } = await supabase
    .from('processos')
    .update({ cliente_id: clienteId, morada_obra_id: moradaObraId, notas })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath(`/processos/${id}`)
  revalidatePath('/processos')
}

export async function eliminarProcesso(id: string) {
  await requireRole(['admin'])
  const supabase = await createClient()

  const { error } = await supabase.from('processos').delete().eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/processos')
  redirect('/processos')
}
