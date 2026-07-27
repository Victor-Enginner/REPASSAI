# REPASS AI — Blueprint do Motor de Geração

Extração acionável dos três documentos de referência, traduzida em decisões
de engenharia para este repositório.

Fontes: `Modern_Web_Engine_Blueprint.pdf`, `AI_Engineering_Blueprint.pdf`,
`Kerneo_Agent_Engineering.pdf` (decks visuais, 15 páginas cada).

---

## 1. Princípio central

> "O verdadeiro design premium não exibe esforço; exibe controle."

O que separa Lovable/v0 de um gerador comum **não é o modelo de IA**. É que
a IA nunca escreve CSS nem JSX livre. Ela recebe um catálogo de componentes
prontos e decide apenas **quais usar e com quais props**.

Consequência direta para o REPASS AI: todo o esforço de qualidade visual vai
para o **catálogo**, não para o prompt.

---

## 2. Arquitetura de geração (RAG sobre componentes)

```
Prompt vago ("site pra loja de sapatos femininos")
   │
   ├─[1] EXPANSÃO ......... expandirIntencao()
   │      nicho + paleta + tom + seções
   │
   ├─[2] RETRIEVAL ........ recuperarCandidatos()
   │      104 componentes → 5 fundos + 10 componentes compatíveis
   │
   ├─[3] SELEÇÃO .......... LLM, temperature 0
   │      escolhe SÓ entre os candidatos; saída = JSON, nunca JSX
   │
   ├─[4] VALIDAÇÃO ........ validarSchema()
   │      componente fora do catálogo = rejeitado
   │      dependência npm ausente = rejeitado
   │      prop desconhecida = descartada com aviso
   │
   └─[5] RENDER ........... React monta a partir do catálogo real
```

Implementado em:
- `scripts/build-component-index.mjs` — indexador do Site Pack
- `src/data/componentIndex.js` — índice gerado (não editar à mão)
- `src/services/componentRetrieval.js` — retrieval + validação

Regenerar o índice: `npm run build:index`

### Por que a validação do passo 4 é inegociável

É o "isolamento de tokens" do AI_Engineering_Blueprint aplicado a componentes.
Se o modelo alucinar `<NeonHologramCard>`, o schema é rejeitado com erro
explícito em vez de gerar um build quebrado que só falha no cliente.

---

## 3. Estado do catálogo

104 componentes indexados, **75 instaláveis** com as dependências atuais.

| Dependência | Componentes | Instalada |
|---|---|---|
| (nenhuma) | 28 | — |
| `ogl` | 29 | ✅ |
| `gsap` | 17 | ✅ |
| `three` | 9 | ❌ |
| `@react-three/fiber` | 7 | ❌ |
| `motion` | 7 | ❌ |
| `@react-three/drei` | 5 | ❌ |
| `postprocessing` | 3 | ❌ |
| outras (7 pacotes) | 7 | ❌ |

29 componentes ficam marcados `instalavel: false` e o retrieval os ignora.
Para liberá-los, instalar o grupo `three` + `@react-three/fiber` + `@react-three/drei`
desbloqueia 21 de uma vez — é a melhor relação custo/benefício.

Nota: `motion` é o pacote novo do `framer-motion` (já instalado). Um alias no
`vite.config.js` liberaria os 7 sem instalar nada.

---

## 4. Técnicas de geração visual (Modern_Web_Engine)

Aplicar nos sites gerados, não no painel.

### 4.1 DOM vs GPU
Tocar no DOM força reflow/repaint na CPU. Canvas pinta pixel direto na GPU.
Animação estrutural via DOM quebra frame rate em celular.

### 4.2 Um único batimento cardíaco
```js
gsap.ticker.add(() => renderer.render(scene, camera));
```
**Pendência atual**: cada componente WebGL do repo tem seu próprio
`requestAnimationFrame`. Com 3 na tela são 3 loops competindo. Unificar no
ticker do GSAP é ganho de performance grátis.

### 4.3 ScrollTrigger — 4 estágios
`enter` / `leave` / `back-leave` / `back-enter` mapeados para o uniform
`uProgress` do shader. Vira campo declarativo no schema.

