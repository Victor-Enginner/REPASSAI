-- ============================================================
-- REPASS AI — Esquema do banco (Supabase / PostgreSQL)
--
-- Rode no SQL Editor do projeto Supabase antes do primeiro deploy.
-- O arquivo é idempotente: pode rodar de novo sem quebrar nada.
--
-- Portado do esquema validado em produção do franca-leads-scanner,
-- adaptado para o REPASS AI (que também persiste os sites gerados).
-- ============================================================


-- ------------------------------------------------------------
-- 1) PERFIS — plano e cota por usuário
-- ------------------------------------------------------------
create table if not exists perfis (
  user_id           uuid primary key references auth.users(id) on delete cascade,
  email             text not null,
  plano             text not null default 'beta',
  varreduras_limite int  not null default 10,
  varreduras_usadas int  not null default 0,
  sites_limite      int  not null default 5,
  sites_usados      int  not null default 0,
  -- Data de início do ciclo. Quando o mês vira, a cota é renovada.
  ciclo_inicio      date not null default current_date,
  criado_em         timestamptz not null default now()
);


-- ------------------------------------------------------------
-- 2) LEADS — resultado das varreduras OSINT
--
-- Só entra aqui lead com dado REAL da Places API. Lead de demonstração
-- (is_demo no backend) nunca é persistido: se não tem telefone verificado,
-- não vira registro comercial.
-- ------------------------------------------------------------
create table if not exists leads (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users(id) on delete cascade,
  place_id           text not null,
  nicho              text not null,
  nome               text not null,
  endereco           text,
  telefone           text,
  site               text,
  rating             numeric,
  qtd_reviews        integer,
  score_oportunidade integer not null default 0,
  motivo_abordagem   text not null default 'geral',
  mensagem_sugerida  text not null default '',
  status             text not null default 'Base',
  lat                numeric,
  lon                numeric,
  cidade             text,
  estado             text,
  notas              text,
  -- Separado de atualizado_em de propósito: atualizado_em muda a cada nova
  -- varredura, ultimo_contato_em só muda quando o operador realmente
  -- abordou. Misturar os dois faz o funil mentir.
  ultimo_contato_em  timestamptz,
  criado_em          timestamptz not null default now(),
  atualizado_em      timestamptz not null default now()
);

-- Multi-tenant: o MESMO negócio pode ser lead de dois operadores
-- diferentes sem conflito. A unicidade é por (usuário, lugar).
create unique index if not exists leads_user_place_idx on leads (user_id, place_id);
create index if not exists leads_user_idx           on leads (user_id);
create index if not exists leads_score_idx          on leads (score_oportunidade desc);
create index if not exists leads_nicho_idx          on leads (nicho);
create index if not exists leads_status_idx         on leads (status);
create index if not exists leads_cidade_idx         on leads (cidade);
create index if not exists leads_ultimo_contato_idx on leads (ultimo_contato_em);


-- ------------------------------------------------------------
-- 3) SITES — landing pages geradas
--
-- Hoje isso vive no localStorage do navegador: some ao limpar o cache,
-- não sincroniza entre dispositivos e não separa usuários.
-- ------------------------------------------------------------
create table if not exists sites (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  lead_id       uuid references leads(id) on delete set null,
  slug          text not null,
  titulo        text not null,
  -- Schema declarativo validado contra o catálogo de componentes.
  schema        jsonb not null default '{}'::jsonb,
  versao        int   not null default 1,
  publicado     boolean not null default false,
  -- Só recebe valor quando existir deploy real. Enquanto for null, a
  -- interface oferece download, nunca link público.
  url_publica   text,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create unique index if not exists sites_user_slug_idx on sites (user_id, slug);
create index if not exists sites_user_idx on sites (user_id);
create index if not exists sites_lead_idx on sites (lead_id);


-- ------------------------------------------------------------
-- 4) HISTÓRICO DE VERSÕES DOS SITES
-- ------------------------------------------------------------
create table if not exists site_versoes (
  id        uuid primary key default gen_random_uuid(),
  site_id   uuid not null references sites(id) on delete cascade,
  versao    int  not null,
  schema    jsonb not null,
  criado_em timestamptz not null default now()
);

