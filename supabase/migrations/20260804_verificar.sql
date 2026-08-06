-- ============================================================
-- REPASS AI — Conferência da migração de estorno
--
-- Rode DEPOIS de 20260804_estorno_de_cota.sql, no mesmo SQL Editor.
-- Só lê o catálogo do Postgres: não altera nada, pode rodar à vontade.
--
-- COMO LER O RESULTADO
--   Espere 4 linhas, todas com situacao = 'OK'.
--   Qualquer 'FALTANDO' ou 'PERMISSAO ABERTA' significa que a migração
--   não foi aplicada ou foi aplicada pela metade.
-- ============================================================

with esperadas(nome) as (
  values
    ('consumir_varredura_atomica'),
    ('consumir_site_atomico'),
    ('devolver_varredura_atomica'),
    ('devolver_site_atomico')
)
select
  e.nome as funcao,
  case
    when p.oid is null then 'FALTANDO — rode a migracao'
    -- has_function_privilege devolve true se o papel PODE executar.
    -- anon conseguir executar é o cenario grave: a chave anon e publica.
    when has_function_privilege('anon', p.oid, 'EXECUTE')
      then 'PERMISSAO ABERTA — anon consegue executar, revogue'
    when has_function_privilege('authenticated', p.oid, 'EXECUTE')
      then 'PERMISSAO ABERTA — authenticated consegue executar, revogue'
    when not has_function_privilege('service_role', p.oid, 'EXECUTE')
      then 'SEM GRANT — o backend nao consegue chamar'
    when not p.prosecdef
      then 'SEM SECURITY DEFINER — vai falhar por falta de acesso a tabela'
    else 'OK'
  end as situacao
from esperadas e
left join pg_proc p
  on p.proname = e.nome
 and p.pronamespace = 'public'::regnamespace
order by e.nome;
