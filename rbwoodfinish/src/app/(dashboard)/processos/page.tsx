import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { EstadoBadge } from '@/components/processos/estado-badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { EstadoProcesso } from '@/lib/types/database'

export default async function ProcessosPage() {
  const profile = await getUser()
  if (!profile) redirect('/login')

  const canCreate = ['admin', 'comercial'].includes(profile.role)

  const supabase = await createClient()
  const { data: processos } = await supabase
    .from('processos')
    .select('id, estado_global, notas, created_at, cliente:clientes(id, nome), morada_obra:moradas_obra(morada)')
    .order('created_at', { ascending: false })

  return (
    <>
      <Header
        title="Processos"
        description="Gestão de processos e obras"
        actions={
          canCreate ? (
            <Link href="/processos/novo">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Novo Processo
              </Button>
            </Link>
          ) : undefined
        }
      />

      {(!processos || processos.length === 0) ? (
        <div className="text-center py-12 text-stone-500">
          <p>Nenhum processo encontrado.</p>
        </div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="md:hidden space-y-2">
            {processos.map((p) => {
              const cliente = p.cliente as unknown as { id: string; nome: string } | null
              const morada = p.morada_obra as unknown as { morada: string } | null

              return (
                <Link
                  key={p.id}
                  href={`/processos/${p.id}`}
                  className="block bg-white border rounded-lg p-4 hover:border-stone-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-stone-900">#{p.id.slice(0, 8)}</span>
                    <EstadoBadge estado={p.estado_global as EstadoProcesso} />
                  </div>
                  {cliente && (
                    <p className="mt-1.5 text-sm text-stone-700">{cliente.nome}</p>
                  )}
                  {morada?.morada && (
                    <p className="mt-1 text-sm text-stone-500 truncate">{morada.morada}</p>
                  )}
                  <p className="mt-2 text-xs text-stone-400">
                    {new Date(p.created_at).toLocaleDateString('pt-PT')}
                  </p>
                </Link>
              )
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block border rounded-lg bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Processo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Morada de Obra</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processos.map((p) => {
                  const cliente = p.cliente as unknown as { id: string; nome: string } | null
                  const morada = p.morada_obra as unknown as { morada: string } | null

                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Link
                          href={`/processos/${p.id}`}
                          className="font-medium text-stone-900 hover:underline"
                        >
                          #{p.id.slice(0, 8)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {cliente ? (
                          <Link
                            href={`/clientes/${cliente.id}`}
                            className="text-sm text-stone-700 hover:underline"
                          >
                            {cliente.nome}
                          </Link>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-stone-600 max-w-48 truncate">
                        {morada?.morada ?? '—'}
                      </TableCell>
                      <TableCell>
                        <EstadoBadge estado={p.estado_global as EstadoProcesso} />
                      </TableCell>
                      <TableCell className="text-sm text-stone-500">
                        {new Date(p.created_at).toLocaleDateString('pt-PT')}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </>
  )
}
