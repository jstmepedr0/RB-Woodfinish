'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
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

const PHONE_PREFIXES = [
  { value: '+351', label: 'Portugal (+351)', minDigits: 9, maxDigits: 9 },
  { value: '+34', label: 'Espanha (+34)', minDigits: 9, maxDigits: 9 },
  { value: '+33', label: 'França (+33)', minDigits: 9, maxDigits: 9 },
  { value: '+44', label: 'Reino Unido (+44)', minDigits: 9, maxDigits: 10 },
]

function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
}

function splitPhoneNumber(value: string | null | undefined) {
  const raw = value?.trim() ?? ''
  const normalized = raw.replace(/\s+/g, '')

  const match = [...PHONE_PREFIXES]
    .sort((a, b) => b.value.length - a.value.length)
    .find((prefix) => normalized.startsWith(prefix.value))

  if (!match) {
    return {
      prefix: '+351',
      number: digitsOnly(normalized),
    }
  }

  return {
    prefix: match.value,
    number: digitsOnly(normalized.slice(match.value.length)),
  }
}

export function ClienteForm({ cliente }: ClienteFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [moradas, setMoradas] = useState<{ morada: string; descricao: string }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [tipo, setTipo] = useState<'casual_b2c' | 'profissional_b2b'>(
    cliente?.tipo ?? 'casual_b2c'
  )
  const [nif, setNif] = useState(digitsOnly(cliente?.nif ?? ''))
  const [phonePrefix, setPhonePrefix] = useState(splitPhoneNumber(cliente?.contacto_telefone).prefix)
  const [phoneNumber, setPhoneNumber] = useState(splitPhoneNumber(cliente?.contacto_telefone).number)
  const isEdit = !!cliente
  const phoneConfig = PHONE_PREFIXES.find((prefix) => prefix.value === phonePrefix) ?? PHONE_PREFIXES[0]

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const sanitizedNif = digitsOnly(nif)
    const sanitizedPhone = digitsOnly(phoneNumber)

    if (sanitizedNif && sanitizedNif.length !== 9) {
      setError('O NIF deve ter exatamente 9 números.')
      return
    }

    if (tipo === 'profissional_b2b' && !(formData.get('responsavel') as string)?.trim()) {
      setError('O responsável é obrigatório para cliente profissional.')
      return
    }

    if (
      sanitizedPhone &&
      (sanitizedPhone.length < phoneConfig.minDigits || sanitizedPhone.length > phoneConfig.maxDigits)
    ) {
      setError(
        phoneConfig.minDigits === phoneConfig.maxDigits
          ? `O número deve ter exatamente ${phoneConfig.maxDigits} dígitos para ${phoneConfig.label}.`
          : `O número deve ter entre ${phoneConfig.minDigits} e ${phoneConfig.maxDigits} dígitos para ${phoneConfig.label}.`
      )
      return
    }

    formData.set('nif', sanitizedNif)
    formData.set(
      'contacto_telefone',
      sanitizedPhone ? `${phonePrefix}${sanitizedPhone}` : ''
    )

    moradas.forEach((m, idx) => {
      formData.append(`morada_${idx}`, m.morada)
      formData.append(`morada_desc_${idx}`, m.descricao)
    })
    formData.append('moradas_count', moradas.length.toString())

    startTransition(async () => {
      const result = isEdit
        ? await atualizarCliente(cliente.id, formData)
        : await criarCliente(formData)

      if (!result.success || !result.id) {
        setError(result.error ?? 'Não foi possível guardar o cliente.')
        return
      }

      router.push(`/clientes/${result.id}`)
      router.refresh()
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
        <form onSubmit={handleSubmit} className="space-y-6">
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
              <input type="hidden" name="tipo" value={tipo} />
              <Select value={tipo} onValueChange={(value) => setTipo((value as typeof tipo) ?? 'casual_b2c')}>
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

            {tipo === 'profissional_b2b' ? (
              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  name="responsavel"
                  required
                  defaultValue={cliente?.responsavel ?? ''}
                  placeholder="Nome do responsável da empresa/obra"
                />
              </div>
            ) : (
              <input type="hidden" name="responsavel" value="" />
            )}

            <div className="space-y-2">
              <Label htmlFor="nif">NIF</Label>
              <Input
                id="nif"
                name="nif"
                value={nif}
                inputMode="numeric"
                maxLength={9}
                pattern="\d{9}"
                placeholder="123456789"
                onChange={(e) => setNif(digitsOnly(e.target.value).slice(0, 9))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contacto_telefone">Contacto (Telefone)</Label>
              <div className="flex gap-2">
                <div className="w-44 shrink-0">
                  <Select value={phonePrefix} onValueChange={(value) => setPhonePrefix(value ?? '+351')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PHONE_PREFIXES.map((prefix) => (
                        <SelectItem key={prefix.value} value={prefix.value}>
                          {prefix.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  id="contacto_telefone"
                  value={phoneNumber}
                  inputMode="numeric"
                  maxLength={phoneConfig.maxDigits}
                  placeholder="912345678"
                  onChange={(e) => setPhoneNumber(digitsOnly(e.target.value).slice(0, phoneConfig.maxDigits))}
                />
              </div>
              <p className="text-xs text-stone-500">
                {phoneConfig.minDigits === phoneConfig.maxDigits
                  ? `${phoneConfig.maxDigits} dígitos`
                  : `${phoneConfig.minDigits} a ${phoneConfig.maxDigits} dígitos`}
              </p>
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

          {!isEdit && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
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

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
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
