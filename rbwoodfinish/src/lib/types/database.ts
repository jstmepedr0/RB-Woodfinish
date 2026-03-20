export type UserRole = 'admin' | 'comercial' | 'armazem' | 'producao' | 'instalacao'

export type TipoCliente = 'casual_b2c' | 'profissional_b2b'

export type EstadoProcesso =
  | 'contacto'
  | 'visita'
  | '3d'
  | 'orcamento'
  | 'adjudicacao'
  | 'retificacao'
  | 'producao'
  | 'expedicao'
  | 'instalacao'
  | 'concluido'
  | 'assistencia'

export type PastaDocumento =
  | 'plantas'
  | 'proj3d'
  | 'orc_fornecedor'
  | 'orc_cliente'
  | 'orc_extras'
  | 'retificacao'
  | 'encomenda'
  | 'fatura'
  | 'producao'
  | 'enc_fornecedores'
  | 'fotos'

export type TipoOcorrencia = 'nota' | 'foto' | 'estado_mudou' | 'documento' | 'mensagem'

export interface Profile {
  id: string
  nome: string
  email: string
  role: UserRole
  ativo: boolean
  created_at: string
}

export interface Cliente {
  id: string
  tipo: TipoCliente
  nome: string
  nif: string | null
  contacto_telefone: string | null
  email: string | null
  morada_sede: string | null
  notas: string | null
  comercial_responsavel_id: string | null
  comercial_responsavel?: Profile
  created_at: string
  updated_at: string
}

export interface MoradaObra {
  id: string
  cliente_id: string
  morada: string
  descricao: string | null
  gps_coords: string | null
  created_at: string
}

export interface Processo {
  id: string
  cliente_id: string
  cliente?: Cliente
  morada_obra_id: string | null
  morada_obra?: MoradaObra
  estado_global: EstadoProcesso
  comercial_id: string | null
  comercial?: Profile
  notas: string | null
  data_adjudicacao: string | null
  data_conclusao: string | null
  created_at: string
  updated_at: string
}

export interface Documento {
  id: string
  processo_id: string
  pasta: PastaDocumento
  nome_ficheiro: string
  tipo_ficheiro: string
  url_ficheiro: string
  tamanho_bytes: number | null
  uploaded_por_id: string
  uploaded_por?: Profile
  created_at: string
}

export interface Ocorrencia {
  id: string
  processo_id: string
  utilizador_id: string
  utilizador?: Profile
  tipo: TipoOcorrencia
  conteudo: string
  created_at: string
}
