import { EstadoProcesso, PastaDocumento, UserRole } from '@/lib/types/database'

export const ESTADOS_PROCESSO: { value: EstadoProcesso; label: string; ordem: number }[] = [
  { value: 'contacto', label: 'Contacto Inicial', ordem: 1 },
  { value: 'visita', label: 'Visita', ordem: 2 },
  { value: '3d', label: 'Projeto 3D', ordem: 3 },
  { value: 'orcamento', label: 'Orçamento', ordem: 4 },
  { value: 'adjudicacao', label: 'Adjudicação', ordem: 5 },
  { value: 'retificacao', label: 'Retificação Medidas', ordem: 6 },
  { value: 'producao', label: 'Produção', ordem: 7 },
  { value: 'expedicao', label: 'Expedição', ordem: 8 },
  { value: 'instalacao', label: 'Instalação', ordem: 9 },
  { value: 'concluido', label: 'Concluído', ordem: 10 },
  { value: 'assistencia', label: 'Assistência', ordem: 11 },
]

export const PASTAS_DOCUMENTO: { value: PastaDocumento; label: string; descricao: string }[] = [
  { value: 'plantas', label: 'Plantas e Manuscritos', descricao: 'Fotos da ficha de visita, plantas, desenhos à mão' },
  { value: 'proj3d', label: 'Projeto 3D', descricao: 'Renders, revisões e aprovação final do cliente' },
  { value: 'orc_fornecedor', label: 'Orçamentos Fornecedores', descricao: 'Cotações recebidas dos fornecedores' },
  { value: 'orc_cliente', label: 'Orçamento Cliente', descricao: 'Orçamento gerado para o cliente' },
  { value: 'orc_extras', label: 'Extras & Adendas', descricao: 'Orçamentos adicionais para itens extra' },
  { value: 'retificacao', label: 'Retificação de Medidas', descricao: 'Validação de medidas com confirmação' },
  { value: 'encomenda', label: 'Encomenda de Cliente', descricao: 'Encomenda formal, sinal pago, contrato' },
  { value: 'fatura', label: 'Fatura e Comprovativo', descricao: 'Faturas e comprovativos de pagamento' },
  { value: 'producao', label: 'Processo de Produção', descricao: 'Documentos relacionados com a produção' },
  { value: 'enc_fornecedores', label: 'Encomendas a Fornecedores', descricao: 'Lista de necessidades e encomendas' },
  { value: 'fotos', label: 'Fotos', descricao: 'Fotos do espaço, inspirações, antes/depois' },
]

export const ROLES_LABEL: Record<UserRole, string> = {
  admin: 'Administrador',
  comercial: 'Comercial',
  armazem: 'Armazém',
  producao: 'Produção',
  instalacao: 'Instalação',
}

export const TIPO_CLIENTE_LABEL: Record<string, string> = {
  casual_b2c: 'Casual (B2C)',
  profissional_b2b: 'Profissional (B2B)',
}

export const ESTADO_CORES: Record<EstadoProcesso, string> = {
  contacto: 'bg-slate-100 text-slate-700 border-slate-300',
  visita: 'bg-blue-50 text-blue-700 border-blue-300',
  '3d': 'bg-purple-50 text-purple-700 border-purple-300',
  orcamento: 'bg-amber-50 text-amber-700 border-amber-300',
  adjudicacao: 'bg-orange-50 text-orange-700 border-orange-300',
  retificacao: 'bg-cyan-50 text-cyan-700 border-cyan-300',
  producao: 'bg-indigo-50 text-indigo-700 border-indigo-300',
  expedicao: 'bg-teal-50 text-teal-700 border-teal-300',
  instalacao: 'bg-lime-50 text-lime-700 border-lime-300',
  concluido: 'bg-green-50 text-green-700 border-green-300',
  assistencia: 'bg-rose-50 text-rose-700 border-rose-300',
}
