import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/auth'
import { redirect, notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { EstadoStepper } from '@/components/processos/estado-stepper'
import { PastasDigitais } from '@/components/processos/pastas-digitais'
import { FeedOcorrencias } from '@/components/processos/feed-ocorrencias'
import { EstadoBadge } from '@/components/processos/estado-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Trash2, User, MapPin, Calendar } from 'lucide-react'
import Link from 'next/link'
import { EstadoProcesso, Documento, Ocorrencia } from '@/lib/types/database'
import { DeleteProcessoButton } from '@/components/processos/delete-processo-button'

export default async function ProcessoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await getUser()
  if (!profile) redirect('/login')

  const supabase = await createClient()

  const [
    { data: processo },
    { data: documentos },
    { data: ocorrencias },
  ] = await Promise.all([
    supabase
      .from('processos')
      .select('*, cliente:clientes(*), morada_obra:moradas_obra(*), comercial:profiles!processos_comercial_id_fkey(*)')
      .eq('id', id)
      .single(),
    supabase
      .from('documentos')
      .select('*, uploaded_por:profiles(*)')
      .eq('processo_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('ocorrencias')
      .select('*, utilizador:profiles(*)')
      .eq('processo_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (!processo) notFound()

  const canEditState = ['admin', 'comercial'].includes(profile.role)
  const isAdmin = profile.role === 'admin'

  const cliente = processo.cliente as unknown as { id: string; nome: string } | null
  const moradaObra = processo.morada_obra as unknown as { morada: string } | null
  const comercial = processo.comercial as unknown as { nome: string } | null

  return (
    <>
      <Header
        title={`Processo #${id.slice(0, 8)}`}
        description={cliente?.nome ?? 'Sem cliente'}
        actions={
          isAdmin ? (
            <DeleteProcessoButton processoId={id} />
          ) : undefined
        }
      />

      <div className="mb-6">
        <EstadoStepper
          processoId={id}
          estadoAtual={processo.estado_global as EstadoProcesso}
          canEdit={canEditState}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Informação do Processo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-stone-500 uppercase tracking-wider">Estado</p>
                  <EstadoBadge estado={processo.estado_global as EstadoProcesso} />
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-stone-500 uppercase tracking-wider">Cliente</p>
                  {cliente ? (
                    <Link
                      href={`/clientes/${cliente.id}`}
                      className="text-sm font-medium text-stone-900 hover:underline flex items-center gap-1.5"
                    >
                      <User className="h-3.5 w-3.5 text-stone-400" />
                      {cliente.nome}
                    </Link>
                  ) : (
                    <span className="text-sm text-stone-400">—</span>
                  )}
                </div>

                {moradaObra && (
                  <div className="space-y-1">
                    <p className="text-xs text-stone-500 uppercase tracking-wider">Morada de Obra</p>
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-stone-400" />
                      {moradaObra.morada}
                    </p>
                  </div>
                )}

                {comercial && (
                  <div className="space-y-1">
                    <p className="text-xs text-stone-500 uppercase tracking-wider">Comercial</p>
                    <p className="text-sm font-medium">{comercial.nome}</p>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-xs text-stone-500 uppercase tracking-wider">Criado em</p>
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-stone-400" />
                    {new Date(processo.created_at).toLocaleDateString('pt-PT')}
                  </p>
                </div>

                {processo.data_adjudicacao && (
                  <div className="space-y-1">
                    <p className="text-xs text-stone-500 uppercase tracking-wider">Adjudicação</p>
                    <p className="text-sm font-medium">
                      {new Date(processo.data_adjudicacao).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                )}

                {processo.notas && (
                  <div className="space-y-1 sm:col-span-2">
                    <p className="text-xs text-stone-500 uppercase tracking-wider">Notas</p>
                    <p className="text-sm text-stone-700">{processo.notas}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <PastasDigitais
            processoId={id}
            documentos={(documentos as Documento[]) ?? []}
            canUpload={true}
            canDelete={isAdmin}
          />
        </div>

        <div>
          <FeedOcorrencias
            processoId={id}
            ocorrencias={(ocorrencias as Ocorrencia[]) ?? []}
          />
        </div>
      </div>
    </>
  )
}
