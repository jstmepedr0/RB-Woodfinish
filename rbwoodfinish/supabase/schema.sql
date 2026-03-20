-- ============================================================
-- RBWOODFINISH — Schema SQL para Supabase (Fase 1)
-- ============================================================

-- Extensão para UUIDs
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABELA: profiles (ligada ao auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nome text not null,
  email text not null,
  role text not null default 'comercial' check (role in ('admin', 'comercial', 'armazem', 'producao', 'instalacao')),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles visíveis para utilizadores autenticados"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Admin pode inserir profiles"
  on public.profiles for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or id = auth.uid()
  );

create policy "Admin pode atualizar profiles"
  on public.profiles for update
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or id = auth.uid()
  );

-- Trigger para criar profile automaticamente ao registar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'comercial')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- TABELA: clientes
-- ============================================================
create table public.clientes (
  id uuid primary key default uuid_generate_v4(),
  tipo text not null check (tipo in ('casual_b2c', 'profissional_b2b')),
  nome text not null,
  nif text,
  contacto_telefone text,
  email text,
  morada_sede text,
  notas text,
  comercial_responsavel_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clientes enable row level security;

create policy "Clientes visíveis para utilizadores autenticados"
  on public.clientes for select
  to authenticated
  using (true);

create policy "Comercial e Admin podem criar clientes"
  on public.clientes for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'comercial')
    )
  );

create policy "Comercial e Admin podem atualizar clientes"
  on public.clientes for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'comercial')
    )
  );

create policy "Só Admin pode apagar clientes"
  on public.clientes for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Trigger updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger clientes_updated_at
  before update on public.clientes
  for each row execute function public.update_updated_at();

-- ============================================================
-- TABELA: moradas_obra
-- ============================================================
create table public.moradas_obra (
  id uuid primary key default uuid_generate_v4(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  morada text not null,
  descricao text,
  gps_coords text,
  created_at timestamptz not null default now()
);

alter table public.moradas_obra enable row level security;

create policy "Moradas visíveis para autenticados"
  on public.moradas_obra for select
  to authenticated
  using (true);

create policy "Comercial e Admin podem criar moradas"
  on public.moradas_obra for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'comercial')
    )
  );

create policy "Comercial e Admin podem atualizar moradas"
  on public.moradas_obra for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'comercial')
    )
  );

create policy "Admin pode apagar moradas"
  on public.moradas_obra for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- TABELA: processos
-- ============================================================
create table public.processos (
  id uuid primary key default uuid_generate_v4(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  morada_obra_id uuid references public.moradas_obra(id),
  estado_global text not null default 'contacto' check (
    estado_global in (
      'contacto', 'visita', '3d', 'orcamento', 'adjudicacao',
      'retificacao', 'producao', 'expedicao', 'instalacao',
      'concluido', 'assistencia'
    )
  ),
  comercial_id uuid references public.profiles(id),
  notas text,
  data_adjudicacao timestamptz,
  data_conclusao timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.processos enable row level security;

create policy "Processos visíveis para autenticados"
  on public.processos for select
  to authenticated
  using (true);

create policy "Comercial e Admin podem criar processos"
  on public.processos for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'comercial')
    )
  );

create policy "Comercial e Admin podem atualizar processos"
  on public.processos for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'comercial')
    )
  );

create policy "Admin pode apagar processos"
  on public.processos for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create trigger processos_updated_at
  before update on public.processos
  for each row execute function public.update_updated_at();

-- ============================================================
-- TABELA: documentos
-- ============================================================
create table public.documentos (
  id uuid primary key default uuid_generate_v4(),
  processo_id uuid not null references public.processos(id) on delete cascade,
  pasta text not null check (
    pasta in (
      'plantas', 'proj3d', 'orc_fornecedor', 'orc_cliente',
      'orc_extras', 'retificacao', 'encomenda', 'fatura',
      'producao', 'enc_fornecedores', 'fotos'
    )
  ),
  nome_ficheiro text not null,
  tipo_ficheiro text not null,
  url_ficheiro text not null,
  tamanho_bytes bigint,
  uploaded_por_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.documentos enable row level security;

create policy "Documentos visíveis para autenticados"
  on public.documentos for select
  to authenticated
  using (true);

create policy "Utilizadores autenticados podem criar documentos"
  on public.documentos for insert
  to authenticated
  with check (true);

create policy "Admin pode apagar documentos"
  on public.documentos for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- TABELA: ocorrencias (feed imutável)
-- ============================================================
create table public.ocorrencias (
  id uuid primary key default uuid_generate_v4(),
  processo_id uuid not null references public.processos(id) on delete cascade,
  utilizador_id uuid not null references public.profiles(id),
  tipo text not null check (
    tipo in ('nota', 'foto', 'estado_mudou', 'documento', 'mensagem')
  ),
  conteudo text not null,
  created_at timestamptz not null default now()
);

alter table public.ocorrencias enable row level security;

create policy "Ocorrências visíveis para autenticados"
  on public.ocorrencias for select
  to authenticated
  using (true);

create policy "Utilizadores autenticados podem criar ocorrências"
  on public.ocorrencias for insert
  to authenticated
  with check (true);

-- Ocorrências são imutáveis: sem UPDATE nem DELETE policies

-- ============================================================
-- INDEXES para performance
-- ============================================================
create index idx_clientes_tipo on public.clientes(tipo);
create index idx_clientes_comercial on public.clientes(comercial_responsavel_id);
create index idx_moradas_cliente on public.moradas_obra(cliente_id);
create index idx_processos_cliente on public.processos(cliente_id);
create index idx_processos_estado on public.processos(estado_global);
create index idx_processos_comercial on public.processos(comercial_id);
create index idx_documentos_processo on public.documentos(processo_id);
create index idx_documentos_pasta on public.documentos(pasta);
create index idx_ocorrencias_processo on public.ocorrencias(processo_id);
create index idx_ocorrencias_created on public.ocorrencias(created_at desc);

-- ============================================================
-- STORAGE BUCKET para documentos
-- ============================================================
insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', false)
on conflict (id) do nothing;

create policy "Autenticados podem fazer upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'documentos');

create policy "Autenticados podem ver ficheiros"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'documentos');

create policy "Admin pode apagar ficheiros"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'documentos'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
