import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/auth'
import { redirect, notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { MoradasObra } from '@/components/clientes/moradas-obra'
import { TIPO_CLIENTE_LABEL } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, FolderPlus, Phone, Mail, MapPin, FileText } from 'lucide-react'
import Link from 'next/link'
import { Cliente, MoradaObra } from '@/lib/types/database'

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await getUser()
  if (!profile) redirect('/login')

  const supabase = await createClient()

  const [{ data: cliente }, { data: moradas }, { data: processos }] = await Promise.all([
    supabase.from('clientes').select('*').eq('id', id).single(),
    supabase.from('moradas_obra').select('*').eq('cliente_id', id).order('created_at', { ascending: false }),
    supabase.from('processos').select('id, estado_global, created_at').eq('cliente_id', id).order('created_at', { ascending: false }),
  ])

  if (!cliente) notFound()

  const canEdit = ['admin', 'comercial'].includes(profile.role)

  return (
    <>
      <Header
        title={cliente.nome}
        description={TIPO_CLIENTE_LABEL[cliente.tipo]}
        actions={
          <div className="flex gap-2">
            {canEdit && (
              <>
                <Link href={`/clientes/${id}/editar`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </Link>
                <Link href={`/processos/novo?cliente_id=${id}`}>
                  <Button size="sm">
                    <FolderPlus className="h-4 w-4 mr-1" />
                    Novo Processo
                  </Button>
                </Link>
              </>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Dados do Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-stone-500 uppercase tracking-wider">Tipo</p>
                  <Badge variant="secondary">{TIPO_CLIENTE_LABEL[cliente.tipo]}</Badge>
                </div>
                {cliente.nif && (
                  <div className="space-y-1">
                    <p className="text-xs text-stone-500 uppercase tracking-wider">NIF</p>
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-stone-400" />
                      {cliente.nif}
                    </p>
                  </div>
                )}
                {cliente.contacto_telefone && (
                  <div className="space-y-1">
                    <p className="text-xs text-stone-500 uppercase tracking-wider">Telefone</p>
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-stone-400" />
                      {cliente.contacto_telefone}
                    </p>
                  </div>
                )}
                {cliente.email && (
                  <div className="space-y-1">
                    <p className="text-xs text-stone-500 uppercase tracking-wider">Email</p>
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-stone-400" />
                      {cliente.email}
                    </p>
                  </div>
                )}
                {cliente.morada_sede && (
                  <div className="space-y-1 sm:col-span-2">
                    <p className="text-xs text-stone-500 uppercase tracking-wider">Morada</p>
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-stone-400" />
                      {cliente.morada_sede}
                    </p>
                  </div>
                )}
                {cliente.notas && (
                  <div className="space-y-1 sm:col-span-2">
                    <p className="text-xs text-stone-500 uppercase tracking-wider">Notas</p>
                    <p className="text-sm text-stone-700">{cliente.notas}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <MoradasObra
            clienteId={id}
            moradas={(moradas as MoradaObra[]) ?? []}
            canEdit={canEdit}
          />
        </div>

        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Processos</CardTitle>
            </CardHeader>
            <CardContent>
              {(!processos || processos.length === 0) ? (
                <p className="text-sm text-stone-500">Nenhum processo associado.</p>
              ) : (
                <div className="space-y-2">
                  {processos.map((p) => (
                    <Link
                      key={p.id}
                      href={`/processos/${p.id}`}
                      className="flex items-center justify-between p-2.5 border rounded-md hover:bg-stone-50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-stone-900">
                          Processo #{p.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-stone-500">
                          {new Date(p.created_at).toLocaleDateString('pt-PT')}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {p.estado_global}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
