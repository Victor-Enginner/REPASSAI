# REPASS AI — Transferência para outro agente de IA

> Cole este documento inteiro na primeira mensagem do agente novo (Antigravity,
> Cursor, Codex, Windsurf ou outro). Ele contém o estado real do projeto, as
> regras que não podem ser quebradas e o que fazer em seguida.
>
> Última atualização: **27/07/2026**. Commit `9c8f59e`.

---

## 1. O que é o produto

Encontra negócios locais sem site no Google Places, gera uma landing page para
cada um em 14 ms, e organiza a abordagem comercial num funil. Cliente final:
quem vende site para barbearia, padaria, petshop, oficina.

**Stack:** React 18.2 + Vite 5 no frontend · Python 3.11+ com
`ThreadingHTTPServer` da biblioteca padrão no backend (sem framework, por
escolha) · Supabase · Cloudflare R2 · Google Places · gateway multi-LLM.

---

## 2. Como rodar e verificar

```bash
npm install && pip install -r backend/requirements.txt
cp backend/.env.example backend/.env    # preencher as chaves
python backend/app_api.py               # API em :8000
npm run dev                             # painel em :3000
```

Verificação — **rode antes e depois de qualquer mudança**:

```bash
cd backend && python test_api.py          # 23 testes
cd backend && python test_hybrid_engine.py # 4 testes
npm run lint                               # reprova cor hex à mão
npm run build
```

Se algum desses falhar depois de uma mudança sua, a mudança está errada.

---

## 3. A arquitetura em uma frase

**A IA não participa da geração de sites.** Ela roda uma vez por template, na
importação. Gerar um site é troca de texto: 14 ms, R$ 0,00.

```
IMPORTAR TEMPLATE (raro, com IA)          GERAR SITE (sempre, sem IA)
1 catálogo    template_catalog.json       5 seletor    casa nicho do lead
2 preparador  template_preparer.py        4 compilador template_compiler.py
3 tradutor    template_translator.py         └ preenche, troca mídia, AUDITA
   └ grava data/templates_preparados/*.pt.html
```

Ler `docs/ARQUITETURA.md` antes de tocar em qualquer parte disso.

---

## 4. Regras que não podem ser quebradas

Cada uma existe porque o defeito **aconteceu** e chegou perto do cliente final.
Se algo aqui parecer exagero, leia o motivo antes de remover.

| Regra | Por quê |
|---|---|
| **Nunca inventar contato** | telefone sorteado pertence a alguém real. Sem dado, o campo fica vazio |
| **Nunca inventar preço** | a IA escreveu *"Entrada: R$ 1.000.000"* numa pousada. Todo preço vira "Sob consulta" |
| **Auditoria bloqueia, não avisa** | site com resíduo não é salvo. Publicar sujo é pior que não publicar |
| **Idioma sempre `pt-BR`** | os templates vinham com `lang="fr"`; o Google tratava o site como francês |
| **Texto por posição, não por frase** | 6 idiomas de origem; busca por frase exigiria ~200 regras irrevisáveis |
| **Preço e telefone são regra, não IA** | o modelo é criativo justamente onde não pode ser |
| **Modo demonstração é explícito** | quando a busca falha, os cards mostram selo e contato vazio |

---

## 5. O que NÃO funciona (não prometa que funciona)

- `POST /api/site/clone` **não clona** — devolve schema fixo
- `backend/modal_engine.py` tem **zero referências** (código morto)
- Templates da 77lib carregam Tailwind de CDN externo; o template base próprio
  (`repass-base-local`) não tem esse problema
- Site gerado não tem `<main>`; hierarquia de títulos pula um nível
- Sem testes end-to-end de jornada
- Template genérico ainda tem conteúdo de agência traduzido (afeta petshop,
  academia e comércio geral)

---

## 6. Armadilhas que já custaram tempo

Erros reais desta sessão. Não repita:

1. **Marcador com dígito.** A expressão era `[A-Z_]+` e não casava
   `{{SERVICO_1_TITULO}}`. Como preenchimento, limpeza e auditoria usam a mesma
   constante, o marcador aparecia cru na página e passava pelos três.

