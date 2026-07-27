# Guia — Ligar banco de dados e login (Supabase)

O modo multiusuário vem **desligado**. Sem as variáveis abaixo, o REPASS AI
roda exatamente como hoje: single-user, sem tela de login, dados no
navegador. Isso é proposital — permite subir o código sem quebrar seu fluxo.

Este guia liga o modo multiusuário. Leva ~10 minutos.

---

## O que muda ao ligar

| | Desligado (hoje) | Ligado |
|---|---|---|
| Onde ficam os leads | localStorage do navegador | Postgres (Supabase) |
| Some ao limpar cache | Sim | Não |
| Sincroniza entre dispositivos | Não | Sim |
| Vários operadores | Não | Sim, isolados |
| Cota por plano | Não | Sim |
| Tela de login | Não aparece | Obrigatória |

---

## Passo 1 — Criar o projeto

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Escolha a região **South America (São Paulo)** — menor latência para o Brasil
3. Guarde a senha do banco que ele pedir

## Passo 2 — Criar as tabelas

No painel do projeto, abra **SQL Editor** → **New query**, cole todo o
conteúdo de [`supabase/schema.sql`](../supabase/schema.sql) e execute.

Isso cria `perfis`, `leads`, `sites` e `site_versoes`, com índices, trigger
de `atualizado_em` e o bloqueio de RLS.

O arquivo é idempotente: pode rodar de novo sem quebrar nada.

## Passo 3 — Pegar as chaves

**Project Settings → API**. Você precisa de três valores:

| Campo no painel | Vai para |
|---|---|
| Project URL | `SUPABASE_URL` |
| `Publishable key` (`sb_publishable_...`) | `SUPABASE_PUBLISHABLE_KEY` |
| `Secret key` (`sb_secret_...`) | `SUPABASE_SECRET_KEY` |

Projetos antigos podem continuar usando `SUPABASE_ANON_KEY` e
`SUPABASE_SERVICE_ROLE_KEY`; o backend aceita os dois formatos.

Cole em `backend/.env`.

> **Sobre a chave secreta:** ela possui acesso privilegiado. Só o
> backend usa. Nunca coloque numa variável `VITE_*` — tudo que começa com
> `VITE_` é embutido no bundle e fica visível para qualquer visitante.
>
> A `anon` é diferente: ela é pública por natureza, o navegador precisa
> dela para fazer login. Como o `schema.sql` revoga o acesso de `anon` e
> `authenticated` a todas as tabelas, mesmo que ela vaze ninguém lê dado
> de ninguém.

## Passo 4 — Reiniciar e conferir

```bash
python backend/app_api.py
```

```bash
curl http://localhost:8000/api/auth/status
```

Deve responder `"modo": "multiusuario"` e `"auth_ativo": true`.

Abra o app: a tela de login aparece. Crie sua conta em **CRIAR CONTA**.

> Se o Supabase estiver com confirmação de e-mail ligada (padrão), você
> recebe um e-mail antes de conseguir entrar. Para desligar em
> desenvolvimento: **Authentication → Providers → Email → Confirm email**.

---

## Como funciona a segurança

```
Navegador                Backend REPASS AI            Supabase
    │                           │                        │
    ├── login (anon key) ───────┼───────────────────────>│
    │<────────── JWT ───────────┼────────────────────────┤
    │                           │                        │
    ├── Bearer JWT ────────────>│                        │
    │                           ├── valida o JWT ───────>│
    │                           ├── lê/escreve           │
    │                           │   (service_role,       │
    │                           │    filtrando user_id) ─>│
    │<──── só os SEUS dados ────┤                        │
```

Três camadas:

1. **RLS ligado** em todas as tabelas, com `anon` e `authenticated`
   revogados — ninguém acessa o banco direto
2. **JWT validado no servidor** a cada requisição
3. **Filtro por `user_id`** em toda consulta

A unicidade dos leads é `(user_id, place_id)`. Isso significa que o mesmo
restaurante pode ser lead de dois operadores diferentes sem conflito — cada
um tem seu próprio universo.

## Cota por plano

Cada usuário ganha um registro em `perfis` no primeiro acesso:

```
plano             beta
varreduras_limite 10   por mês
sites_limite      5    por mês
```

A cota renova sozinha quando o mês vira (comparando `ciclo_inicio`).
Para mudar o plano de alguém, rode no SQL Editor:

```sql
update perfis
   set plano = 'agencia', varreduras_limite = 200, sites_limite = 90
 where email = 'operador@exemplo.com';
```

---

## Voltar atrás

Apague (ou esvazie) `SUPABASE_URL` do `backend/.env` e reinicie. O app volta
ao modo single-user na hora. Os dados continuam no Supabase, intactos, para
quando você religar.

---

## O que ainda não está ligado

- **Leads** — persistem no scan ✅
- **Sites gerados** — a tabela `sites` existe, mas o editor ainda salva no
  localStorage. É o próximo passo.
- **Recuperação de senha** — o endpoint do Supabase existe, falta a tela.
