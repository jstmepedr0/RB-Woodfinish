'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Cliente } from '@/lib/types/database'
import { criarCliente, atualizarCliente } from '@/lib/actions/clientes'
import { Loader2, Plus, X } from 'lucide-react'

interface ClienteFormProps {
  cliente?: Cliente
}

export function ClienteForm({ cliente }: ClienteFormProps) {
  const [isPending, startTransition] = useTransition()
  const [moradas, setMoradas] = useState<{ morada: string; descricao: string }[]>([])
  const isEdit = !!cliente

  function handleSubmit(formData: FormData) {
    // Adicionar moradas ao formData
    moradas.forEach((m, idx) => {
      formData.append(`morada_${idx}`, m.morada)
      formData.append(`morada_desc_${idx}`, m.descricao)
    })
    formData.append('moradas_count', moradas.length.toString())

    startTransition(() => {
      if (isEdit) {
        atualizarCliente(cliente.id, formData)
      } else {
        criarCliente(formData)
      }
    })
  }

  function adicionarMorada() {
    setMoradas([...moradas, { morada: '', descricao: '' }])
  }

  function removerMorada(idx: number) {
    setMoradas(moradas.filter((_, i) => i !== idx))
  }

  function atualizarMorada(idx: number, field: 'morada' | 'descricao', value: string) {
    const updated = [...moradas]
    updated[idx][field] = value
    setMoradas(updated)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_registo">Data</Label>
              <Input
                id="data_registo"
                name="data_registo"
                type="date"
                required
                defaultValue={cliente?.data_registo ?? new Date().toISOString().slice(0, 10)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Cliente</Label>
              <Select name="tipo" defaultValue={cliente?.tipo ?? 'casual_b2c'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual_b2c">Casual (B2C — Pessoa Singular)</SelectItem>
                  <SelectItem value="profissional_b2b">Profissional (B2B — Empresa)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome / Razão Social</Label>
              <Input
                id="nome"
                name="nome"
                required
                defaultValue={cliente?.nome ?? ''}
                placeholder="Nome completo ou razão social"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel">Cliente / Responsável</Label>
              <Input
                id="responsavel"
                name="responsavel"
                defaultValue={cliente?.responsavel ?? ''}
                placeholder="Pessoa de contacto principal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nif">NIF</Label>
              <Input
                id="nif"
                name="nif"
                defaultValue={cliente?.nif ?? ''}
                placeholder="123456789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contacto_telefone">Contacto (Telefone)</Label>
              <Input
                id="contacto_telefone"
                name="contacto_telefone"
                defaultValue={cliente?.contacto_telefone ?? ''}
                placeholder="+351 912 345 678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={cliente?.email ?? ''}
                placeholder="cliente@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="morada_sede">Morada (Sede / Residência)</Label>
              <Input
                id="morada_sede"
                name="morada_sede"
                defaultValue={cliente?.morada_sede ?? ''}
                placeholder="Rua, Código Postal, Localidade"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              name="notas"
              defaultValue={cliente?.notas ?? ''}
              placeholder="Notas adicionais sobre o cliente..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas_obra">Notas de Obra + Descrição</Label>
            <Textarea
              id="notas_obra"
              name="notas_obra"
              defaultValue={cliente?.notas_obra ?? ''}
              placeholder="Apontamentos de obra, divisões, medições ou descrição livre..."
              rows={4}
            />
          </div>

          {!isEdit && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Moradas de Obra (opcional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={adicionarMorada}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Morada
                </Button>
              </div>

              {moradas.map((m, idx) => (
                <div key={idx} className="p-3 border rounded-lg bg-stone-50 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-stone-700">
                      Morada {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removerMorada(idx)}
                      className="text-stone-400 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <Input
                    placeholder="Morada completa (ex: Rua das Flores 10, 8000-001 Faro)"
                    value={m.morada}
                    onChange={(e) => atualizarMorada(idx, 'morada', e.target.value)}
                  />
                  <Input
                    placeholder="Descrição opcional (ex: Cozinha piso 1)"
                    value={m.descricao}
                    onChange={(e) => atualizarMorada(idx, 'descricao', e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {isEdit ? 'Guardar Alterações' : 'Criar Cliente'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
