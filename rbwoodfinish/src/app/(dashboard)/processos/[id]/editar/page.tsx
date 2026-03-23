import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/auth'
import { redirect, notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { ProcessoForm } from '@/components/processos/processo-form'

export default async function EditarProcessoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await getUser()
  if (!profile) redirect('/login')
  if (!['admin', 'comercial'].includes(profile.role)) redirect('/processos')

  const supabase = await createClient()

  const [{ data: processo }, { data: clientes }, { data: moradas }] = await Promise.all([
    supabase
      .from('processos')
      .select('id, cliente_id, morada_obra_id, notas')
      .eq('id', id)
      .single(),
    supabase.from('clientes').select('id, nome').order('nome'),
    supabase
      .from('moradas_obra')
      .select('id, cliente_id, morada, descricao')
      .order('created_at', { ascending: false }),
  ])

  if (!processo) notFound()

  const moradasPorCliente = (moradas ?? []).reduce<
    Record<string, { id: string; cliente_id: string; morada: string; descricao: string | null }[]>
  >((acc, morada) => {
    if (!acc[morada.cliente_id]) acc[morada.cliente_id] = []
    acc[morada.cliente_id].push(morada)
    return acc
  }, {})

  return (
    <>
      <Header title="Editar Processo" description={`Processo #${id.slice(0, 8)}`} />
      <ProcessoForm
        clientes={clientes ?? []}
        moradasPorCliente={moradasPorCliente}
        processo={processo}
      />
    </>
  )
}
