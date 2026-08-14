# REPASS AI — Estado real

> Levantamento de **11/08/2026**. Tudo aqui foi medido contra o código e os
> serviços em uso, não estimado. Onde não consegui medir, está escrito que
> não consegui.
>
> Este documento não propõe nada. Ele descreve. A ordem do que fazer é
> decisão do Victor.

---

## Como ler

Quatro categorias, e a diferença entre elas importa:

| | Significado |
|---|---|
| ✅ **Real** | Funciona, foi verificado, pode ser demonstrado a um cliente |
| 🟡 **Parcial** | Funciona pela metade, ou só num caminho |
| 🔴 **Prometido** | A interface ou a documentação afirma; o código não faz |
| ⚫ **Morto** | Existe no repositório e nada chama |

**Tamanho:** 29.874 linhas versionadas (fora arquivos gerados).

---

## 1. O achado mais importante

**Todo site gerado usa o mesmo template, sempre.**

`backend/app_api.py:1767` passa o nome do template fixo no código:

```python
sintese = lib77.gerar_site_injetado_osint(
    lead_data,
    "aura-template-digital-creative-30",   # <- fixo
    schema=resultado_hibrido.get("schema"),
)
```

Barbearia, padaria, pet shop, advogado — todos recebem `digital-creative-30`.
O nicho **muda os textos** (`hybrid_engine` escreve por nicho, sem IA), mas
**não muda o design**.

E `digital-creative-30` é justamente o template que o HANDOFF marca como
contendo resíduo de agência ("Behance", "Século de Cinema").

### Por que isso passou despercebido

Existem **dois motores de geração**, e só um está ligado:

| | Motor VIVO | Motor documentado |
|---|---|---|
| Módulo | `lib77_engine` + `hybrid_engine` | `template_compiler` + `template_auditor` |
| Catálogo | `data/77lib_catalog/*.json` | `data/template_catalog.json` |
| Escolhe por nicho? | ❌ não — fixo | ✅ sim, com peso por palavra |
| Quem chama | `app_api.py` | **só os testes** |

`template_compiler.selecionar_template()` — a função que casa nicho com
template — é chamada **exclusivamente por `test_api.py`**. Nenhum caminho de
produção passa por ela.

