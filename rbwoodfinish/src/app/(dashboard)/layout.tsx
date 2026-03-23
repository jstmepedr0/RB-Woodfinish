import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/auth'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { Toaster } from '@/components/ui/sonner'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getUser()

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">
      <div className="hidden md:flex">
        <Sidebar profile={profile} />
      </div>
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <MobileNav profile={profile} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}
