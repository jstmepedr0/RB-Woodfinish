alter table public.clientes
  add column if not exists data_registo date,
  add column if not exists responsavel text,
  add column if not exists notas_obra text;

update public.clientes
set data_registo = coalesce(data_registo, created_at::date);

alter table public.clientes
  alter column data_registo set default current_date,
  alter column data_registo set not null;

drop policy if exists "Admin pode apagar moradas" on public.moradas_obra;
drop policy if exists "Comercial e Admin podem apagar moradas" on public.moradas_obra;

create policy "Comercial e Admin podem apagar moradas"
  on public.moradas_obra for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'comercial')
    )
  );