A documentação descreve o segundo motor ("pipeline de 5 camadas", "12 nichos
compilando em 14 ms"). O produto roda o primeiro.

---

## 2. ✅ O que é real

| Bloco | Evidência medida |
|---|---|
| Varredura de leads pelo OpenStreetMap | 14 negócios reais em Franca, 13 sem site, custo R$ 0,00 |
| Classificação de presença digital | 4 classes; nos 119 leads reais: 28 sem site, 30 só rede social, 8 sem HTTPS, 53 com site |
| Ordenação por oportunidade | Verificada na tela: sem site → só rede social → sem HTTPS → tem site |
| Persistência no Supabase | Criar 200, editar 200 (versão 2), ler com histórico; cota debita 1 por criação |
| Cota atômica | 4 RPCs criadas em 10/08; débito e estorno fecham em zero |
| Upload para Cloudflare R2 | 1.408 objetos no bucket, 8 sites de cliente |
| Seleção de cidade | 5.571 municípios do IBGE, cascata país→estado→cidade por clique |
| Responsividade | 11 abas × 6 larguras (360→1440), zero cortes |
| Suíte de testes | 52 backend + 6 responsivos |
| Trava de design tokens | 33 arquivos, nenhuma cor hex solta |

---

## 3. 🟡 O que é parcial

**Upload para o R2 falha em silêncio.**
11 sites na máquina, 8 no bucket. Três nunca subiram e nada avisou. A cópia
local é gravada primeiro de propósito (falha de rede não pode perder
trabalho), mas ninguém verifica se o upload aconteceu.

**Google Places desativado.**
Cobrança desligada no Google Cloud; a API recusa tudo com `REQUEST_DENIED`.
A varredura funciona 100% pelo OSM. O custo disso: no OSM só ~6% dos
registros têm telefone, e sem telefone não há abordagem por WhatsApp.

**Modo de desenvolvimento é o único modo.**
O backend roda com `REPASS_DEV_SINGLE_USER`, apontando para uma conta real
do Supabase. Não existe multiusuário em uso.

**CI roda um scanner só.**
`secure-code-scan.yml` é o único workflow. Não roda testes, não roda build.
Um commit que quebra a suíte passa pelo CI.

---

## 4. 🔴 O que está prometido e não entrega

| Onde | Promessa | Realidade |
|---|---|---|
| Chatbot do construtor | "Cole uma URL para clonar" + botão **CLONAR** | Não clona. Lê o domínio da string e devolve um template do catálogo local. Nenhuma requisição é feita ao site colado |
| Documentação | "12 nichos compilando", "5 camadas" | Descreve o motor que só os testes usam |
| Catálogo de 121 nichos | Casamento nicho→template | Alimenta o motor desligado |
| Loja de templates | Preço por template | `PRECO_PADRAO_CENTAVOS = 0`; mudar exige editar arquivo à mão |
| Menu lateral | "Abordagem 1-a-1 — EM BREVE" | A tela existe e funciona |

---

## 5. ⚫ Código morto

15 dos 25 módulos do backend não são alcançáveis a partir da API:

```
basehub_engine        beta_live_runner      buscador_de_pagina
diagnosticar_provedores  modal_engine       originkit_engine
originkit_scraper     template_auditor      template_compiler
template_preparer     template_translator
```

(Os demais são testes e o iniciador de desenvolvimento, que têm razão de
existir fora do caminho da API.)

Quatro deles — `template_compiler`, `template_auditor`, `template_preparer`,
`template_translator` — não são lixo: são o **motor documentado**. Estão
mortos porque a API foi ligada no outro.

---

## 6. Débito técnico, por gravidade

### 🔴 Impede produção

1. **O backend não tem onde rodar.** Existe `Dockerfile` e `docker-compose.yml`,
   mas nenhum destino: sem Fly, Railway, Render, ECS. Hoje o REPASS sai do ar
   quando o notebook fecha.
2. **Segredos em `.env` local.** Supabase (chave secreta), R2, Linear, Google.
   Sem cofre, sem rotação.
3. **Um template para todos os clientes** (seção 1).

### 🟠 Risco real

4. **Dependências sem varredura nem trava.** Sem Snyk, sem Dependabot, sem
   lock com hash. Uma falha em `boto3` ou `three` passaria despercebida.
5. **Upload silencioso** (seção 3).
6. **CI sem testes nem build** (seção 3).
7. **Tailwind vindo de CDN** nos templates do cliente: se o CDN cair, o site
   do cliente quebra.

### 🟡 Atrito

8. **Documentação descreve outro sistema** (seção 1). Custou tempo hoje.
9. **Botão que promete clonar e não clona** (seção 4).
10. **Loja e gerador são catálogos separados** — template novo na loja não
    chega ao gerador.

---

## 7. O que eu errei — 11/08

Em nome de não repetir:

**Expandi o catálogo errado.** Passei o `template_catalog.json` de 58 para
121 nichos e verifiquei que o casamento funcionava — mas verifiquei chamando
`template_compiler` diretamente, que é o motor desligado. No produto, aquilo
não muda nada. Metade do commit `b14bfbb` (os grupos de nicho na tela do
Scanner) está viva e funciona; a outra metade não.

**Lição:** verificar a função não é verificar o caminho. A pergunta certa é
"quem chama isso em produção?", e eu não fiz.

---

## 8. O que não consegui medir

- **Qual biblioteca cria o worker bloqueado pelo CSP.** Nasce no
  carregamento inicial, antes de instrumentar. Corrigido pelo efeito
  (o erro sumiu), não pela identificação.
- **O encavalamento do herói na landing.** Medido a 1855×744 e não
  reproduziu. Falta a largura e a altura exatas da janela do Victor.
- **Se os 3 sites ausentes no R2 falharam no upload ou nunca foram
  publicados.** O log não guarda essa distinção.

---

## Resumo em uma linha

O REPASS **encontra leads de verdade, de graça, e os organiza bem**. O que
ele ainda não faz é **entregar um site diferente por cliente** e **existir
fora do computador do Victor**.
