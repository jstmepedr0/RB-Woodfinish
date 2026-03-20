'use client'

import { useState, useTransition } from 'react'
import { Documento, PastaDocumento } from '@/lib/types/database'
import { PASTAS_DOCUMENTO } from '@/lib/constants'
import { uploadDocumento, eliminarDocumento } from '@/lib/actions/documentos'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Folder,
  Upload,
  FileText,
  Image,
  File,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'

interface PastasDigitaisProps {
  processoId: string
  documentos: Documento[]
  canUpload: boolean
  canDelete: boolean
}

function getFileIcon(tipo: string) {
  if (tipo.startsWith('image/')) return Image
  if (tipo.includes('pdf')) return FileText
  return File
}

function formatBytes(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function PastasDigitais({
  processoId,
  documentos,
  canUpload,
  canDelete,
}: PastasDigitaisProps) {
  const [openPasta, setOpenPasta] = useState<PastaDocumento | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleUpload(pasta: PastaDocumento, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    startTransition(() => {
      uploadDocumento(processoId, pasta, formData)
    })

    e.target.value = ''
  }

  function handleDelete(doc: Documento) {
    if (!confirm(`Eliminar "${doc.nome_ficheiro}"?`)) return
    startTransition(() => {
      eliminarDocumento(doc.id, processoId, doc.url_ficheiro)
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Pastas Digitais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {PASTAS_DOCUMENTO.map((pasta) => {
          const docs = documentos.filter((d) => d.pasta === pasta.value)
          const isOpen = openPasta === pasta.value

          return (
            <div key={pasta.value} className="border rounded-md">
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-stone-50 transition-colors"
                onClick={() => setOpenPasta(isOpen ? null : pasta.value)}
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-stone-400 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-stone-400 shrink-0" />
                )}
                <Folder className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="text-sm font-medium text-stone-800 text-left flex-1">
                  {pasta.label}
                </span>
                {docs.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {docs.length}
                  </Badge>
                )}
              </button>

              {isOpen && (
                <div className="px-3 pb-3 border-t bg-stone-50/50">
                  <p className="text-xs text-stone-500 mt-2 mb-3">{pasta.descricao}</p>

                  {docs.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      {docs.map((doc) => {
                        const Icon = getFileIcon(doc.tipo_ficheiro)
                        return (
                          <div
                            key={doc.id}
                            className="flex items-center gap-2 p-2 bg-white border rounded text-sm"
                          >
                            <Icon className="h-4 w-4 text-stone-400 shrink-0" />
                            <a
                              href={doc.url_ficheiro}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 truncate text-stone-700 hover:text-stone-900 hover:underline"
                            >
                              {doc.nome_ficheiro}
                            </a>
                            <span className="text-xs text-stone-400 shrink-0">
                              {formatBytes(doc.tamanho_bytes)}
                            </span>
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-stone-400 hover:text-destructive"
                                onClick={() => handleDelete(doc)}
                                disabled={isPending}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {canUpload && (
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 border border-dashed rounded cursor-pointer hover:bg-white transition-colors text-sm text-stone-600">
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      Carregar ficheiro
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleUpload(pasta.value, e)}
                        disabled={isPending}
                      />
                    </label>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
