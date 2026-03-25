'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireRole, requireUser } from '@/lib/supabase/auth'
import { EstadoProcesso } from '@/lib/types/database'

export interface ProcessoActionResult {
  success: boolean
  id?: string
  error?: string
}

export async function criarProcesso(formData: FormData) {
  try {
    const profile = await requireRole(['admin', 'comercial'])
    const supabase = await createClient()

    const clienteId = formData.get('cliente_id') as string
    const moradaObraId = (formData.get('morada_obra_id') as string) || null
    const notas = (formData.get('notas') as string) || null

    if (!clienteId) {
      return { success: false, error: 'Cliente obrigatório' } satisfies ProcessoActionResult
    }
    if (!moradaObraId) {
      return { success: false, error: 'Morada de obra obrigatória' } satisfies ProcessoActionResult
    }

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

    if (error) return { success: false, error: error.message } satisfies ProcessoActionResult

    const { error: ocorrenciaError } = await supabase.from('ocorrencias').insert({
      processo_id: processo.id,
      utilizador_id: profile.id,
      tipo: 'estado_mudou',
      conteudo: 'Processo criado — Estado: Contacto Inicial',
    })

    if (ocorrenciaError) {
      return { success: false, error: ocorrenciaError.message } satisfies ProcessoActionResult
    }

    revalidatePath('/processos')
    return { success: true, id: processo.id } satisfies ProcessoActionResult
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar processo',
    } satisfies ProcessoActionResult
  }
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
  try {
    await requireRole(['admin', 'comercial'])
    const supabase = await createClient()

    const clienteId = formData.get('cliente_id') as string
    const moradaObraId = (formData.get('morada_obra_id') as string) || null
    const notas = (formData.get('notas') as string) || null

    if (!clienteId) {
      return { success: false, error: 'Cliente obrigatório' } satisfies ProcessoActionResult
    }
    if (!moradaObraId) {
      return { success: false, error: 'Morada de obra obrigatória' } satisfies ProcessoActionResult
    }

    const { error } = await supabase
      .from('processos')
      .update({ cliente_id: clienteId, morada_obra_id: moradaObraId, notas })
      .eq('id', id)

    if (error) return { success: false, error: error.message } satisfies ProcessoActionResult

    revalidatePath(`/processos/${id}`)
    revalidatePath('/processos')
    return { success: true, id } satisfies ProcessoActionResult
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao atualizar processo',
    } satisfies ProcessoActionResult
  }
}

export async function eliminarProcesso(id: string) {
  await requireRole(['admin'])
  const supabase = await createClient()

  const { error } = await supabase.from('processos').delete().eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/processos')
  redirect('/processos')
}
