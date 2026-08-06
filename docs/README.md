# Documentação do REPASS AI

Índice do que é **verdade hoje** e do que é registro histórico.

Existe porque o projeto acumulou treze documentos descrevendo o mesmo sistema,
alguns se contradizendo. Quem chega precisa saber em qual acreditar sem ter
que ler todos.

---

## Referência atual

Estes descrevem o sistema como ele está. Se algo aqui divergir do código, o
documento está errado e deve ser corrigido.

| Arquivo | O que tem |
|---|---|
| [ARQUITETURA.md](ARQUITETURA.md) | mapa do sistema, as 5 camadas do pipeline, as redes de proteção, fluxos em diagrama, decisões técnicas com o porquê |
| [ROADMAP.md](ROADMAP.md) | prioridades, riscos conhecidos, decisões em aberto e de quem é cada uma |
| [arquitetura-visual.html](arquitetura-visual.html) | os mesmos fluxogramas renderizados, para abrir no navegador |
| [GUIA_SUPABASE.md](GUIA_SUPABASE.md) | tabelas, RLS, chaves e como ligar o multiusuário |
| [PADRAO_TYPESCRIPT_PYTHON.md](PADRAO_TYPESCRIPT_PYTHON.md) | diretrizes arquiteturais para uso de TypeScript (Frontend / UI Engine) e Python (Backend / IA) |
| [INFRASTRUCTURE.md](INFRASTRUCTURE.md) | Docker, checkpoints e recuperação |
| [SEGURANCA.md](SEGURANCA.md) | arquitetura de segurança, criptografia, vetores de ataque e plano de hardening |
| [repass-ai.drawio](repass-ai.drawio) | mapa do sistema em 4 páginas para abrir no draw.io: arquitetura, pipeline, auditoria de segurança e plano de execução |
| [PROMPT_ENGINE_FABLE5.md](PROMPT_ENGINE_FABLE5.md) | prompt de produção da Fase 1 (cota atômica, IP confiável, anti-SSRF, login neutro) com o impacto de cada alteração |
| [repass-architecture-map.json](repass-architecture-map.json) | o mapa como **dado estruturado**: nós, arestas, fluxos, invariantes e lacunas. É o que um agente lê antes de mexer na arquitetura |
| [repass-architecture-map.html](repass-architecture-map.html) | o mesmo mapa renderizado como sistema vivo |
| [PROMPT_IDENTIDADE_VISUAL.md](PROMPT_IDENTIDADE_VISUAL.md) | prompt da identidade visual — paleta, material acrílico e regras do design system |
| [HANDOFF.md](HANDOFF.md) | passagem de contexto entre sessões de agentes |
| [linear/](linear/) | backlog em CSV e o gerador dele |

O backlog operacional vive no **Linear** (time REPASS AI). Os CSVs aqui são a
fonte para `scripts/linear-sync.mjs`, que é idempotente — roda quantas vezes
quiser, só cria o que falta.

---

## Histórico

[`historico/`](historico/) guarda documentos que descrevem estados anteriores
do projeto. **Não** são referência: alguns contêm informação que deixou de ser
verdade.

Ficam preservados porque explicam decisões — ler por que um caminho foi
abandonado costuma valer mais que o resultado final.

| Arquivo | Por que saiu da referência |
|---|---|
| `PLANO_PRODUCAO.md` | auditoria de frontend com os sprints A–F; os critérios de aceite viraram issues no Linear |
| `REVISAO_SPRINTS.md` | placar dos sprints em 27/07; substituído pelo `ROADMAP.md` |
| `ENGINE_BLUEPRINT.md` | descrevia o motor antes do pipeline de 5 camadas |
| `HYBRID_ENGINE_ARCHITECTURE.md` | absorvido pela seção 4 do `ARQUITETURA.md` |
| `SPRINT_UX_ANTIGRAVITY.md` | plano de UX já executado |
| `HANDOFF_NOVA_SESSAO.md` | passagem de contexto entre sessões |
| `HANDOFF_CLAUDE_CODE.md` | idem, versão anterior |
| `REPASS_AI_ROADMAP_TODO.md` | **contém erro**: diz React 19 (é 18.2) e trata `modal_engine` como parte da arquitetura, quando ele tem zero referências |

---

## Números, para não circularem errados

Medidos por comando em 06/08/2026, não estimados:

| | |
|---|---|
| Código escrito | **28.763 linhas** em 128 arquivos — `.py`, `.jsx`, `.js`, `.mjs`, `.css` |
| Testes de backend | **42 passando / 10 pulados** |
| Rotas na API | 27 |
| Telas | 14 |

O número de código exclui o que é **gerado**: `componentIndex.js` (10.047
linhas produzidas por `build-component-index.mjs`), `package-lock.json` e tudo
sob `backend/data/`. Só o que sobra descreve trabalho de engenharia.

Comando que produz o primeiro número:

```bash
git ls-files '*.py' '*.jsx' '*.js' '*.mjs' '*.css' \
  | grep -vE "componentIndex\.js|package-lock|/data/|\.min\." | xargs wc -l | tail -1
```

Apresentar o total do repositório como "linhas de código do projeto" é a
primeira coisa que um revisor confere, e a primeira que derruba a
credibilidade do resto do documento.

**Divergência corrigida em 06/08/2026:** este arquivo dizia 23.819 linhas e o
`arquitetura-visual.html` dizia 24.264 — dois documentos de referência com
números diferentes para a mesma coisa. Ambos estavam desatualizados. Quando
dois documentos discordam, os dois perdem autoridade.

---

## Convenções

- **Todo número aqui foi medido por comando.** Se não deu para medir, o texto
  diz que é estimativa.
- **O que não funciona é listado junto com o que funciona.** Um documento que
  só lista vitórias é propaganda, não documentação.
- **Cada rede de proteção registra o defeito real que ela impediu.** É o que
  impede alguém de removê-la meses depois por parecer exagero.
