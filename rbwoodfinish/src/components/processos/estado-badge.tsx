import { Badge } from '@/components/ui/badge'
import { ESTADOS_PROCESSO, ESTADO_CORES } from '@/lib/constants'
import { EstadoProcesso } from '@/lib/types/database'

interface EstadoBadgeProps {
  estado: EstadoProcesso
}

export function EstadoBadge({ estado }: EstadoBadgeProps) {
  const config = ESTADOS_PROCESSO.find((e) => e.value === estado)
  const cores = ESTADO_CORES[estado]

  return (
    <Badge variant="outline" className={`${cores} text-xs font-medium`}>
      {config?.label ?? estado}
    </Badge>
  )
}
