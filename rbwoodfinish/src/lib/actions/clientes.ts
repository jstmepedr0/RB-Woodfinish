'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/supabase/auth'

export async function criarCliente(formData: FormData) {
  const profile = await requireRole(['admin', 'comercial'])
  const supabase = await createClient()

  const data = {
    tipo: formData.get('tipo') as string,
    nome: formData.get('nome') as string,
    nif: (formData.get('nif') as string) || null,
    contacto_telefone: (formData.get('contacto_telefone') as string) || null,
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

  if (error) throw new Error(error.message)

  // Criar moradas de obra se existirem
  const moradasCount = parseInt(formData.get('moradas_count') as string || '0')
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
      await supabase.from('moradas_obra').insert(moradasToInsert)
    }
  }

  revalidatePath('/clientes')
  redirect(`/clientes/${cliente.id}`)
}

export async function atualizarCliente(id: string, formData: FormData) {
  await requireRole(['admin', 'comercial'])
  const supabase = await createClient()

  const data = {
    tipo: formData.get('tipo') as string,
    nome: formData.get('nome') as string,
    nif: (formData.get('nif') as string) || null,
    contacto_telefone: (formData.get('contacto_telefone') as string) || null,
    email: (formData.get('email') as string) || null,
    morada_sede: (formData.get('morada_sede') as string) || null,
    notas: (formData.get('notas') as string) || null,
  }

  const { error } = await supabase
    .from('clientes')
    .update(data)
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/clientes')
  revalidatePath(`/clientes/${id}`)
  redirect(`/clientes/${id}`)
}

export async function eliminarCliente(id: string) {
  await requireRole(['admin'])
  const supabase = await createClient()

  const { error } = await supabase.from('clientes').delete().eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/clientes')
  redirect('/clientes')
}
