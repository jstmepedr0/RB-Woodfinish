'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/supabase/auth'
import { PastaDocumento } from '@/lib/types/database'

export async function uploadDocumento(
  processoId: string,
  pasta: PastaDocumento,
  formData: FormData
) {
  const profile = await requireUser()
  const supabase = await createClient()

  const file = formData.get('file') as File
  if (!file || file.size === 0) throw new Error('Nenhum ficheiro selecionado')

  const fileExt = file.name.split('.').pop()
  const fileName = `${processoId}/${pasta}/${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('documentos')
    .upload(fileName, file)

  if (uploadError) throw new Error(uploadError.message)

  const { data: urlData } = supabase.storage
    .from('documentos')
    .getPublicUrl(fileName)

  const { error: dbError } = await supabase.from('documentos').insert({
    processo_id: processoId,
    pasta,
    nome_ficheiro: file.name,
    tipo_ficheiro: file.type,
    url_ficheiro: urlData.publicUrl,
    tamanho_bytes: file.size,
    uploaded_por_id: profile.id,
  })

  if (dbError) throw new Error(dbError.message)

  // Registar ocorrência
  await supabase.from('ocorrencias').insert({
    processo_id: processoId,
    utilizador_id: profile.id,
    tipo: 'documento',
    conteudo: `Documento "${file.name}" adicionado à pasta "${pasta}"`,
  })

  revalidatePath(`/processos/${processoId}`)
}

export async function eliminarDocumento(
  documentoId: string,
  processoId: string,
  urlFicheiro: string
) {
  const profile = await requireUser()
  const supabase = await createClient()

  // Extrair path do storage a partir da URL
  const storagePath = urlFicheiro.split('/documentos/')[1]
  if (storagePath) {
    await supabase.storage.from('documentos').remove([storagePath])
  }

  const { error } = await supabase
    .from('documentos')
    .delete()
    .eq('id', documentoId)

  if (error) throw new Error(error.message)

  await supabase.from('ocorrencias').insert({
    processo_id: processoId,
    utilizador_id: profile.id,
    tipo: 'documento',
    conteudo: `Documento removido`,
  })

  revalidatePath(`/processos/${processoId}`)
}
