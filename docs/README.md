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
| [INFRASTRUCTURE.md](INFRASTRUCTURE.md) | Docker, checkpoints e recuperação |
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

Medidos no repositório em 27/07/2026, não estimados:

| | |
|---|---|
| Código escrito | **23.819 linhas** — `.py`, `.jsx`, `.js`, `.mjs`, `.css` |
| Repositório inteiro | 135.768 linhas |
| Arquivos novos não versionados | +108.702 linhas |

A diferença entre o primeiro e os outros dois é **arquivo gerado**: o
`package-lock.json`, o índice dos 1.140 componentes minerados, os planos de
tradução em JSON e os templates preparados.

Só o primeiro número descreve trabalho de engenharia. Apresentar os outros
como "linhas de código do projeto" é a primeira coisa que um revisor confere,
e a primeira que derruba a credibilidade do resto do documento.

---

## Convenções

- **Todo número aqui foi medido por comando.** Se não deu para medir, o texto
  diz que é estimativa.
- **O que não funciona é listado junto com o que funciona.** Um documento que
  só lista vitórias é propaganda, não documentação.
- **Cada rede de proteção registra o defeito real que ela impediu.** É o que
  impede alguém de removê-la meses depois por parecer exagero.
