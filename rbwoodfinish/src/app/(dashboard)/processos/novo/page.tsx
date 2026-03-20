import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { ProcessoNovoForm } from '@/components/processos/processo-novo-form'

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

  let moradas: { id: string; morada: string; descricao: string | null }[] = []
  if (cliente_id) {
    const { data } = await supabase
      .from('moradas_obra')
      .select('id, morada, descricao')
      .eq('cliente_id', cliente_id)
      .order('created_at', { ascending: false })
    moradas = data ?? []
  }

  return (
    <>
      <Header title="Novo Processo" description="Criar novo processo / obra" />
      <ProcessoNovoForm
        clientes={clientes ?? []}
        moradas={moradas}
        clienteIdInicial={cliente_id ?? null}
      />
    </>
  )
}
