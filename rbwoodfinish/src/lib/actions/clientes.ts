'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/supabase/auth'

export interface ClienteActionResult {
  success: boolean
  id?: string
  error?: string
}

export async function criarCliente(formData: FormData) {
  try {
    const profile = await requireRole(['admin', 'comercial'])
    const supabase = await createClient()
    const tipo = formData.get('tipo') as string
    const responsavel =
      tipo === 'profissional_b2b'
        ? ((formData.get('responsavel') as string) || null)
        : null

    const data = {
      data_registo:
        (formData.get('data_registo') as string) || new Date().toISOString().slice(0, 10),
      tipo,
      nome: formData.get('nome') as string,
      responsavel,
      nif: (formData.get('nif') as string) || null,
      contacto_telefone: (formData.get('contacto_telefone') as string) || null,
      email: (formData.get('email') as string) || null,
      morada_sede: (formData.get('morada_sede') as string) || null,
      notas: (formData.get('notas') as string) || null,
      notas_obra: (formData.get('notas_obra') as string) || null,
      comercial_responsavel_id: profile.id,
    }

    const { data: cliente, error } = await supabase
      .from('clientes')
      .insert(data)
      .select()
      .single()

    if (error) return { success: false, error: error.message } satisfies ClienteActionResult

    const moradasCount = parseInt((formData.get('moradas_count') as string) || '0')
    if (moradasCount > 0) {
      const moradasToInsert = []
      for (let i = 0; i < moradasCount; i++) {
        const morada = formData.get(`morada_${i}`) as string
        const descricao = formData.get(`morada_desc_${i}`) as string
        if (morada && morada.trim()) {
          moradasToInsert.push({
            cliente_id: cliente.id,
            morada: morada.trim(),
            descricao: descricao?.trim() || null,
          })
        }
      }
      if (moradasToInsert.length > 0) {
        const { error: moradasError } = await supabase.from('moradas_obra').insert(moradasToInsert)
        if (moradasError) {
          return { success: false, error: moradasError.message } satisfies ClienteActionResult
        }
      }
    }

    revalidatePath('/clientes')
    return { success: true, id: cliente.id } satisfies ClienteActionResult
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar cliente',
    } satisfies ClienteActionResult
  }
}

export async function atualizarCliente(id: string, formData: FormData) {
  try {
    await requireRole(['admin', 'comercial'])
    const supabase = await createClient()
    const tipo = formData.get('tipo') as string
    const responsavel =
      tipo === 'profissional_b2b'
        ? ((formData.get('responsavel') as string) || null)
        : null

    const data = {
      data_registo:
        (formData.get('data_registo') as string) || new Date().toISOString().slice(0, 10),
      tipo,
      nome: formData.get('nome') as string,
      responsavel,
      nif: (formData.get('nif') as string) || null,
      contacto_telefone: (formData.get('contacto_telefone') as string) || null,
      email: (formData.get('email') as string) || null,
      morada_sede: (formData.get('morada_sede') as string) || null,
      notas: (formData.get('notas') as string) || null,
      notas_obra: (formData.get('notas_obra') as string) || null,
    }

    const { error } = await supabase
      .from('clientes')
      .update(data)
      .eq('id', id)

    if (error) return { success: false, error: error.message } satisfies ClienteActionResult

    revalidatePath('/clientes')
    revalidatePath(`/clientes/${id}`)
    return { success: true, id } satisfies ClienteActionResult
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao atualizar cliente',
    } satisfies ClienteActionResult
  }
}

export async function eliminarCliente(id: string) {
  await requireRole(['admin'])
  const supabase = await createClient()

  const { error } = await supabase.from('clientes').delete().eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/clientes')
  redirect('/clientes')
}
