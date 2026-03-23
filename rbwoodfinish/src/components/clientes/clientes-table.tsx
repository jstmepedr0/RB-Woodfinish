import Link from 'next/link'
import { Cliente } from '@/lib/types/database'
import { TIPO_CLIENTE_LABEL } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Phone, Mail } from 'lucide-react'

interface ClientesTableProps {
  clientes: Cliente[]
}

export function ClientesTable({ clientes }: ClientesTableProps) {
  if (clientes.length === 0) {
    return (
      <div className="text-center py-12 text-stone-500">
        <p>Nenhum cliente encontrado.</p>
      </div>
    )
  }

  return (
    <>
      {/* Mobile card list */}
      <div className="md:hidden space-y-2">
        {clientes.map((cliente) => (
          <Link
            key={cliente.id}
            href={`/clientes/${cliente.id}`}
            className="block bg-white border rounded-lg p-4 hover:border-stone-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium text-stone-900">{cliente.nome}</span>
              <Badge variant="secondary" className="text-xs shrink-0">
                {TIPO_CLIENTE_LABEL[cliente.tipo]}
              </Badge>
            </div>
            <div className="mt-2 space-y-1">
              {cliente.contacto_telefone && (
                <div className="flex items-center gap-1.5 text-sm text-stone-600">
                  <Phone className="h-3.5 w-3.5 text-stone-400" />
                  {cliente.contacto_telefone}
                </div>
              )}
              {cliente.email && (
                <div className="flex items-center gap-1.5 text-sm text-stone-600">
                  <Mail className="h-3.5 w-3.5 text-stone-400" />
                  {cliente.email}
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-stone-400">
              {cliente.nif && <span>NIF: {cliente.nif}</span>}
              <span>{new Date(cliente.created_at).toLocaleDateString('pt-PT')}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>NIF</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.id} className="group">
                <TableCell>
                  <Link
                    href={`/clientes/${cliente.id}`}
                    className="font-medium text-stone-900 hover:underline"
                  >
                    {cliente.nome}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {TIPO_CLIENTE_LABEL[cliente.tipo]}
                  </Badge>
                </TableCell>
                <TableCell className="text-stone-600 text-sm">
                  {cliente.nif ?? '—'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3 text-sm text-stone-600">
                    {cliente.contacto_telefone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {cliente.contacto_telefone}
                      </span>
                    )}
                    {cliente.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {cliente.email}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-stone-500 text-sm">
                  {new Date(cliente.created_at).toLocaleDateString('pt-PT')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
