import { getUser } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { ClienteForm } from '@/components/clientes/cliente-form'

export default async function NovoClientePage() {
  const profile = await getUser()
  if (!profile) redirect('/login')
  if (!['admin', 'comercial'].includes(profile.role)) redirect('/')

  return (
    <>
      <Header title="Novo Cliente" description="Criar ficha de cliente" />
      <ClienteForm />
    </>
  )
}
