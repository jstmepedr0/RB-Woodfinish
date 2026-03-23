'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

function formatLoginError(message: string) {
  const lower = message.toLowerCase()

  if (lower.includes('email not confirmed')) {
    return 'O email ainda não está confirmado no Supabase Auth.'
  }
  if (lower.includes('invalid login credentials')) {
    return 'Email ou palavra-passe incorretos.'
  }
  if (lower.includes('invalid api key')) {
    return 'A configuração do Supabase na Vercel parece inválida.'
  }
  if (lower.includes('fetch')) {
    return 'Falha de ligação ao Supabase. Verifica as variáveis de ambiente e a ligação da app.'
  }

  return message
}

interface LoginFormProps {
  initialError?: string | null
}

export function LoginForm({ initialError = null }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(initialError)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError(formatLoginError(error.message))
        setLoading(false)
        return
      }

      window.location.href = '/'
    } catch (err) {
      setError(
        err instanceof Error
          ? formatLoginError(err.message)
          : 'Erro inesperado ao iniciar sessão.'
      )
      setLoading(false)
    }
  }

  return (
    <Card className="border-stone-200 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-center text-stone-800">
          Iniciar Sessão
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@rbwoodfinish.pt"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Palavra-passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