2. **`<br/>` em rótulo de Mermaid não renderiza** neste ambiente — vira texto
   colado (`"EncontrarGoogle Places"`). Use ` · ` como separador.

3. **`documentCreate` do Linear exige projeto pai.** Sem ele responde
   `Argument Validation Error`, que não diz qual argumento faltou.

4. **Auditoria não julga aparência.** Ela garante ausência de resíduo. Layout
   quebrado passa por ela — **abra a página no navegador** antes de dizer
   "pronto". Isso falhou três vezes nesta sessão.

5. **Mesmo dado em dois arquivos desincroniza.** O número de linhas foi
   corrigido em um documento e esquecido em dois. Ao mudar um número, procure
   por ele no repositório inteiro.

6. **`HTTPError` herda de `URLError`.** Um teste reportava "servidor offline"
   quando na verdade recebia 401, e parou de validar em silêncio.

---

## 7. Tamanho real do projeto

O repositório soma 371.638 linhas, mas **código escrito é 24.264**. O resto:

| Origem | Linhas |
|---|---|
| PNG, MP4 e ZIP contados como texto | 71.084 |
| Componentes minerados (MIT, terceiros) | 36.330 |
| Templates preparados (gerados) | 38.120 |
| Sites gerados e amostras | 29.315 |
| `package-lock` e travas | 9.101 |

Não apresente os números maiores como "tamanho do projeto".

---

## 8. Onde ficam as coisas

```
backend/
  app_api.py              rotas, autenticação, limite de taxa
  template_catalog.json   nicho → template
  template_preparer.py    extração por posição em bytes
  template_translator.py  classificação com IA (roda uma vez)
  template_compiler.py    compilação e seleção
  template_auditor.py     diagnóstico read-only
  lib77_engine.py         motor legado + REGRAS DE AUDITORIA (usadas por todos)
  hybrid_engine.py        textos por nicho, sem IA
  rules/                  texto, validação, categorização
  data/templates_preparados/   os templates em pt-BR
  data/amostras/               18 sites de referência

src/services/documentDB.js   persistência no Supabase (não é mais localStorage)
scripts/verificar-tokens.mjs trava de design system
scripts/linear-sync.mjs      backlog → Linear (idempotente)
```

---

## 9. Próximos passos, em ordem

1. **Abrir os 12 sites gerados no navegador** e anotar o que está feio.
   `backend/data/77lib_catalog/generated_*.html`. Não precisa de código.
2. **Corrigir o template genérico** — ainda tem "Behance", "Século de Cinema" e
   linguagem de agência. Afeta 3 nichos.
3. **Campo para o dono enviar fotos e vídeo** do próprio negócio.
4. **Tirar o Tailwind do CDN** nos 8 templates da 77lib.
5. **Domínio próprio** servindo o bucket R2 (hoje publica em `pub-*.r2.dev`).

Backlog completo: Linear, time REPASS AI, 65 issues em 13 projetos.

---

## 10. Como trabalhar neste projeto

O dono **não é desenvolvedor**. Ele conhece o produto e enxerga defeito visual
melhor que qualquer teste automático, mas não lê código.

- Explique em português claro, sem jargão. Se usar um termo técnico, defina.
- **Meça antes de afirmar.** Rode o comando, não estime.
- Diga o que **não** conferiu. Ele confia mais em quem admite o limite.
- Uma coisa de cada vez, verificada na tela antes da próxima.
- Quando ele apontar um defeito, ele quase sempre está certo — ele olha a tela,
  você olha o código.

---

## 11. Pendências do dono

- Revogar a chave de API do Linear exposta em chat e gerar outra
- Tirar prints do mapa visual e salvar em `docs/screenshots/`
- Decidir: `/api/site/clone` — implementar ou remover da interface?
- Decidir: tela para editar preço de template, ou editar o JSON direto?

Chaves nos commits `bf11c0d` e `f62e7fa` (Google Places, LLM, Modal) — decidido
em 27/07/2026 **não** rotacionar nem reescrever o histórico. Risco aceito
enquanto o repositório for privado.
