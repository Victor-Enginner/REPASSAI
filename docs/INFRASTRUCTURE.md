# REPASS AI — raízes, checkpoints e recuperação

Este documento define o que mantém o REPASS AI de pé e como voltar a um
estado conhecido sem adivinhar.

## A árvore do sistema

| Camada | O que contém | Onde fica | Proteção atual |
|---|---|---|---|
| Raiz 1 — código | Frontend, backend, testes e mapa | Git | branch + commits + tags |
| Raiz 2 — configuração | Chaves e endereços dos serviços | `backend/.env` | fora do Git e fora das imagens Docker |
| Raiz 3 — dados locais | Templates, catálogos e HTML compilado | `backend/data` | bind mount no Docker + arquivos do projeto |
| Raiz 4 — dados remotos | Usuários/leads no Supabase e páginas no R2 | Supabase / Cloudflare | políticas e backups dos provedores |
| Tronco | API Python e proxy Nginx | Docker Compose | healthchecks + reinício automático |
| Copa | 13 telas React | container frontend | build reproduzível e fallback SPA |

Git protege o código, mas **não é backup do Supabase, do R2 nem do `.env`**.
Para controle real, as quatro raízes precisam de política própria.

## Checkpoint protegido em 27/07/2026

- Branch: `codex/repass-infrastructure-foundation`
- Commit-base: `c825a77`
- Tag-base: `repass-foundation-2026-07-27`

Para apenas consultar o checkpoint:

```text
git show repass-foundation-2026-07-27
```

Não use `reset --hard` para voltar. A recuperação segura é criar uma branch
nova a partir da tag e comparar antes de substituir qualquer coisa:

```text
git switch -c recovery/repass-foundation repass-foundation-2026-07-27
```

## Execução reproduzível com Docker

Pré-requisito: Docker Desktop com Docker Compose v2.

```text
docker compose build
docker compose up -d
docker compose ps
```

Endereços:

- Aplicação e proxy da API: `http://localhost:3000`
- API direta para diagnóstico: `http://localhost:8000/api/health`
- Mapa vivo: `http://localhost:3000/docs/repass-architecture-map.html`

O frontend é compilado com API relativa (`/api`). O Nginx encaminha as
requisições para o container Python e mantém SSE sem buffer. O arquivo
`backend/.env` é lido em tempo de execução: ele nunca entra na imagem.

O diretório `backend/data` é montado no container. Derrubar ou recriar os
containers não apaga templates e HTML locais.

```text
docker compose down
docker compose up -d --build
```

Não acrescente `-v` ao comando `down` sem revisar o alvo. Hoje usamos bind
mount, mas essa opção pode apagar volumes quando eles forem introduzidos.

## Teste ponta a ponta sem custo

Com frontend e backend ativos:

```text
python scripts/e2e_smoke.py
```

O teste verifica HTML e bundle, mapa, API, SSE, enforcement de JWT, catálogo,
PostgREST do Supabase e uma página pública no R2. Ele não chama Google Places,
não executa LLM e não grava dados.

Última execução em 27/07/2026: **15 verificações aprovadas, zero falhas**.
Naquela fotografia, Supabase respondeu em 264 ms, o bucket R2 em cerca de
2 s e a página pública retornou HTTP 200.

O build do frontend e os testes Python também passaram. A configuração Compose
teve o YAML validado, mas os containers não foram executados porque o Docker
Desktop não está instalado nesta máquina.

## Recuperação por tipo de falha

1. **Mudança de código que quebrou:** crie uma branch a partir da última tag
   saudável e compare os commits.
2. **Container não sobe:** consulte `docker compose ps` e os logs do serviço;
   o healthcheck mostra qual tronco falhou.
3. **`.env` perdido:** restaure de um cofre de segredos. `.env.example` contém
   apenas os nomes, nunca os valores.
4. **Supabase corrompido:** use backup/PITR do Supabase e reaplique
   `supabase/schema.sql` somente após revisar a restauração.
5. **Objeto R2 removido:** republique a cópia preservada em
   `backend/data/r2_bucket`. Para páginas que não existem localmente, use
   versionamento/backup do bucket.

## Próximos reforços de infraestrutura

1. Adicionar backup agendado do Supabase e versionamento do bucket R2.
2. Trocar o endereço `r2.dev` por domínio próprio de produção.
3. Migrar CRM, projetos e faturamento do estado local para o Supabase.
4. Remover o gateway OmniRoute legado do navegador.
5. Adicionar teste com usuário temporário e escrita isolada em ambiente de
   staging, separado dos dados de produção.
