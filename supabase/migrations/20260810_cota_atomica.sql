-- ============================================================
-- REPASS AI — Migração: funções de cota atômica
-- Data: 10/08/2026
--
-- COMO RODAR
--   Supabase → SQL Editor → New query → cole este arquivo inteiro → Run.
--
-- POR QUE EXISTE
--   Medido em 10/08/2026 contra o banco em uso: as quatro RPCs de cota
--   NÃO existiam lá. As quatro respondiam PGRST202 ("could not find the
--   function"). Elas estavam escritas em supabase/schema.sql, mas o schema
--   nunca foi reaplicado depois que foram acrescentadas — o repositório
--   estava adiante do banco.
--
--   Consequência real: `POST /api/sites` respondia 503 em toda CRIAÇÃO de
--   site. O handler debita a cota antes de gravar, o débito estourava, e o
--   erro virava "Nao foi possivel salvar agora". Editar site existente
--   funcionava, porque esse caminho não debita.
--
--   O diagnóstico anterior atribuía esse 503 à chave estrangeira de
--   perfis.user_id para auth.users. Isso era outra coisa: com
--   REPASS_DEV_USER_ID apontando para uma conta real, o 503 continuou —
--   por este motivo aqui.
--
-- É SEGURO?
--   Sim. Só cria função. Não altera tabela, não apaga dado, não mexe em
--   RLS. `create or replace` torna o arquivo idempotente: rodar duas vezes
--   dá o mesmo resultado que rodar uma.
--
-- Conteúdo idêntico ao de supabase/schema.sql (seção de cota), isolado aqui
-- para poder ser aplicado sem reexecutar o schema inteiro.
-- ============================================================


-- ------------------------------------------------------------
-- Débito de cota, atômico.
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
-- A cota é debitada ANTES do trabalho caro (varredura no Places, criação do
-- site), porque debitar depois deixa a janela onde N requisições simultâneas
-- já gastaram o dinheiro e só uma é cobrada. Debitar antes move o problema:
-- se o trabalho falhar, o usuário perde uma unidade que não usou.
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


-- SECURITY DEFINER faz a função rodar com os privilégios de quem a criou.
-- Sem estes REVOKE, qualquer portador da chave anon (que é pública, vive no
-- navegador) chamaria a RPC pela API REST e devolveria cota para si mesmo
-- sem limite. Só o backend, com a service_role, pode executar.
revoke all on function consumir_varredura_atomica(uuid) from public, anon, authenticated;
revoke all on function consumir_site_atomico(uuid)      from public, anon, authenticated;
revoke all on function devolver_varredura_atomica(uuid) from public, anon, authenticated;
revoke all on function devolver_site_atomico(uuid)      from public, anon, authenticated;

grant execute on function consumir_varredura_atomica(uuid) to service_role;
grant execute on function consumir_site_atomico(uuid)      to service_role;
grant execute on function devolver_varredura_atomica(uuid) to service_role;
grant execute on function devolver_site_atomico(uuid)      to service_role;
