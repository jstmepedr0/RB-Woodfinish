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

function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
}

function normalizePhone(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return `+${trimmed.replace(/[^\d]/g, '')}`
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
    const nif = digitsOnly((formData.get('nif') as string) || '')
    const contactoTelefone = normalizePhone((formData.get('contacto_telefone') as string) || '')

    if (nif && nif.length !== 9) {
      return { success: false, error: 'O NIF deve ter exatamente 9 números.' } satisfies ClienteActionResult
    }

    if (tipo === 'profissional_b2b' && !responsavel?.trim()) {
      return { success: false, error: 'O responsável é obrigatório para cliente profissional.' } satisfies ClienteActionResult
    }

    if (contactoTelefone && !/^\+\d{11,14}$/.test(contactoTelefone)) {
      return { success: false, error: 'O contacto telefónico é inválido.' } satisfies ClienteActionResult
    }

    const data = {
      data_registo:
        (formData.get('data_registo') as string) || new Date().toISOString().slice(0, 10),
      tipo,
      nome: formData.get('nome') as string,
      responsavel,
      nif: nif || null,
      contacto_telefone: contactoTelefone || null,
      email: (formData.get('email') as string) || null,
      morada_sede: (formData.get('morada_sede') as string) || null,
      notas: (formData.get('notas') as string) || null,
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
    const nif = digitsOnly((formData.get('nif') as string) || '')
    const contactoTelefone = normalizePhone((formData.get('contacto_telefone') as string) || '')

    if (nif && nif.length !== 9) {
      return { success: false, error: 'O NIF deve ter exatamente 9 números.' } satisfies ClienteActionResult
    }

    if (tipo === 'profissional_b2b' && !responsavel?.trim()) {
      return { success: false, error: 'O responsável é obrigatório para cliente profissional.' } satisfies ClienteActionResult
    }

    if (contactoTelefone && !/^\+\d{11,14}$/.test(contactoTelefone)) {
      return { success: false, error: 'O contacto telefónico é inválido.' } satisfies ClienteActionResult
    }

    const data = {
      data_registo:
        (formData.get('data_registo') as string) || new Date().toISOString().slice(0, 10),
      tipo,
      nome: formData.get('nome') as string,
      responsavel,
      nif: nif || null,
      contacto_telefone: contactoTelefone || null,
      email: (formData.get('email') as string) || null,
      morada_sede: (formData.get('morada_sede') as string) || null,
      notas: (formData.get('notas') as string) || null,
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
