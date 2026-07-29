# Prompt determinístico — Identidade visual real do REPASS AI

> Cole no agente de IA da sua IDE. Ele transforma o painel da identidade
> atual (escura, índigo, estética hacker) para a identidade real da marca
> (clara, iridescente, premium).
>
> Preparado em 27/07/2026, depois da migração de 473 cores para tokens.

---

## Por que isso é barato agora

O painel usava **870 cores hex escritas à mão**. Hoje usa **40 tokens** em
`src/index.css`, com um lint que reprova quem voltar a escrever cor solta.

Trocar a identidade virou redefinir o `:root`. Os componentes não mudam.

---

## O prompt

```
Vou trocar a identidade visual do painel REPASS AI. Leia primeiro:

  src/index.css              os 40 tokens que controlam toda a interface
  scripts/verificar-tokens.mjs  o lint que impede cor solta
  docs/ARQUITETURA.md        contexto do produto

IDENTIDADE ATUAL (o que sai)
  fundo quase preto #050711, cartões #111726, acento índigo #6366f1
  fontes Inter Tight e JetBrains Mono
  estética de terminal, escura, densa

IDENTIDADE NOVA (o que entra)
  Referência: https://repassaiapp.netlify.app e o material de marca.

  Base clara e arejada. Cinza-branco frio de fundo, quase branco nos
  cartões, preto para texto. Nada de cinza puro: o neutro puxa levemente
  para o azul, para conversar com o acento.

  Acento iridescente. Gradiente que percorre azul → violeta → âmbar →
  ciano, como reflexo em vidro ou bolha de sabão. Usado com CONTENÇÃO:
  em bordas, realces, estados ativos e uma peça grande por tela. Nunca
  como fundo de bloco de texto.

  Tipografia com duas vozes:
    - títulos: sans geométrica de peso alto, tracking apertado
    - rótulos e dados: caixa alta, tracking largo, tamanho pequeno
      (o "SISTEMA OPERACIONAL DE IA" do material de marca)
    - números e tabelas: tabular-nums, sempre

  Superfícies: cantos suaves, sombra quase imperceptível, hairline de
  1px. A profundidade vem da luz, não de borda grossa.

REGRAS QUE NÃO PODEM SER QUEBRADAS

1. NÃO edite cor em componente. Só em src/index.css, no :root.
   Se precisar de uma cor nova, crie um token com nome SEMÂNTICO
   (--superficie-elevada), não descritivo (--cinza-claro).

2. `npm run lint` tem que passar. Ele reprova cor hex escrita à mão.

3. Contraste: texto normal >= 4.5:1, texto grande >= 3:1. Fundo claro
   com texto cinza-claro é o erro mais comum nessa direção estética.
   Meça, não estime.

4. NÃO toque nos componentes WebGL (src/components/ui/). Eles recebem
   cor como PROP, não como CSS — var(--token) não funciona em shader.
   Se a cor deles destoar da identidade nova, mude o valor passado na
   prop, não o componente.

5. NÃO toque em src/services/. Aqueles hex geram o HTML do site do
   cliente, que não carrega o nosso CSS.

6. O painel é FERRAMENTA DE TRABALHO, não peça de marketing. O operador
   passa horas nele lendo tabela de leads. Se a estética clara e
   iridescente prejudicar a leitura de dado denso, a leitura ganha.
   Aplique a identidade com força total na Landing e no Login; com
   contenção nas telas operacionais (Leads, CRM, Editor).

ORDEM DE EXECUÇÃO — uma etapa por vez, verificando na tela entre elas

  Etapa 1  Redefinir os 40 tokens no :root, claros e escuros.
           Rodar npm run lint e npm run build.
           ABRIR O PAINEL NO NAVEGADOR e me mostrar um print.
           Não siga sem eu aprovar.

  Etapa 2  Login e Landing — identidade em força total.
           Gradiente iridescente, tipografia grande, respiro.

  Etapa 3  Telas operacionais — Leads, CRM, Dashboard.
           Identidade contida. Dado legível acima de tudo.

  Etapa 4  Componentes WebGL — ajustar as props de cor.

  Etapa 5  Conferir contraste em todas as telas e corrigir o que falhar.

COMO TRABALHAR COMIGO

Eu não sou desenvolvedor. Explique em português claro. Meça antes de
afirmar: rode o comando, não estime. Abra a página no navegador antes de
dizer que está pronto — a única forma de julgar aparência é olhando.
Diga sempre o que você NÃO conferiu.

Comece pela Etapa 1. Antes de mudar qualquer coisa, me mostre a lista dos
40 tokens atuais e o valor novo que você propõe para cada um, para eu
aprovar.
```

---

## O que eu faria diferente do que o prompt pede

Duas ressalvas honestas, para você decidir:

**A identidade clara pode atrapalhar o painel.** O material de marca é lindo
para venda — fundo claro, gradiente iridescente, muito respiro. Mas o operador
passa horas lendo tabela de lead. Fundo claro com texto fino cansa mais numa
sessão longa, e o gradiente compete com o dado.

O caminho que costuma funcionar: **identidade em força total nas telas de
venda** (Landing, Login, Loja de Templates) e **contida nas telas de trabalho**
(Leads, CRM, Editor) — mesma paleta, mesma tipografia, mas o iridescente vira
detalhe em vez de protagonista. O prompt já pede isso na regra 6.

**Sobre registrar a marca.** Identidade visual consistente ajuda, mas o que
registra marca é o nome e o logotipo, no INPI — não o CSS do painel. Vale
tratar como duas frentes separadas: o registro anda em paralelo, sem depender
desta refatoração.

---

## O que já está pronto para a transformação

| | |
|---|---|
| Tokens | 40 em `src/index.css`, cobrindo fundo, texto, acento e estado |
| Cores soltas | 0 nos 24 arquivos de interface |
| Trava | `npm run lint` reprova regressão |
| Arquivos isentos | WebGL e `services/` já mapeados e documentados |

O `scripts/migrar-cores-para-tokens.mjs` também continua no repositório. Se
aparecer cor solta durante a refatoração, ele resolve em lote.
