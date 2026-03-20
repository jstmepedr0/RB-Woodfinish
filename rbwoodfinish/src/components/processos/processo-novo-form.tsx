'use client'

import { useState, useEffect, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { criarProcesso } from '@/lib/actions/processos'
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

interface MoradaItem {
  id: string
  morada: string
  descricao: string | null
}

interface ProcessoNovoFormProps {
  clientes: { id: string; nome: string }[]
  moradas: MoradaItem[]
  clienteIdInicial: string | null
}

export function ProcessoNovoForm({
  clientes,
  moradas: moradasIniciais,
  clienteIdInicial,
}: ProcessoNovoFormProps) {
  const [clienteId, setClienteId] = useState<string | undefined>(clienteIdInicial ?? undefined)
  const [moradas, setMoradas] = useState<MoradaItem[]>(moradasIniciais)
  const [moradaId, setMoradaId] = useState<string | undefined>(undefined)
  const [loadingMoradas, setLoadingMoradas] = useState(false)
  const [showNovaMorada, setShowNovaMorada] = useState(false)
  const [novaMorada, setNovaMorada] = useState('')
  const [novaMoradaDesc, setNovaMoradaDesc] = useState('')
  const [savingMorada, setSavingMorada] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Sempre que muda o cliente, vai buscar as moradas (incluindo o inicial)
  useEffect(() => {
    if (!clienteId) {
      setMoradas([])
      setMoradaId(undefined)
      return
    }


    setLoadingMoradas(true)
    const supabase = createClient()
    supabase
      .from('moradas_obra')
      .select('id, morada, descricao')
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMoradas(data ?? [])
        setMoradaId(undefined)
        setLoadingMoradas(false)
      })
  }, [clienteId])

  async function handleAdicionarMorada() {
    if (!novaMorada.trim() || !clienteId) return

    setSavingMorada(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('moradas_obra')
      .insert({
        cliente_id: clienteId,
        morada: novaMorada.trim(),
        descricao: novaMoradaDesc.trim() || null,
      })
      .select('id, morada, descricao')
      .single()

    if (!error && data) {
      const updated = [data, ...moradas]
      setMoradas(updated)
      setMoradaId(data.id)
      setNovaMorada('')
      setNovaMoradaDesc('')
      setShowNovaMorada(false)
    }
    setSavingMorada(false)
  }

  function handleSubmit(formData: FormData) {
    // Garantir que morada_obra_id está no formData (Select controlado não o inclui automaticamente)
    if (moradaId) formData.set('morada_obra_id', moradaId)
    if (clienteId) formData.set('cliente_id', clienteId)
    startTransition(() => {
      criarProcesso(formData)
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-6">
          {/* Campo hidden para morada selecionada */}
          <input type="hidden" name="cliente_id" value={clienteId ?? ''} />
          {moradaId && <input type="hidden" name="morada_obra_id" value={moradaId} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select
                value={clienteId}
                onValueChange={(v) => setClienteId(v ?? undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
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

              {loadingMoradas ? (
                <div className="flex items-center gap-2 h-10 px-3 border rounded-md text-sm text-stone-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  A carregar moradas...
                </div>
              ) : (
                <Select
                  value={moradaId}
                  onValueChange={(v) => setMoradaId(v ?? undefined)}
                  disabled={!clienteId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !clienteId
                          ? 'Selecione um cliente primeiro'
                          : loadingMoradas
                          ? 'A carregar...'
                          : moradas.length === 0
                          ? 'Sem moradas — adicione uma abaixo'
                          : 'Selecionar morada...'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {moradas.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.morada}
                        {m.descricao ? ` — ${m.descricao}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Formulário inline para adicionar nova morada */}
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
              <div className="space-y-2">
                <Input
                  placeholder="Morada completa (ex: Rua das Flores 10, 8000-001 Faro)"
                  value={novaMorada}
                  onChange={(e) => setNovaMorada(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Descrição opcional (ex: Cozinha piso 1)"
                  value={novaMoradaDesc}
                  onChange={(e) => setNovaMoradaDesc(e.target.value)}
                />
              </div>
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
              placeholder="Notas sobre o processo..."
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending || !clienteId || loadingMoradas}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Criar Processo
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
