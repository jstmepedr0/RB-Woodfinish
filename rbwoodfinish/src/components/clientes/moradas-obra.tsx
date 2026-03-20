'use client'

import { useState, useTransition } from 'react'
import { MoradaObra } from '@/lib/types/database'
import { criarMoradaObra, eliminarMoradaObra } from '@/lib/actions/moradas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Plus, Trash2, Loader2 } from 'lucide-react'

interface MoradasObraProps {
  clienteId: string
  moradas: MoradaObra[]
  canEdit: boolean
}

export function MoradasObra({ clienteId, moradas, canEdit }: MoradasObraProps) {
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await criarMoradaObra(formData)
      setShowForm(false)
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Tem a certeza que quer eliminar esta morada?')) return
    startTransition(() => {
      eliminarMoradaObra(id, clienteId)
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold">Moradas de Obra</CardTitle>
        {canEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <form action={handleSubmit} className="space-y-3 p-3 border rounded-md bg-stone-50">
            <input type="hidden" name="cliente_id" value={clienteId} />
            <div className="space-y-2">
              <Label htmlFor="morada">Morada</Label>
              <Input id="morada" name="morada" required placeholder="Rua, Código Postal, Localidade" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input id="descricao" name="descricao" placeholder="Ex: Cozinha do piso 1" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {moradas.length === 0 && !showForm && (
          <p className="text-sm text-stone-500">Nenhuma morada de obra registada.</p>
        )}

        {moradas.map((morada) => (
          <div
            key={morada.id}
            className="flex items-start justify-between p-3 border rounded-md bg-white"
          >
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-stone-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-stone-900">{morada.morada}</p>
                {morada.descricao && (
                  <p className="text-xs text-stone-500 mt-0.5">{morada.descricao}</p>
                )}
              </div>
            </div>
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="text-stone-400 hover:text-destructive h-8 w-8 p-0"
                onClick={() => handleDelete(morada.id)}
                disabled={isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
