import Image from 'next/image'
import { LoginForm } from '@/components/auth/login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const initialError =
    error === 'auth' ? 'Falha ao concluir a autenticação.' : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="RB Woodfinish"
              width={80}
              height={0}
              priority
              className="h-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
            RB Woodfinish
          </h1>
          <p className="text-stone-500 mt-2 text-sm">
            Sistema de Gestão de Workflow
          </p>
        </div>
        <LoginForm initialError={initialError} />
      </div>
    </div>
  )
}
