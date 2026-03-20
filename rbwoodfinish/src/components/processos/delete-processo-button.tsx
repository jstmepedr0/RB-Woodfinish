'use client'

import { useTransition } from 'react'
import { eliminarProcesso } from '@/lib/actions/processos'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'

interface DeleteProcessoButtonProps {
  processoId: string
}

export function DeleteProcessoButton({ processoId }: DeleteProcessoButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('Tem a certeza que quer eliminar este processo? Esta ação é irreversível.')) return
    startTransition(() => {
      eliminarProcesso(processoId)
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
