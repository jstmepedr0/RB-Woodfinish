import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RB Woodfinish — Gestão de Workflow',
  description: 'Sistema de gestão de workflow para carpintaria e mobiliário',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
