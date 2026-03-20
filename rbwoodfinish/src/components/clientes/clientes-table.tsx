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
    <div className="border rounded-lg bg-white">
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
  )
}