create index if not exists site_versoes_site_idx on site_versoes (site_id, versao desc);


-- ------------------------------------------------------------
-- 5) TRIGGER — mantém atualizado_em em dia
-- ------------------------------------------------------------
create or replace function set_atualizado_em()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_set_atualizado_em on leads;
create trigger leads_set_atualizado_em
  before update on leads
  for each row execute function set_atualizado_em();

drop trigger if exists sites_set_atualizado_em on sites;
create trigger sites_set_atualizado_em
  before update on sites
  for each row execute function set_atualizado_em();


-- ------------------------------------------------------------
-- 6) BLOQUEIO DE ACESSO DIRETO (RLS)
--
-- O backend usa a service_role, que ignora RLS. Os papéis anon e
-- authenticated ficam SEM acesso: mesmo que a chave anon vaze no
-- navegador (ela é pública por natureza), ninguém lê dado de ninguém.
--
-- Toda leitura e escrita passa pela API do REPASS AI, que valida o JWT
-- e filtra por user_id.
-- ------------------------------------------------------------
alter table perfis       enable row level security;
alter table leads        enable row level security;
alter table sites        enable row level security;
alter table site_versoes enable row level security;

revoke all on table perfis       from anon, authenticated;
revoke all on table leads        from anon, authenticated;
revoke all on table sites        from anon, authenticated;
revoke all on table site_versoes from anon, authenticated;


-- ------------------------------------------------------------
-- 9) COTAS ATÔMICAS
--
-- Um SELECT seguido de UPDATE permite que requisições concorrentes leiam o
-- mesmo contador e sobrescrevam uma à outra. Estas funções fazem validação e
-- incremento numa única instrução, sob o lock de linha do próprio UPDATE.
--
-- SECURITY DEFINER é necessário porque anon/authenticated não têm acesso
-- direto às tabelas. Apenas o backend service_role pode executar as RPCs.
-- ------------------------------------------------------------
create or replace function consumir_varredura_atomica(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  with consumida as (
    update perfis
       set varreduras_usadas = varreduras_usadas + 1
     where user_id = p_user_id
       and varreduras_usadas < varreduras_limite
    returning 1
  )
  select exists(select 1 from consumida);
$$;

create or replace function consumir_site_atomico(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  with consumida as (
    update perfis
       set sites_usados = sites_usados + 1
     where user_id = p_user_id
       and sites_usados < sites_limite
    returning 1
  )
  select exists(select 1 from consumida);
$$;

-- ------------------------------------------------------------
-- Devolução de cota.
--
-- A cota passou a ser debitada ANTES do trabalho caro (varredura no Places,
-- criação do site), porque debitar depois deixa a janela onde N requisições
-- simultâneas já gastaram o dinheiro e só uma é cobrada. Debitar antes move
-- o problema: se o trabalho falhar, o usuário perde uma unidade que não usou.
--
-- Estas funções fecham isso. `greatest(0, ...)` porque um contador negativo
-- daria crédito infinito na renovação do mês — o piso é zero, sempre.
-- ------------------------------------------------------------
create or replace function devolver_varredura_atomica(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  with devolvida as (
    update perfis
       set varreduras_usadas = greatest(0, varreduras_usadas - 1)
     where user_id = p_user_id
    returning 1
  )
  select exists(select 1 from devolvida);
$$;

create or replace function devolver_site_atomico(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  with devolvida as (
    update perfis
       set sites_usados = greatest(0, sites_usados - 1)
     where user_id = p_user_id
    returning 1
  )
  select exists(select 1 from devolvida);
$$;

revoke all on function consumir_varredura_atomica(uuid) from public, anon, authenticated;
revoke all on function consumir_site_atomico(uuid) from public, anon, authenticated;
revoke all on function devolver_varredura_atomica(uuid) from public, anon, authenticated;
revoke all on function devolver_site_atomico(uuid) from public, anon, authenticated;
grant execute on function consumir_varredura_atomica(uuid) to service_role;
grant execute on function consumir_site_atomico(uuid) to service_role;
grant execute on function devolver_varredura_atomica(uuid) to service_role;
grant execute on function devolver_site_atomico(uuid) to service_role;
