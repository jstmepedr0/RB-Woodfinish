'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Profile } from '@/lib/types/database'
import { ROLES_LABEL } from '@/lib/constants'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface SidebarProps {
  profile: Profile
}

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    roles: ['admin'],
  },
  {
    label: 'Clientes',
    href: '/clientes',
    icon: Users,
    roles: ['admin', 'comercial'],
  },
  {
    label: 'Processos',
    href: '/processos',
    icon: FolderKanban,
    roles: ['admin', 'comercial', 'armazem', 'producao', 'instalacao'],
  },
]

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()

  const filteredItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(profile.role)
  )

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside className="w-60 border-r border-stone-200 bg-white flex flex-col h-full">
      <div className="p-5">
        <h2 className="text-lg font-bold text-stone-900 tracking-tight">
          RB Woodfinish
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">Gestão de Workflow</p>
      </div>

      <Separator />

      <nav className="flex-1 p-3 space-y-1">
        {filteredItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-stone-100 text-stone-900'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-stone-200">
        <div className="mb-3">
          <p className="text-sm font-medium text-stone-900 truncate">
            {profile.nome}
          </p>
          <p className="text-xs text-stone-500">
            {ROLES_LABEL[profile.role]}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-stone-500 hover:text-stone-900"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </aside>
  )
}
