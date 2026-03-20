import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { ClientesTable } from '@/components/clientes/clientes-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function ClientesPage() {
  const profile = await getUser()
  if (!profile) redirect('/login')

  const canCreate = ['admin', 'comercial'].includes(profile.role)

  const supabase = await createClient()
  const { data: clientes } = await supabase
    .from('clientes')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <>
      <Header
        title="Clientes"
        description="Gestão de fichas de cliente"
        actions={
          canCreate ? (
            <Link href="/clientes/novo">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Novo Cliente
              </Button>
            </Link>
          ) : undefined
        }
      />
      <ClientesTable clientes={clientes ?? []} />
    </>
  )
}
