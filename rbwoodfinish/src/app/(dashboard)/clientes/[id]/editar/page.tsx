import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/auth'
import { redirect, notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { ClienteForm } from '@/components/clientes/cliente-form'

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await getUser()
  if (!profile) redirect('/login')
  if (!['admin', 'comercial'].includes(profile.role)) redirect('/')

  const supabase = await createClient()
  const { data: cliente } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single()

  if (!cliente) notFound()

  return (
    <>
      <Header title="Editar Cliente" description={cliente.nome} />
      <ClienteForm cliente={cliente} />
    </>
  )
}
