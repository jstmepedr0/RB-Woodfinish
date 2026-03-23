import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { ProcessoForm } from '@/components/processos/processo-form'

interface MoradaOption {
  id: string
  cliente_id: string
  morada: string
  descricao: string | null
}

export default async function NovoProcessoPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente_id?: string }>
}) {
  const { cliente_id } = await searchParams
  const profile = await getUser()
  if (!profile) redirect('/login')
  if (!['admin', 'comercial'].includes(profile.role)) redirect('/')

  const supabase = await createClient()

  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nome')
    .order('nome')

  const { data: moradas } = await supabase
    .from('moradas_obra')
    .select('id, cliente_id, morada, descricao')
    .order('created_at', { ascending: false })

  const moradasPorCliente = (moradas ?? []).reduce<Record<string, MoradaOption[]>>(
    (acc, morada) => {
      if (!acc[morada.cliente_id]) acc[morada.cliente_id] = []
      acc[morada.cliente_id].push(morada)
      return acc
    },
    {}
  )

  return (
    <>
      <Header title="Novo Processo" description="Criar novo processo / obra" />
      <ProcessoForm
        clientes={clientes ?? []}
        moradasPorCliente={moradasPorCliente}
        clienteIdInicial={cliente_id ?? null}
      />
    </>
  )
}
