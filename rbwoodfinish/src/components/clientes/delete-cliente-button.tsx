'use client'

import { useTransition } from 'react'
import { eliminarCliente } from '@/lib/actions/clientes'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2 } from 'lucide-react'

interface DeleteClienteButtonProps {
  clienteId: string
}

export function DeleteClienteButton({ clienteId }: DeleteClienteButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('Tem a certeza que quer eliminar este cliente? Esta ação é irreversível.')) return

    startTransition(() => {
      eliminarCliente(clienteId)
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-destructive hover:text-destructive"
      onClick={handleDelete}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin mr-1" />
      ) : (
        <Trash2 className="h-4 w-4 mr-1" />
      )}
      Eliminar
    </Button>
  )
}
