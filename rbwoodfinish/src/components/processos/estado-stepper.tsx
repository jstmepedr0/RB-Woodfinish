'use client'

import { cn } from '@/lib/utils'
import { ESTADOS_PROCESSO } from '@/lib/constants'
import { EstadoProcesso } from '@/lib/types/database'
import { atualizarEstadoProcesso } from '@/lib/actions/processos'
import { Check } from 'lucide-react'
import { useTransition } from 'react'

interface EstadoStepperProps {
  processoId: string
  estadoAtual: EstadoProcesso
  canEdit: boolean
}

export function EstadoStepper({ processoId, estadoAtual, canEdit }: EstadoStepperProps) {
  const [isPending, startTransition] = useTransition()
  const ordemAtual = ESTADOS_PROCESSO.find((e) => e.value === estadoAtual)?.ordem ?? 0

  function handleClick(estado: EstadoProcesso, ordem: number) {
    if (!canEdit || isPending) return
    // Só permite avançar ou recuar 1 passo
    if (Math.abs(ordem - ordemAtual) !== 1) return

    startTransition(() => {
      atualizarEstadoProcesso(processoId, estado)
    })
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {ESTADOS_PROCESSO.map((estado) => {
          const isCurrent = estado.value === estadoAtual
          const isCompleted = estado.ordem < ordemAtual
          const isClickable = canEdit && Math.abs(estado.ordem - ordemAtual) === 1

          return (
            <button
              key={estado.value}
              disabled={!isClickable || isPending}
              onClick={() => handleClick(estado.value, estado.ordem)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all',
                isCurrent && 'bg-stone-900 text-white',
                isCompleted && 'bg-green-100 text-green-800',
                !isCurrent && !isCompleted && 'bg-stone-100 text-stone-400',
                isClickable && 'cursor-pointer hover:ring-2 hover:ring-stone-300',
                !isClickable && 'cursor-default',
                isPending && 'opacity-50'
              )}
            >
              {isCompleted && <Check className="h-3 w-3" />}
              {estado.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
