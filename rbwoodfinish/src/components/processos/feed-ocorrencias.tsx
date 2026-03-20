'use client'

import { useState, useTransition } from 'react'
import { Ocorrencia } from '@/lib/types/database'
import { criarOcorrencia } from '@/lib/actions/ocorrencias'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  MessageSquare,
  FileText,
  Image,
  ArrowRightLeft,
  StickyNote,
  Send,
  Loader2,
} from 'lucide-react'

interface FeedOcorrenciasProps {
  processoId: string
  ocorrencias: Ocorrencia[]
}

const TIPO_ICONS: Record<string, React.ElementType> = {
  nota: StickyNote,
  foto: Image,
  estado_mudou: ArrowRightLeft,
  documento: FileText,
  mensagem: MessageSquare,
}

const TIPO_COLORS: Record<string, string> = {
  nota: 'bg-amber-100 text-amber-700',
  foto: 'bg-purple-100 text-purple-700',
  estado_mudou: 'bg-blue-100 text-blue-700',
  documento: 'bg-green-100 text-green-700',
  mensagem: 'bg-stone-100 text-stone-700',
}

export function FeedOcorrencias({ processoId, ocorrencias }: FeedOcorrenciasProps) {
  const [nota, setNota] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nota.trim()) return

    startTransition(async () => {
      await criarOcorrencia(processoId, 'nota', nota.trim())
      setNota('')
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Feed de Ocorrências</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Adicionar nota ao processo..."
            rows={2}
            className="resize-none"
          />
          <Button
            type="submit"
            size="sm"
            disabled={isPending || !nota.trim()}
            className="self-end"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        <div className="space-y-3">
          {ocorrencias.length === 0 && (
            <p className="text-sm text-stone-500 text-center py-4">
              Sem ocorrências registadas.
            </p>
          )}

          {ocorrencias.map((oc) => {
            const Icon = TIPO_ICONS[oc.tipo] ?? MessageSquare
            const color = TIPO_COLORS[oc.tipo] ?? 'bg-stone-100 text-stone-700'

            return (
              <div key={oc.id} className="flex gap-3">
                <div className={`flex items-center justify-center h-8 w-8 rounded-full shrink-0 ${color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-stone-900">
                      {oc.utilizador?.nome ?? 'Sistema'}
                    </span>
                    <span className="text-xs text-stone-400">
                      {new Date(oc.created_at).toLocaleString('pt-PT', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-stone-700 mt-0.5">{oc.conteudo}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
