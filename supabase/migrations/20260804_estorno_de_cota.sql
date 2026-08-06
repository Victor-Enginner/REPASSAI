-- ============================================================
-- REPASS AI — Migração: estorno de cota
-- Data: 04/08/2026
--
-- COMO RODAR
--   Supabase → SQL Editor → New query → cole este arquivo inteiro → Run.
--
-- É SEGURO?
--   Sim. Só cria função nova. Não altera tabela, não apaga dado, não mexe
--   em RLS. `create or replace` torna o arquivo idempotente: rodar duas
--   vezes dá o mesmo resultado que rodar uma.
--
-- POR QUE EXISTE
--   A cota passou a ser debitada ANTES do trabalho caro (Google Places,
--   LLM). Antes era o contrário: o backend rodava o trabalho e só depois
--   chamava a RPC, descartando o retorno — dez requisições simultâneas
--   gastavam as dez e só uma era cobrada (Denial of Wallet).
--
--   Debitar antes fecha isso, mas cria o risco inverso: se o trabalho
--   falhar, o cliente perde uma unidade que não usou. Estas duas funções
--   são o estorno.
--
-- SE VOCÊ NÃO RODAR
--   O sistema funciona: o débito e o bloqueio já valem. Só o estorno falha
--   (em silêncio, de propósito — está registrado no log do servidor como
--   "[Supabase] Estorno de ... falhou"). O prejuízo é o cliente perder uma
--   unidade de cota quando o Places ou o banco cair.
-- ============================================================


-- `greatest(0, ...)` é a trava que importa aqui: contador negativo daria
-- crédito extra na virada do mês, quando `obter_ou_criar_perfil` zera o
-- ciclo. O piso é zero, sempre.

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

revoke all on function devolver_varredura_atomica(uuid) from public, anon, authenticated;
revoke all on function devolver_site_atomico(uuid)      from public, anon, authenticated;

grant execute on function devolver_varredura_atomica(uuid) to service_role;
grant execute on function devolver_site_atomico(uuid)      to service_role;
