import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { ESTADOS_PROCESSO, ESTADO_CORES, ROLES_LABEL } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, FolderKanban, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { EstadoProcesso } from '@/lib/types/database'

export default async function DashboardPage() {
  const profile = await getUser()
  if (!profile) redirect('/login')

  const supabase = await createClient()

  const [
    { count: totalClientes },
    { count: totalProcessos },
    { data: processos },
    { data: recentOcorrencias },
  ] = await Promise.all([
    supabase.from('clientes').select('*', { count: 'exact', head: true }),
    supabase.from('processos').select('*', { count: 'exact', head: true }),
    supabase.from('processos').select('id, estado_global, cliente:clientes(nome), created_at').order('created_at', { ascending: false }).limit(50),
    supabase.from('ocorrencias').select('id, tipo, conteudo, created_at, utilizador:profiles(nome)').order('created_at', { ascending: false }).limit(10),
  ])

  // Contar processos por estado
  const porEstado: Record<string, number> = {}
  ESTADOS_PROCESSO.forEach((e) => { porEstado[e.value] = 0 })
  processos?.forEach((p) => {
    porEstado[p.estado_global] = (porEstado[p.estado_global] || 0) + 1
  })

  const processosAtivos = (totalProcessos ?? 0) - (porEstado['concluido'] ?? 0)

  return (
    <>
      <Header
        title={`Olá, ${profile.nome}`}
        description={`${ROLES_LABEL[profile.role]} — Dashboard`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">Total Clientes</p>
                <p className="text-2xl font-bold text-stone-900">{totalClientes ?? 0}</p>
              </div>
              <Users className="h-8 w-8 text-stone-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">Processos Ativos</p>
                <p className="text-2xl font-bold text-stone-900">{processosAtivos}</p>
              </div>
              <FolderKanban className="h-8 w-8 text-stone-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">Total Processos</p>
                <p className="text-2xl font-bold text-stone-900">{totalProcessos ?? 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-stone-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">Concluídos</p>
                <p className="text-2xl font-bold text-stone-900">{porEstado['concluido'] ?? 0}</p>
              </div>
              <Clock className="h-8 w-8 text-stone-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Processos por Fase</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ESTADOS_PROCESSO.map((estado) => {
                  const count = porEstado[estado.value] ?? 0
                  const pct = (totalProcessos ?? 0) > 0
                    ? Math.round((count / (totalProcessos ?? 1)) * 100)
                    : 0

                  return (
                    <div key={estado.value} className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={`${ESTADO_CORES[estado.value as EstadoProcesso]} text-xs w-40 justify-center`}
                      >
                        {estado.label}
                      </Badge>
                      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-stone-800 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-stone-700 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(!recentOcorrencias || recentOcorrencias.length === 0) && (
                  <p className="text-sm text-stone-500">Sem atividade recente.</p>
                )}
                {recentOcorrencias?.map((oc) => (
                  <div key={oc.id} className="border-b border-stone-100 pb-2 last:border-0">
                    <p className="text-sm text-stone-700 line-clamp-2">{oc.conteudo}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-stone-400">
                        {(oc.utilizador as unknown as { nome: string } | null)?.nome ?? 'Sistema'}
                      </span>
                      <span className="text-xs text-stone-300">·</span>
                      <span className="text-xs text-stone-400">
                        {new Date(oc.created_at).toLocaleString('pt-PT', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/clientes"
              className="text-sm text-stone-600 hover:text-stone-900 hover:underline"
            >
              Ver todos os clientes →
            </Link>
            <Link
              href="/processos"
              className="text-sm text-stone-600 hover:text-stone-900 hover:underline"
            >
              Ver todos os processos →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