### 4.4 SplitText + mask
Fatiar o texto em linhas → envolver cada uma em `div` com `overflow: clip` →
`translateY(100%)` → revelar com stagger. Alto impacto, custo baixo.

### 4.5 Lottie com lazy loading
Não embutir os 90KB no bundle. `IntersectionObserver` injeta o script só
quando o elemento entra na viewport. Impacto medido no material: PageSpeed
**65 → 99** no desktop.

### 4.6 Barba.js + GSAP Flip
Flip fotografa as coordenadas do elemento → Barba injeta o novo DOM → Flip
interpola a diferença. Transição de rota sem quebra de contexto visual.

### 4.7 Video scrubbing
`scroll_progress → video.currentTime`, desenhado no canvas via `rAF`.
Encode: `ffmpeg -crf 30 -preset veryfast`. Sempre com `poster` para o
pré-buffer não deixar a tela vazia.

### 4.8 Acessibilidade em duas camadas (obrigatório)
`<canvas>` é caixa preta para leitor de tela. O padrão correto:
- **z-index alto**: canvas WebGL, resposta puramente visual
- **z-index baixo**: HTML semântico com ARIA, `visually-hidden`

Sem isso o site gerado não indexa e não atende ADA/EAA.

### 4.9 Checklist dos 16ms
- Todo frame em ~16ms
- Testar com throttle de CPU 4x no DevTools
- **`dispose()` de geometrias, materiais e texturas ao sair da rota** — sem
  isso vaza memória de GPU até travar o celular do cliente

> "Se o movimento não esclarece a interação, delete-o."

---

## 5. Controle da IA (AI_Engineering_Blueprint)

> "O fim do vibecoding: da entropia ao controle matemático."

Prompt vago gera vetor distante do código ótimo → alucinação. O antídoto:

| Técnica | Aplicação aqui |
|---|---|
| **Restrições negativas** | Proibir explicações, comentários e introduções na saída do gerador |
| **Isolamento de tokens** | Retorno estrito de erro quando o contrato não é cumprido |
| **Few-shot como ancoragem** | Exemplos de schema válido forçam convergência |
| **Temperature → 0** | Saída determinística; obrigatório para gerar JSON de schema |
| **Duplo-cego** | Sessão A gera o código, Sessão B gera os testes a partir da mesma spec, sem ver o código de A — elimina viés de confirmação |
| **Mutation testing** | Trocar `or`→`and`, `>100`→`>101`; se o teste não morre, ele não cobre nada |

---

## 6. Orquestração (Kerneo)

> "Não é um chatbot. É um orquestrador que gerencia memória, ferramentas e
> decisões como um SO gerencia CPU e disco."

Cinco diferenciais aplicáveis: memória persistente, auto-aprendizado com
sandbox, personas com roteamento, pipeline com telemetria por estágio, e
self-healing quando a métrica cai abaixo do alvo.

---

## 7. Fila de trabalho

**Feito**
- [x] Indexador do Site Pack (104 componentes)
- [x] Retrieval por nicho com perfis de design
- [x] Validação anti-alucinação (componente, dependência, prop)
- [x] Alias `motion` → `framer-motion` no `vite.config.js`
- [x] Grupo 3D instalado — catálogo de 75 para **102 de 104** disponíveis
- [x] `llmRouter` com `temperature` configurável e falha honesta
- [x] Loop agêntico de auto-correção (`agenticGenerator.js`)

**Próximo**
- [ ] Renderer que monta React a partir do schema validado
- [ ] Ligar o gerador ao `SiteEditorView` e ao `AgenticChatbotBuilder`
- [ ] Unificar os loops de animação no `gsap.ticker`
- [ ] `dispose()` de recursos WebGL na troca de rota
- [ ] Camada semântica ARIA nos sites gerados
- [ ] Lottie com `IntersectionObserver`
- [ ] Mover as chaves de LLM do browser para o backend

**Antes de vender o plano Agência** — itens anunciados que ainda não existem:
deploy com link público, subdomínio, domínio próprio, Pixel/GTM, marca d'água.
