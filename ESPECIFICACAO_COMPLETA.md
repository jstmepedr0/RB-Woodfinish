# RBWOODFINISH — Especificação Funcional Completa

> **Versão:** 1.0  
> **Data:** Março 2026  
> **Autor:** Engenheiro Informático (Freelancer)  
> **Cliente:** RB Woodfinish, Lda. — Algarve, Portugal

---

## ÍNDICE

1. [Visão Geral](#1-visão-geral)
2. [Perfis de Utilizador (Roles)](#2-perfis-de-utilizador-roles)
3. [Tipos de Cliente](#3-tipos-de-cliente)
4. [Módulos Funcionais](#4-módulos-funcionais)
5. [Workflow Digital Completo](#5-workflow-digital-completo)
6. [Modelo de Dados (Entidades)](#6-modelo-de-dados-entidades)
7. [Integrações Externas](#7-integrações-externas)
8. [Requisitos de UX/UI](#8-requisitos-de-uxui)
9. [Fases de Entrega](#9-fases-de-entrega)

---

## 1. VISÃO GERAL

**O que é:** Sistema de Gestão de Workflow (ERP/CRM customizado) para uma empresa de carpintaria/mobiliário.

**Objetivo:** Controlo total do ciclo de vida de uma encomenda — desde o primeiro contacto na loja até ao relatório final de montagem, passando pela produção na fábrica e logística de entrega.

**Ambientes operacionais:**
- **Loja** — Atendimento, venda e acompanhamento do cliente
- **Fábrica** — Produção e controlo de tempos
- **Armazém** — Compras, receção de materiais e controlo de stock
- **Rua** — Instalação, montagem e assistência pós-venda

**Plataformas-alvo:**
- Web App responsiva (desktop para Admin/Comercial)
- PWA ou App nativa simplificada (tablet para Fábrica, mobile para Instalação)

---

## 2. PERFIS DE UTILIZADOR (ROLES)

### 2.1 ADMINISTRADOR (Dono / Gestor)

| Área | Permissão |
|------|-----------|
| Utilizadores | Criar, editar, desativar contas e atribuir roles |
| Produção | Alterar prioridades e ordem na timeline de produção |
| Financeiro | Ver margens (Custo Fornecedor vs. Preço Cliente), validar orçamentos |
| Prazos | Editar prazos globais e datas-limite |
| Dashboards | Acesso ao painel geral: cronómetros ativos, atrasos, % de conclusão |
| Configurações | Gerir categorias de produtos, templates de orçamento, integrações |
| Dados | Pode exportar/apagar dados. Único com acesso a backup |

### 2.2 COMERCIAL (Staff da Loja)

| Área | Permissão |
|------|-----------|
| Clientes | Criar e editar fichas de cliente |
| Ficha de Visita | Preencher formulário digital (baseado no formulário em papel existente) |
| Fotos/Inspirações | Upload de fotos do espaço e imagens de inspiração |
| Projetos 3D | Submeter revisões 3D e gerir aprovação com o cliente |
| Orçamentos | Criar e enviar orçamentos ao cliente; consultar orçamentos de fornecedores |
| Estado de Produção | **Visualizar** barra de progresso e fase atual (só leitura) |
| Comunicação | Gerir workflow WhatsApp e notificações ao cliente |
| Stock | Consultar disponibilidade de materiais (só leitura) |
| **Restrições** | Não altera datas na timeline de produção; não apaga faturas; não altera custos de fornecedores já registados; não cria utilizadores |

### 2.3 RESPONSÁVEL DE ARMAZÉM / COMPRAS

| Área | Permissão |
|------|-----------|
| Encomendas a Fornecedores | Receber lista de necessidades, criar e enviar encomendas |
| Receção de Material | Fazer check-in item a item (marcar "Encomendado" → "Recebido") |
| QR Code | Ler/gerar etiquetas QR para rastreio de peças e caixas |
| Stock | Gerir entradas e saídas de stock |
| Dashboard de Prontidão | Atualizar % de material recebido por projeto |
| **Restrições** | Não altera orçamentos; não acede a dados financeiros do cliente; não altera timeline de produção |

### 2.4 PRODUÇÃO (Fábrica)

| Área | Permissão |
|------|-----------|
| Timeline | Ver a fila de trabalho ordenada por prioridade (definida pelo Admin) |
| Ficha Técnica | Aceder a 3D aprovado, medidas retificadas e desenhos técnicos |
| Cronómetro | Start/Stop por peça/armário para registo de tempo de execução |
| Estado | Marcar etapas como concluídas (ex: "Corte feito", "Acabamento feito") |
| QR Code | Gerar etiqueta QR para cada peça produzida |
| **Restrições** | Não altera prioridade da fila; não acede a preços ou dados financeiros |

### 2.5 INSTALAÇÃO / ASSISTÊNCIA (Equipa de Rua)

| Área | Permissão |
|------|-----------|
| Agenda | Ver calendário de montagens e assistências atribuídas |
| Checklist | Preencher checklist de montagem no local |
| Fotos | Upload obrigatório: "Antes" e "Depois" da instalação |
| Relatório Final | Preencher formulário de conclusão com assinatura digital do cliente |
| Assistência Pós-Venda | Registar pedidos de assistência com fotos e notas |
| **Restrições** | Não acede a dados financeiros; não altera produção; não edita fichas de cliente |

---

## 3. TIPOS DE CLIENTE

### 3.1 CLIENTE CASUAL (B2C — Pessoa Singular)

| Campo | Detalhe |
|-------|---------|
| Natureza | Particular — quer mobiliário para casa própria |
| Identificação | Nome, NIF pessoal, morada única |
| Comportamento | Projeto único, foco em estética e acompanhamento próximo |
| Comunicação | WhatsApp pessoal, email |
| Faturação | Fatura simples, pagamento faseado (sinal + final) |
| Ficha | 1 morada de obra = 1 processo |

### 3.2 CLIENTE PROFISSIONAL / CONSTRUTOR (B2B — Empresa)

| Campo | Detalhe |
|-------|---------|
| Natureza | Empresa ou construtor com múltiplos projetos |
| Identificação | Razão social, NIF empresarial, múltiplas moradas de obra |
| Comportamento | Vários projetos em simultâneo, tabela de preços diferenciada |
| Comunicação | Contacto do responsável de obra + contacto administrativo |
| Faturação | Faturação por obra, condições de pagamento negociadas (30/60/90 dias) |
| Ficha | 1 empresa → N moradas de obra → N processos independentes |

### 3.3 CAMPOS DA FICHA DE CLIENTE (baseado no formulário em papel)

```
- Data
- Cliente / Responsável
- Contacto (telefone)
- Email
- Tipo: Empresa ☐ | Pessoa Singular ☐
- Subtipo: Casual ☐ | Profissional/Construtor ☐
- NIF
- Morada (sede ou residência)
- Morada de Obra (pode ser diferente; múltiplas para B2B)
- Nota (campo livre)
- Notas de Obra + Descrição (tabela multi-linha)
```

---

## 4. MÓDULOS FUNCIONAIS

### MÓDULO A — Gestão de Clientes & Processos

Digitalização das 10 pastas físicas usadas atualmente:

| # | Pasta Física | Módulo Digital | Descrição |
|---|-------------|----------------|-----------|
| 1 | PLANTAS E MANUSCRITOS | Upload de Documentos | Fotos da ficha de visita, plantas, desenhos à mão |
| 2 | PROJ 3D | Gestor de Projetos 3D | Upload de renders, sistema de revisões e aprovação final do cliente |
| 3 | ORÇAMENTOS DE FORNECEDORES | Orçamentos (Compras) | Registo de cotações recebidas dos fornecedores, comparativo |
| 4 | ORÇAMENTO DE CLIENTE | Orçamentos (Venda) | Orçamento gerado para o cliente com itemização detalhada |
| 4+ | ORÇAMENTO DE CLIENTE - EXTRAS | Extras & Adendas | Orçamentos adicionais para itens fora do âmbito original |
| 5 | RETIFICAÇÃO DE MEDIDAS | Validação de Medidas | Campo obrigatório com checkbox de confirmação; gate para produção |
| 6 | ENCOMENDA DE CLIENTE | Adjudicação | Registo da encomenda formal, sinal pago, contrato |
| 7 | FATURA E COMP PAG | Faturação & Pagamentos | Integração com software de faturação; registo de comprovativos |
| 8 | PROCESSO DE PRODUÇÃO | Timeline de Produção | Kanban com estados de fabrico por peça |
| 9 | ENCOMENDAS A FORNECEDORES | Gestão de Compras | Lista de necessidades, encomendas, check-in de receção |
| 10 | FOTOS | Galeria do Projeto | Fotos do espaço, inspirações, "antes/depois", fotos de obra |

**Funcionalidades transversais do processo:**
- **Timeline / Feed de Ocorrências:** Todas as ações sobre o processo ficam num histórico cronológico imutável (quem fez, quando, o quê)
- **Estado Global do Processo:** Indicador visual com as fases: `Contacto Inicial → Visita → 3D → Orçamento → Adjudicação → Retificação Medidas → Produção → Expedição → Instalação → Concluído → Assistência`
- **Documentos Anexos:** Cada pasta aceita múltiplos ficheiros (PDF, imagem, DWG, etc.)

---

### MÓDULO B — Orçamentação

#### B.1 Orçamento de Fornecedor (Custo)
- Associado a um processo/cliente
- Campos: Fornecedor, data, itens (descrição, quantidade, preço unitário, total)
- Upload de PDF do orçamento original
- Estado: Pendente → Aprovado pelo Admin → Encomendado

#### B.2 Orçamento de Cliente (Venda)
- Gerado pelo Comercial com base nos custos + margem
- Campos: Itens (descrição, quantidade, preço unitário, total), condições de pagamento, validade
- Exportável para PDF com branding RB Woodfinish
- Estado: Rascunho → Enviado → Aprovado pelo Cliente → Adjudicado
- **Extras/Adendas:** Novo orçamento ligado ao mesmo processo para trabalhos adicionais

#### B.3 Comparativo de Margem (só Admin)
- Vista lado a lado: Custo total de fornecedores vs. Preço total ao cliente
- Cálculo automático de margem bruta (valor e %)

---

### MÓDULO C — Gestão de Compras & Prontidão do Projeto ("Project Readiness")

Este é o **módulo central logístico**:

#### C.1 Geração Automática de Necessidades
Quando uma encomenda é adjudicada e as medidas retificadas:
- O sistema gera uma **Lista de Necessidades** dividida em:
  - **Itens a Produzir Internamente** → vão para o Módulo D (Fábrica)
  - **Itens a Encomendar a Fornecedores** → vão para o Armazém

#### C.2 Fluxo de Encomenda a Fornecedores (Responsável de Armazém)
```
1. Recebe lista de itens a encomendar (notificação automática)
2. Cria encomenda ao fornecedor (agrupa itens se necessário)
3. Regista data de encomenda e prazo previsto de entrega
4. Confirma receção item a item:
   - Marca como "Recebido" ✅
   - Marca como "Parcial" ⚠️ (chegou parte)
   - Marca como "Danificado/Devolvido" ❌
5. Associa QR Code à peça/caixa recebida
```

#### C.3 Dashboard de Prontidão (% Readiness)
```
Prontidão do Projeto = 
  (Itens Fornecedor Recebidos + Peças Fábrica Concluídas) 
  ÷ Total de Itens Necessários 
  × 100%

Regra: O projeto SÓ pode ser agendado para instalação quando atinge 100%.
```

**Visualização:**
- Barra de progresso por projeto
- Código de cores: 🔴 <50% | 🟡 50-99% | 🟢 100%
- Lista detalhada item a item com estado individual
- Filtros: "Só o que falta", "Só fornecedor X", "Atrasados"

---

### MÓDULO D — Produção (Fábrica)

#### D.1 Timeline / Kanban de Produção
- Colunas: `Em Fila → Em Produção → Acabamento → Controlo de Qualidade → Pronto`
- Cada cartão = 1 peça ou conjunto (ex: "Armário Superior Cozinha — Cliente Silva")
- **Prioridade definida exclusivamente pelo Admin** (drag & drop)
- Informação visível no cartão:
  - Nome do cliente
  - Tipo de peça
  - Prazo previsto
  - Tempo acumulado no cronómetro

#### D.2 Ficha Técnica da Peça
- Link direto para: 3D aprovado, medidas retificadas, notas do comercial
- Materiais necessários e respetivo QR Code de stock

#### D.3 Cronómetro de Execução
- Botão **Start / Pause / Stop** por peça
- Registo de quem trabalhou e durante quanto tempo
- Dados alimentam futuro cálculo de rentabilidade (tempo real vs. estimado)
- Histórico de sessões: data, operário, duração

#### D.4 Notificação ao Armazém
- Quando uma peça é marcada como "Pronta", o sistema atualiza automaticamente o Dashboard de Prontidão

---

### MÓDULO E — Logística & Instalação

#### E.1 Expedição
- Quando o projeto atinge 100% de prontidão:
  - O sistema permite agendar a instalação
  - Gera **Guia de Transporte** automática com lista de itens (via QR Code scan no armazém)
- Associação: Condutor + Carrinha + Rota do dia

#### E.2 Agenda de Instalação
- Calendário com vista diária/semanal
- Sincronização com Google Calendar (cada equipa tem a sua cor)
- Campos por evento: Cliente, morada, contacto, lista de peças, notas

#### E.3 Relatório Final de Obra (Obrigatório)
```
Campos obrigatórios:
- Fotos "Estado Inicial" (antes da montagem)
- Fotos "Estado Final" (depois da montagem)
- Checklist de verificação (tudo montado, limpo, funcional)
- Notas / Pendências (se algo ficou por fazer)
- Assinatura digital do cliente (dedo no ecrã)
- Data e hora de conclusão
```

#### E.4 Assistência Pós-Venda
- Registo de pedidos de assistência associados ao processo original
- Campos: Descrição do problema, fotos, urgência, data de resolução
- Histórico visível na ficha do cliente

---

### MÓDULO F — Comunicação & Notificações

#### F.1 Notificações Internas (In-App)
- Cada role recebe notificações relevantes:
  - **Comercial:** "Cliente X aprovou o 3D", "Obra Y concluída"
  - **Armazém:** "Nova lista de compras para o projeto Z"
  - **Produção:** "Novo item na fila", "Prioridade alterada pelo Admin"
  - **Instalação:** "Nova montagem agendada para amanhã"
  - **Admin:** "Orçamento pendente de validação", "Atraso de fornecedor"

#### F.2 Notificações WhatsApp ao Cliente (Automáticas)
Mensagens pré-definidas enviadas em momentos-chave:
```
1. "Recebemos o seu pedido e vamos contactá-lo em breve."
2. "O seu projeto 3D está pronto para revisão."
3. "O seu orçamento está disponível."
4. "A sua encomenda entrou hoje em produção."
5. "A sua encomenda está pronta. Vamos agendar a instalação."
6. "A instalação está agendada para [DATA]."
7. "A sua obra foi concluída. Obrigado pela confiança!"
```

#### F.3 Workflow de Estado do Cliente (Funil Comercial)
```
Fases no funil:
Contacto → Visita Agendada → Visita Realizada → 3D em Curso → 3D Aprovado 
→ Orçamento Enviado → Orçamento Aprovado → Adjudicação (Sinal Pago) 
→ Em Produção → Pronto para Instalação → Instalado → Concluído
```

---

### MÓDULO G — Dashboards & Relatórios (Admin)

#### G.1 Dashboard Geral
- Nº de projetos ativos por fase
- Projetos com atrasos (semáforo)
- Cronómetros ativos na fábrica (quem está a trabalhar em quê)
- Atrasos de fornecedores (encomendas fora do prazo)
- Receita prevista vs. recebida (faturação)

#### G.2 Relatórios
- Tempo médio de produção por tipo de peça
- Rentabilidade por projeto (custo real vs. preço cobrado)
- Volume de vendas por período
- Taxa de conversão do funil comercial
- Ranking de fornecedores (prazo de entrega, qualidade)

---

## 5. WORKFLOW DIGITAL COMPLETO

```
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 1: LOJA (Comercial)                     │
├─────────────────────────────────────────────────────────────────┤
│ 1. Cliente entra na loja / contacta                             │
│ 2. Comercial cria Ficha de Cliente (Casual ou Profissional)     │
│ 3. Comercial preenche Ficha de Visita digital                   │
│ 4. Upload de fotos do espaço e inspirações                      │
│ 5. Equipa técnica desenvolve Projeto 3D                         │
│ 6. Comercial gere revisões 3D com o cliente até aprovação       │
│ 7. Comercial cria Orçamento ao Cliente (com base nos custos)    │
│ 8. Admin valida margens                                         │
│ 9. Comercial envia Orçamento                                    │
│ 10. Cliente aprova → Adjudicação (sinal pago)                   │
│ 11. Retificação de Medidas (gate obrigatório ✅)                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│            FASE 2: DIVISÃO DE NECESSIDADES                      │
├─────────────────────────────────────────────────────────────────┤
│ Sistema gera automaticamente:                                   │
│   → Lista de Itens a Produzir (→ Fábrica)                       │
│   → Lista de Itens a Encomendar (→ Armazém)                     │
└───────────┬─────────────────────────────────┬───────────────────┘
            │                                 │
            ▼                                 ▼
┌───────────────────────┐       ┌──────────────────────────────┐
│  FASE 3A: FÁBRICA     │       │  FASE 3B: ARMAZÉM            │
├───────────────────────┤       ├──────────────────────────────┤
│ Produção com timeline │       │ Encomenda a fornecedores     │
│ Kanban + cronómetro   │       │ Check-in item a item         │
│ QR Code por peça      │       │ QR Code por peça/caixa       │
│ Marca como "Pronto"   │       │ Marca como "Recebido"        │
└───────────┬───────────┘       └──────────────┬───────────────┘
            │                                  │
            └──────────┬───────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              DASHBOARD DE PRONTIDÃO (% Readiness)               │
├─────────────────────────────────────────────────────────────────┤
│ Itens Fábrica Prontos + Itens Fornecedor Recebidos              │
│ ÷ Total de Itens Necessários = XX%                              │
│                                                                 │
│ 100% → Desbloqueia agendamento de instalação                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│               FASE 4: LOGÍSTICA & INSTALAÇÃO                    │
├─────────────────────────────────────────────────────────────────┤
│ 1. Gerar Guia de Transporte (QR scan no armazém)                │
│ 2. Associar Condutor + Carrinha + Rota                          │
│ 3. Equipa de instalação: fotos Antes/Depois                     │
│ 4. Preencher Relatório Final + Assinatura cliente               │
│ 5. Notificação ao Comercial: "Obra concluída"                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FASE 5: PÓS-VENDA                              │
├─────────────────────────────────────────────────────────────────┤
│ - Relatório de satisfação enviado ao cliente                    │
│ - Registo de assistências futuras                               │
│ - Arquivo digital completo do processo                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. MODELO DE DADOS (ENTIDADES PRINCIPAIS)

```
UTILIZADOR
├── id
├── nome
├── email
├── password (hash)
├── role: [admin, comercial, armazem, producao, instalacao]
├── ativo: boolean
└── data_criacao

CLIENTE
├── id
├── tipo: [casual_b2c, profissional_b2b]
├── nome / razão_social
├── nif
├── contacto_telefone
├── email
├── morada_sede
├── data_criacao
├── comercial_responsavel → UTILIZADOR
└── notas

MORADA_OBRA
├── id
├── cliente_id → CLIENTE
├── morada
├── descricao
└── gps_coords (opcional)

PROCESSO (= Projeto / Obra)
├── id
├── cliente_id → CLIENTE
├── morada_obra_id → MORADA_OBRA
├── estado_global: [contacto, visita, 3d, orcamento, adjudicacao, 
│                    retificacao, producao, expedicao, instalacao, 
│                    concluido, assistencia]
├── data_criacao
├── data_adjudicacao
├── data_conclusao
├── comercial_id → UTILIZADOR
└── notas

DOCUMENTO
├── id
├── processo_id → PROCESSO
├── pasta: [plantas, proj3d, orc_fornecedor, orc_cliente, 
│           orc_extras, retificacao, encomenda, fatura, 
│           producao, enc_fornecedores, fotos]
├── tipo_ficheiro
├── url_ficheiro
├── uploaded_por → UTILIZADOR
└── data_upload

ORCAMENTO_FORNECEDOR
├── id
├── processo_id → PROCESSO
├── fornecedor_id → FORNECEDOR
├── estado: [pendente, aprovado, encomendado]
├── total
├── pdf_url
└── data

ORCAMENTO_CLIENTE
├── id
├── processo_id → PROCESSO
├── tipo: [principal, extra]
├── estado: [rascunho, enviado, aprovado, adjudicado]
├── total
├── condicoes_pagamento
├── validade
└── data

ITEM_ORCAMENTO
├── id
├── orcamento_id → ORCAMENTO_CLIENTE ou ORCAMENTO_FORNECEDOR
├── descricao
├── quantidade
├── preco_unitario
└── total

NECESSIDADE (gerada automaticamente na adjudicação)
├── id
├── processo_id → PROCESSO
├── descricao
├── tipo: [producao_interna, compra_fornecedor]
├── estado: [pendente, em_curso, concluido]
├── quantidade
└── data_necessaria

ENCOMENDA_FORNECEDOR
├── id
├── fornecedor_id → FORNECEDOR
├── data_encomenda
├── prazo_previsto
├── estado: [enviada, parcial, recebida]
└── notas

ITEM_ENCOMENDA_FORNECEDOR
├── id
├── encomenda_id → ENCOMENDA_FORNECEDOR
├── necessidade_id → NECESSIDADE
├── descricao
├── quantidade
├── estado: [encomendado, recebido, parcial, danificado]
├── qr_code
└── data_rececao

FORNECEDOR
├── id
├── nome
├── contacto
├── email
├── morada
├── prazo_medio_entrega
└── notas

PRODUCAO_ITEM
├── id
├── necessidade_id → NECESSIDADE
├── processo_id → PROCESSO
├── descricao
├── estado: [em_fila, em_producao, acabamento, qualidade, pronto]
├── prioridade (definida pelo Admin)
├── qr_code
├── tempo_estimado_min
└── tempo_real_min

CRONOMETRO_SESSAO
├── id
├── producao_item_id → PRODUCAO_ITEM
├── operario_id → UTILIZADOR
├── inicio
├── fim
└── duracao_min

INSTALACAO
├── id
├── processo_id → PROCESSO
├── data_agendada
├── equipa: [UTILIZADOR]
├── condutor_id → UTILIZADOR
├── carrinha
├── estado: [agendada, em_curso, concluida]
├── foto_antes_urls: []
├── foto_depois_urls: []
├── checklist: JSON
├── notas_pendencias
├── assinatura_cliente_url
└── data_conclusao

ASSISTENCIA
├── id
├── processo_id → PROCESSO
├── descricao_problema
├── fotos: []
├── urgencia: [baixa, media, alta]
├── estado: [aberta, agendada, resolvida]
├── data_abertura
└── data_resolucao

OCORRENCIA (Feed / Histórico Imutável)
├── id
├── processo_id → PROCESSO
├── utilizador_id → UTILIZADOR
├── tipo: [nota, foto, estado_mudou, documento, mensagem]
├── conteudo
├── data
└── editavel: false (imutável)

GUIA_TRANSPORTE
├── id
├── instalacao_id → INSTALACAO
├── itens: [QR Codes escaneados]
├── condutor
├── data_emissao
└── pdf_url
```

---

## 7. INTEGRAÇÕES EXTERNAS

| Integração | Finalidade | Prioridade |
|------------|-----------|------------|
| **Google Calendar** | Sincronização bidirecional da agenda de instalações e visitas | Alta |
| **WhatsApp Business API** | Envio automático de mensagens de estado ao cliente | Média |
| **Software de Faturação** (ex: PHC, Jasmin, Moloni, InvoiceXpress) | Leitura/escrita de faturas e artigos via API | Média |
| **QR Code Generator** | Geração e leitura de códigos para rastreio de peças e stock | Alta |
| **Cloud Storage** (ex: AWS S3, Cloudinary) | Armazenamento de fotos, PDFs, renders 3D | Alta |
| **Email / SMTP** | Envio de orçamentos e notificações por email | Baixa |

---

## 8. REQUISITOS DE UX/UI

### Princípios Gerais
- **Simplicidade primeiro:** Interface limpa, botões grandes para uso em tablet com luvas/pó (fábrica)
- **Independência de equipas:** Loja, fábrica e instalação não precisam de comunicar verbalmente — a app é o canal
- **Feedback visual:** Barras de progresso, semáforos, badges de notificação

### Por Perfil

| Perfil | Dispositivo Principal | Requisitos UX |
|--------|----------------------|---------------|
| Admin | Desktop (ecrã grande) | Dashboards densos, tabelas com filtros, gráficos |
| Comercial | Desktop + Tablet | Formulários rápidos, preview de 3D, botão WhatsApp |
| Armazém | Tablet + Scanner QR | Lista de check-in com botões grandes, scan QR integrado |
| Produção | Tablet (montado na bancada) | Cartões Kanban grandes, cronómetro bem visível, mínimo de texto |
| Instalação | Mobile (smartphone) | Câmara integrada, formulários simples, assinatura com dedo |

---

## 9. FASES DE ENTREGA

### FASE 1 — Fundação (MVP Essencial)
**Duração estimada:** 6–8 semanas  
**Objetivo:** Ter o sistema básico a funcionar para substituir as pastas físicas.

| Componente | Descrição |
|-----------|-----------|
| Autenticação | Login, roles, proteção de rotas |
| CRUD Clientes | Ficha de cliente (Casual/Profissional) com todos os campos |
| CRUD Processos | Criação de processo associado a cliente + morada de obra |
| Sistema de Pastas Digitais | Upload e organização de documentos nas 10 pastas |
| Estado Global do Processo | Indicador visual com transição entre fases |
| Feed de Ocorrências | Timeline imutável de ações por processo |
| Dashboard básico Admin | Lista de processos ativos por fase |

**Entregável:** Sistema web funcional onde o Comercial pode criar clientes, abrir processos e carregar documentos. Admin vê tudo.

---

### FASE 2 — Orçamentação & Finanças
**Duração estimada:** 4–5 semanas  
**Objetivo:** Digitalizar o processo de orçamentação e controlo de margens.

| Componente | Descrição |
|-----------|-----------|
| Orçamentos de Fornecedor | CRUD completo com upload de PDF |
| Orçamentos de Cliente | Criação, itemização, exportação PDF com branding |
| Extras & Adendas | Orçamentos adicionais ligados ao mesmo processo |
| Comparativo de Margem (Admin) | Vista custo vs. preço com cálculo de margem |
| Gestão de Fornecedores | CRUD de fornecedores com contactos |
| Fluxo de Adjudicação | Registo de sinal pago, passagem de estado |

**Entregável:** Comercial consegue gerar e enviar orçamentos. Admin valida margens.

---

### FASE 3 — Produção & Armazém
**Duração estimada:** 6–8 semanas  
**Objetivo:** Controlo de fábrica e logística de compras.

| Componente | Descrição |
|-----------|-----------|
| Geração de Necessidades | Lista automática de itens a produzir e a comprar |
| Encomendas a Fornecedores | CRUD + workflow (encomendado → recebido) |
| Check-in de Material | Receção item a item com QR Code |
| Timeline Kanban (Fábrica) | Visualização por prioridade com drag & drop (Admin) |
| Cronómetro de Execução | Start/Stop por peça com registo de sessões |
| Dashboard de Prontidão | % de conclusão por projeto com regra dos 100% |
| QR Code (Geração + Leitura) | Etiquetas para peças e caixas |

**Entregável:** Fábrica e armazém operam dentro da app. O sistema bloqueia instalação até 100% de prontidão.

---

### FASE 4 — Instalação & Pós-Venda
**Duração estimada:** 3–4 semanas  
**Objetivo:** Fechar o ciclo com montagem e assistência.

| Componente | Descrição |
|-----------|-----------|
| Agenda de Instalações | Calendário com atribuição de equipas |
| Guia de Transporte | Geração automática com QR scan |
| Relatório Final de Obra | Formulário com fotos, checklist, assinatura |
| Módulo de Assistência | Registo e tracking de pedidos pós-venda |
| Google Calendar Sync | Integração bidirecional |

**Entregável:** Equipa de instalação usa a app no terreno. Ciclo completo do processo fechado.

---

### FASE 5 — Comunicação & Integrações
**Duração estimada:** 3–4 semanas  
**Objetivo:** Automatizar comunicação e ligar a sistemas externos.

| Componente | Descrição |
|-----------|-----------|
| Notificações In-App | Sistema de alertas por role |
| WhatsApp Business API | Mensagens automáticas ao cliente por fase |
| Integração Faturação | API com software de faturação (ex: Moloni) |
| Email de Orçamentos | Envio automático de PDF por email |

**Entregável:** Comunicação automatizada com clientes e ligação ao software de faturação.

---

### FASE 6 — Dashboards Avançados & Otimização
**Duração estimada:** 2–3 semanas  
**Objetivo:** Inteligência de negócio para o Admin.

| Componente | Descrição |
|-----------|-----------|
| Dashboard Financeiro | Receita, margem por projeto, previsões |
| Dashboard de Produtividade | Tempos de produção, comparação estimado vs. real |
| Funil Comercial | Taxa de conversão por fase |
| Ranking de Fornecedores | Performance por prazo e qualidade |
| Exportação de Dados | CSV/Excel para análise externa |

**Entregável:** Admin tem visibilidade total do negócio com dados acionáveis.

---

## 10. ESTIMATIVA DE PREÇO

### Contexto de Pricing
- **Perfil:** Freelancer, Engenheiro Informático, início de carreira de projetos próprios
- **Localização:** Algarve, Portugal
- **Relação:** Projeto para familiar (empresa da tia)

### Estimativa por Fase

| Fase | Descrição | Horas Est. |
|------|-----------|-----------|
| **Fase 1** | Fundação (MVP) | 160–200h |
| **Fase 2** | Orçamentação | 100–130h |
| **Fase 3** | Produção & Armazém | 160–200h |
| **Fase 4** | Instalação & Pós-Venda | 80–100h |
| **Fase 5** | Comunicação & Integrações | 80–100h |
| **Fase 6** | Dashboards & Otimização | 50–70h |
| | | |
| **TOTAL** | | **630–800h** |

### Recomendação de Preço "Familiar Justo"

**(projeto completo, 6 fases)**

#### Justificação:
- **Preço de mercado real** 
- O **desconto familiar** de ~40-50% é generoso mas justo para um primeiro projeto de portfólio
- Este valor permite-te:
  - Cobrar um preço honesto pelo teu trabalho
  - Ter um projeto real e completo no portfólio
  - Manter motivação ao longo dos meses de desenvolvimento
- A tua tia recebe:
  - Software à medida que vale 2-3x o que paga
  - Suporte direto e próximo (sem tickets de suporte de empresa)
  - Flexibilidade na entrega e pagamento

### Modelo de Pagamento Sugerido

| Momento | Percentagem | Condição |
|---------|------------|----------|
| Início do projeto | 20% | Sinal para arrancar |
| Entrega Fase 1 (MVP) | 20% | Sistema básico funcional |
| Entrega Fase 2+3 | 30% | Orçamentação + Produção |
| Entrega Fase 4+5 | 20% | Instalação + Integrações |
| Entrega Fase 6 (Final) | 10% | Dashboards + Garantia 3 meses |

### Manutenção Pós-Projeto (Opcional)
- **Avença mensal:** 100–200/mês para hosting, bugs, pequenas melhorias
- **Alterações significativas:** Orçamentadas à parte

---

## NOTAS FINAIS

### Stack Tecnológico Sugerido (para a IA de desenvolvimento)
- **Frontend:** Next.js (React) + TailwindCSS + shadcn/ui
- **Backend:** Next.js API Routes ou Node.js + Express
- **Base de Dados:** PostgreSQL (Supabase ou Railway)
- **Autenticação:** NextAuth.js ou Supabase Auth
- **Storage:** Supabase Storage ou AWS S3
- **QR Code:** Biblioteca `qrcode` (geração) + scanner nativo do browser
- **Deploy:** Vercel (frontend) + Supabase (backend + DB)
- **Mobile:** PWA (Progressive Web App) para evitar custos de App Store

### Princípio Fundamental
> Cada equipa deve poder trabalhar de forma **independente** sem interromper as outras.  
> A app é o **canal único de comunicação** entre loja, fábrica, armazém e instalação.  
> Todas as ações são **rastreáveis** e o histórico é **imutável**.
