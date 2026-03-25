'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { criarMoradaObra } from '@/lib/actions/moradas'
import { atualizarProcesso, criarProcesso } from '@/lib/actions/processos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus, X } from 'lucide-react'

interface ClienteItem {
  id: string
  nome: string
}

interface MoradaItem {
  id: string
  cliente_id: string
  morada: string
  descricao: string | null
}

interface ProcessoFormProps {
  clientes: ClienteItem[]
  moradasPorCliente: Record<string, MoradaItem[]>
  clienteIdInicial?: string | null
  processo?: {
    id: string
    cliente_id: string
    morada_obra_id: string | null
    notas: string | null
  }
}

export function ProcessoForm({
  clientes,
  moradasPorCliente,
  clienteIdInicial,
  processo,
}: ProcessoFormProps) {
  const router = useRouter()
  const [clienteId, setClienteId] = useState<string | undefined>(
    processo?.cliente_id ?? clienteIdInicial ?? undefined
  )
  const [moradaId, setMoradaId] = useState<string | undefined>(
    processo?.morada_obra_id ?? undefined
  )
  const [showNovaMorada, setShowNovaMorada] = useState(false)
  const [novaMorada, setNovaMorada] = useState('')
  const [novaMoradaDesc, setNovaMoradaDesc] = useState('')
  const [savingMorada, startSavingMorada] = useTransition()
  const [isPending, startTransition] = useTransition()
  const [moradasState, setMoradasState] = useState(moradasPorCliente)
  const [error, setError] = useState<string | null>(null)

  const moradas = clienteId ? moradasState[clienteId] ?? [] : []

  const isEdit = !!processo

  function handleClienteChange(value: string | null) {
    setClienteId(value ?? undefined)
    setMoradaId(undefined)
    setShowNovaMorada(false)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    if (clienteId) formData.set('cliente_id', clienteId)
    if (moradaId) formData.set('morada_obra_id', moradaId)

    startTransition(async () => {
      const result = isEdit && processo
        ? await atualizarProcesso(processo.id, formData)
        : await criarProcesso(formData)

      if (!result.success || !result.id) {
        setError(result.error ?? 'Não foi possível guardar o processo.')
        return
      }

      router.push(`/processos/${result.id}`)
      router.refresh()
    })
  }

  function handleAdicionarMorada() {
    if (!clienteId || !novaMorada.trim()) return

    const formData = new FormData()
    formData.set('cliente_id', clienteId)
    formData.set('morada', novaMorada.trim())
    formData.set('descricao', novaMoradaDesc.trim())

    startSavingMorada(async () => {
      const novaMoradaCriada = await criarMoradaObra(formData)
      if (!novaMoradaCriada) return

      setMoradasState((current) => ({
        ...current,
        [clienteId]: [novaMoradaCriada, ...(current[clienteId] ?? [])],
      }))
      setMoradaId(novaMoradaCriada.id)
      setNovaMorada('')
      setNovaMoradaDesc('')
      setShowNovaMorada(false)
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="hidden" name="cliente_id" value={clienteId ?? ''} />
          {moradaId && <input type="hidden" name="morada_obra_id" value={moradaId} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={clienteId} onValueChange={handleClienteChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Morada de Obra</Label>
                {!!clienteId && !showNovaMorada && (
                  <button
                    type="button"
                    onClick={() => setShowNovaMorada(true)}
                    className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Nova morada
                  </button>
                )}
              </div>

              <Select
                value={moradaId}
                onValueChange={(value) => setMoradaId(value ?? undefined)}
                disabled={!clienteId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !clienteId
                        ? 'Selecione um cliente primeiro'
                        : moradas.length === 0
                        ? 'Sem moradas registadas'
                        : 'Selecionar morada...'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {moradas.map((morada) => (
                    <SelectItem key={morada.id} value={morada.id}>
                      {morada.morada}
                      {morada.descricao ? ` — ${morada.descricao}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {showNovaMorada && (
            <div className="p-4 border border-dashed rounded-lg bg-stone-50 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-stone-700">Nova Morada de Obra</p>
                <button
                  type="button"
                  onClick={() => setShowNovaMorada(false)}
                  className="text-stone-400 hover:text-stone-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Input
                placeholder="Morada completa (ex: Rua das Flores 10, 8000-001 Faro)"
                value={novaMorada}
                onChange={(e) => setNovaMorada(e.target.value)}
              />
              <Input
                placeholder="Descrição opcional (ex: Cozinha piso 1)"
                value={novaMoradaDesc}
                onChange={(e) => setNovaMoradaDesc(e.target.value)}
              />
              <Button
                type="button"
                size="sm"
                disabled={!novaMorada.trim() || savingMorada}
                onClick={handleAdicionarMorada}
              >
                {savingMorada ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-1" />
                )}
                Guardar Morada
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              name="notas"
              defaultValue={processo?.notas ?? ''}
              placeholder="Notas sobre o processo..."
              rows={3}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isPending || savingMorada || !clienteId || !moradaId}
              className="w-full sm:w-auto"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isEdit ? 'Guardar Alterações' : 'Criar Processo'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
