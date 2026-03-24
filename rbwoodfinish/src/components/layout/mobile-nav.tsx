'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Profile } from '@/lib/types/database'
import { ROLES_LABEL } from '@/lib/constants'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface MobileNavProps {
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

export function MobileNav({ profile }: MobileNavProps) {
  const [open, setOpen] = useState(false)
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
    <>
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-white border-b border-stone-200">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="RB Woodfinish"
            width={32}
            height={0}
            className="shrink-0 h-auto"
          />
          <span className="text-base font-bold text-stone-900 tracking-tight">RB Woodfinish</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-md text-stone-600 hover:bg-stone-100"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          'md:hidden fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-stone-200 flex flex-col transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-5 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="RB Woodfinish"
              width={40}
              height={0}
              className="shrink-0 h-auto"
            />
            <div>
              <h2 className="text-base font-bold text-stone-900 tracking-tight">RB Woodfinish</h2>
              <p className="text-xs text-stone-500 mt-0.5">Gestão de Workflow</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-md text-stone-400 hover:bg-stone-100"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {filteredItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-stone-100 text-stone-900'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-stone-200">
          <div className="mb-3">
            <p className="text-sm font-medium text-stone-900 truncate">{profile.nome}</p>
            <p className="text-xs text-stone-500">{ROLES_LABEL[profile.role]}</p>
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
    </>
  )
}
