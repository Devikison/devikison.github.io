-- Descomplica Site: tabela e pasta privada dos briefings do /formulario
create table if not exists public.descomplica_briefings (
  id uuid primary key,
  criado_em timestamptz not null default now(),
  nome text not null,
  empresa text,
  whatsapp text,
  email text,
  servico text,
  respostas jsonb not null default '{}'::jsonb,
  links jsonb not null default '[]'::jsonb,
  arquivos jsonb not null default '[]'::jsonb,
  status text not null default 'novo'
);
alter table public.descomplica_briefings enable row level security;

insert into storage.buckets (id, name, public, file_size_limit)
values ('briefings-descomplica', 'briefings-descomplica', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = 52428800;

drop policy if exists "briefing anon envia arquivo" on storage.objects;
create policy "briefing anon envia arquivo" on storage.objects
  for insert to anon
  with check (
    bucket_id = 'briefings-descomplica'
    and (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    and array_length(storage.foldername(name), 1) = 1
  );
