# 🤝 Guia: Como Pedir Coisas para IA (Sem Saber Programar)

> **Para:** Victor (Product Owner / Visão de Negócio)
> **Objetivo:** Formular pedidos claros que eu (IA) consiga executar sem ambiguidades.

---

## 🔑 Princípio Fundamental

**Seja como um cliente descrevendo o que quer para um desenvolvedor sênior:**

- ❌ **Ruim:** "Faz um site"
- ✅ **Bom:** "Quero uma tela onde o usuário pode colar um link do Google Maps e clicar em 'Gerar Site'"

---

## 📋 Template Universal (Copie e Preencha)

```
O que eu quero: [descreva em 1 frase o que o usuário final vai ver/fazer]
Por que: [qual problema resolve ou valor entrega]
Para quem: [público-alvo: dono de negócio local? E-commerce? Cliente final?]
Exemplo prático: [cite 1 exemplo similar se existir]
Critérios de aceite: [como sei que foi feito certo? Ex: "aparece botão azul", "não quebra a página"]
Prioridade: [Alta = precisa hoje | Média = precisa essa semana | Baixa = nice to have]
```

---

## 🎯 Exemplos Aplicados ao REPASSAI

### Exemplo 1: Funcionalidade Nova

**❌ Pedido ruim:**
"Quero que salve o lead no banco"

**✅ Pedido bom:**
```
O que eu quero: Quando o usuário clicar em "Gerar Site", salvar os dados do
negócio (nome, telefone, endereço) em um banco de dados para eu consultar depois.
Por que: Para saber quantos leads geramos e quem são os clientes.
Para quem: Para você (IA) e para mim (Victor) acessarmos os dados.
Exemplo prático: Como um Excel, mas automático no banco de dados.
Critérios de aceite:
  - Aparece uma mensagem "Salvo com sucesso" após clicar em Gerar
  - Eu consigo ver os leads salvos em uma lista
Prioridade: Alta
```

---

### Exemplo 2: Alteração de Design

**❌ Pedido ruim:**
"Fica mais bonito"

**✅ Pedido bom:**
```
O que eu quero: Mudar o botão "Gerar" da cor azul para verde.
Por que: Azul lembra Google, verde passa mais confiança para o cliente final.
Para quem: Cliente final (donos de negócio) que vai usar o REPASSAI.
Exemplo prático: Cor verde #10b981, igual ao Vercel.
Critérios de aceite:
  - Botão verde em toda a tela
  - Continua funcionando igual (só mudou a cor)
Prioridade: Média
```

---

### Exemplo 3: Bug Report

**❌ Pedido ruim:**
"Ta quebrando"

**✅ Pedido bom:**
```
O que eu quero: Corrigir o erro que aparece quando colo um link do Google.
Por que: O cliente não consegue usar a ferramenta.
Para quem: Cliente final tentando gerar um site.
Exemplo prático: Quando clico em "Gerar", aparece "Erro 500" e a página fica em branco.
Critérios de aceite:
  - Após colar o link e clicar em "Gerar", aparece o site pronto (não erro 500)
  - Se o link for inválido, aparece mensagem amigável "Link inválido"
Prioridade: Alta (URGENTE)
```

---

## 🚀 Atalhos Rápidos (Copy-Paste Ready)

### "Quero X" (Nova funcionalidade)
```
O que eu quero: [X]
Por que: [motivo de negócio]
Para quem: [público-alvo]
Exemplo prático: [referência]
Critérios de aceite:
  1. [como verificar que funcionou]
  2. [outro critério]
Prioridade: [Alta/Média/Baixa]
```

### "Mude X para Y" (Alteração)
```
O que eu quero: Mudar [X atual] para [Y desejado]
Motivo: [por que essa mudança?]
Local: [em qual tela/botão/página?]
Critérios de aceite:
  1. [o que deve aparecer diferente]
Prioridade: [Alta/Média/Baixa]
```

### "Ta quebrando X" (Bug)
```
O que eu quero: Corrigir o erro em [X]
Quando acontece: [passo a passo para reproduzir: "1. Abro a página, 2. Clico em Y, 3. Aparece erro Z"]
O que deveria acontecer: [comportamento esperado]
Critérios de aceite:
  1. [como deve funcionar agora]
Prioridade: [Alta se trava o cliente, Média se é inconveniente]
```

---

## 🎓 Regras de Ouro

1. **Sempre explique o "Por quê"**: IA trabalha melhor quando entende o objetivo de negócio, não só a implementação técnica.

2. **Dê exemplos concretos**: "Quero igual ao Instagram" é melhor que "Quero moderno".

3. **Separe funcionalidades**: Não peça 10 coisas de uma vez. Faça um pedido, teste, depois peça o próximo.

4. **Priorize**: Se não souber priorizar, eu ajudo, mas você deve dizer o que é mais importante para o cliente final.

5. **Teste como cliente**: Após eu implementar, teste exatamente como um usuário real usaria. Se algo não faz sentido, me diga **o que esperava vs o que aconteceu**.

---

## 💡 Dicas Práticas Para Você

### 1. Use Analogias do Mundo Real
- ❌ "Quero um modal"
- ✅ "Quero uma janela popup que aparece quando clico em 'Contato'"

### 2. Descreva a Jornada do Usuário
> "O usuário chega na página → vê um campo de busca → digita 'pizza' → clica em buscar → vê uma lista de pizzarias → clica em uma → vê o site gerado"

### 3. Seja Específico Com Números e Cores
- ❌ "Fica menor"
- ✅ "Diminui a fonte do título de 32px para 24px"

### 4. Contextualize
Sempre que possível, informe:
- **Prazo:** "Preciso disso até amanhã para mostrar ao cliente"
- **Urgência:** "Isso está perdendo vendas" vs "Isso seria legal ter"
- **Restrições:** "Não pode usar ferramentas pagas" ou "Tem que funcionar no celular"

---

## 🔥 Exemplo Real: Pedido ao MEU (Engenheiro)

**Errado:**
> "arruma o site"

**Certo:**
```
Victor (PO): Preciso que você adicione um campo de telefone no formulário
de geração de site.

Por que: Os clientes querem receber o link do site por WhatsApp também,
não só por e-mail.

Para quem: Donos de negócios usando o REPASSAI.

Critérios de aceite:
  1. Aparece um campo "Telefone" antes de clicar em "Gerar"
  2. O telefone aparece no e-mail que enviamos para o cliente
  3. Se o telefone for inválido, aparece erro em vermelho

Prioridade: Alta — 3 clientes já perguntaram isso essa semana.
```

---

## 🎯 Exemplo 5: Pedido de ANÁLISE COMPLETA de um Processo (O QUE VOCÊ PRECISA AGORA)

**Contexto:** Você quer que eu (IA) analise TODO o processo de geração de site na aba "Criar Sites" para entender como funciona e identificar melhorias.

**❌ Pedido ruim:**
"Analisa o processo de gerar site"

**✅ Pedido bom:**
```
O que eu quero: Quero que VOCÊ (IA) analise TODO o processo passo a passo
de como é gerado o site na aba "Criar Sites" do REPASSAI.
Por que: Eu não entendo de tecnologia e preciso entender TODO o fluxo:
  - O que acontece quando o usuário clica em "Gerar"?
  - Quais etapas existem?
  - Onde podem estar os erros ou lentidão?
  - Quais tecnologias são usadas em cada etapa?
  - Quanto tempo demora cada parte?
  - O que acontece se der erro em alguma etapa?
Para quem: Para MIM (Victor, Product Owner) entender o sistema e
para VOCÊ (Engenheiro) poder me explicar em linguagem simples.
Exemplo prático: Quero um documento/diagrama mostrando a jornada
completa do usuário, igual a um fluxograma de like "passo 1 → passo 2 → passo 3".
Critérios de aceite (MUITO IMPORTANTE):
  1. Você vai LER o código-fonte da aba "Criar Sites" (todo o processo)
  2. Você vai me entregar um DOCUMENTO com:
     - Mapa visual do fluxo (passo a passo)
     - O que acontece em CADA etapa (em linguagem SIMPLES)
     - Quais arquivos/tecnologias são usados (ex: "Python scraper",
       "LLM gera HTML", "Supabase salva dados")
     - Possíveis gargalos/pontos de falha (onde pode dar erro)
     - Possíveis melhorias que você identifica
  3. Você vai usar analogias do mundo real (ex: "é igual um restaurante:
     usuário faz o pedido → cozinheiro prepara → garçom entrega")
  4. Você vai me dizer a VERDADE: o que está bom, o que está ruins,
     e onde estão os riscos.
Prioridade: ALTA — Isso é pré-requisito para eu saber o que melhorar.
```

---

## 🎯 Exemplo 4: Pedido sobre a Tela Inicial do REPASSAI

**Contexto:** A tela inicial atual tem 3 abas: "Descrever", "Link do Google" e "Lead existente".

**❌ Pedido ruim:**
"Muda a tela inicial"

**✅ Pedido bom:**
```
O que eu quero: Quando o usuário clicar na aba "Link do Google",
mostrar um campo maior (mais largo) para colar o link.
Por que: O campo atual é muito pequeno, o usuário tem dificuldade
de ver se colou o link completo. Isso está gerando suporte desnecessário.
Para quem: Cliente final colando links do Google Maps para gerar sites.
Exemplo prático: Igual o campo de busca do Google - largo e centralizado.
Critérios de aceite:
  1. Campo de input aparece com width de 100% (não 50% como está agora)
  2. Continua funcionando igual (só mudou o tamanho)
  3. Em celular, o campo também fica largo
Prioridade: Alta — 5 clientes reclamaram essa semana.
```

---

## ✅ Checklist Rápido Antes de Pedir

- [ ] Explique o que o usuário final vai ver/fazer
- [ ] Disse por que isso importa (valor de negócio)
- [ ] Deu pelo menos 1 exemplo concreto
- [ ] Definiu como saber se funcionou (critérios de aceite)
- [ ] Determinou a prioridade

---

## 🆘 Se Travar (Exemplos Práticos do REPASSAI)

### Exemplo A: "Quero adicionar algo novo"
```
O que eu quero: Adicionar um botão "WhatsApp" no canto superior direito da tela.
Por que: Clientes querem falar comigo antes de gerar o site.
Para quem: Dono de negócio na dúvida se usar a ferramenta.
Exemplo prático: Botão redondo verde com ícone do WhatsApp.
Critérios de aceite:
  1. Botão aparece no topo da página
  2. Clica e abre o WhatsApp com meu número
  3. Aparece em verde
Prioridade: Alta
```

### Exemplo B: "Quero mudar um texto"
```
O que eu quero: Mudar o título da página de "Site pra negócio fora da busca"
para "Crie Seu Site em 2 Minutos"
Por que: O título atual é muito técnico, clientes não entendem o benefício.
Para quem: Cliente final que chega na página.
Critérios de aceite:
  1. Título novo aparece centralizado no topo
  2. Subtítulo continua igual (não mudei mais nada)
Prioridade: Média
```

### Exemplo C: "Quero esconder algo"
```
O que eu quero: Remover a aba "Lead existente" da tela inicial.
Por que: 90% dos usuários usam "Descrever" ou "Link do Google",
a terceira aba confunde e não é necessária agora.
Para quem: Cliente final na primeira visita.
Critérios de aceite:
  1. Aparecem só 2 abas: "Descrever" e "Link do Google"
  2. Funcionalidade "Lead existente" continua funcionando (só escondi da tela inicial)
Prioridade: Baixa
```

---

## 🆘 Se Travar

Se não sabe explicar algo:
1. **Desenhe no papel** e descreva: "É uma tela com 3 botões: um azul no topo, dois embaixo..."
2. **Cite referências**: "Igual o site da Nubank quando..."
3. **Use analogias**: "Funciona como o WhatsApp Status, mas para sites de negócios"

---

## 🧐 Template: Pedido de ANÁLISE/AUDITORIA de Processo

Use esse template quando você NÃO SABE como algo funciona e quer que
o engenheiro IA analise e documente TODO o processo para você.

```
O que eu quero: QUE VOCÊ (IA) ANALISE COMPLETAMENTE [processo/funcionalidade]
localizado em [local: tela, botão, aba do REPASSAI].
Por que: Eu não entendo o que acontece internamente e preciso:
  - Entender o passo a passo do fluxo
  - Saber quais tecnologias/arquivos são usados
  - Identificar onde podem estar os erros
  - Saber quanto tempo demora cada etapa
  - Identificar melhorias possíveis
Para quem: Para MIM (Victor) entender o sistema e para VOCÊ (Engenheiro)
ter um documento de referência para implementações futuras.
Exemplo prático: [cite onde está e o que o usuário final vê]
O que eu espero que você me entregue:
  1. MAPA DO FLUXO (passo a passo, tipo fluxograma)
  2. DOCUMENTO SIMPLIFICADO explicando cada etapa (SEM JARGÃO técnico)
  3. LISTA DE ARQUIVOS/TECNOLOGIAS usados (qual linguagem, banco, API, etc.)
  4. IDENTIFICAÇÃO DE RISCOS (onde pode quebrar, onde está lento)
  5. SUGESTÕES DE MELHORIA (se você ver algo que pode ser melhorado)
  6. ANALOGIAS DO MUNDO REAL para eu entender (ex: "é igual uma linha de montagem")
Critérios de aceite:
  - Documento entregue em .md (Markdown)
  - Linguagem SIMPLES (eu preciso entender sem saber programar)
  - Verdadeiro: você vai apontar o que está BOM e o que está RUIM
  - Completo: análise de TODO o fluxo, não só partes
Prioridade: [Alta/Média/Baixa]
```

---

**EXEMPLO PRÁTICO APLICADO AO REPASSAI:**

```
O que eu quero: QUE VOCÊ (IA) ANALISE COMPLETAMENTE TODO O PROCESSO
de geração de site na aba "Criar Sites" do REPASSAI.
Por que: Eu não sei o que acontece quando o usuário clica em "Gerar".
Preciso entender todo o fluxo para:
  - Identificar onde estão os erros
  - Saber onde podemos melhorar
  - Entender a velocidade de cada etapa
  - Saber quais tecnologias usamos
Para quem: Para MIM (Victor) e para VOCÊ (Engenheiro).
Exemplo prático: Na tela que tirei print, quando o usuário clica em "Gerar",
eu não faço ideia do que acontece internamente.
O que eu espero que você me entregue:
  1. MAPA DO FLUXO (visual) do passo a passo completo
  2. DOCUMENTO SIMPLIFICADO explicando cada etapa
  3. LISTA DE ARQUIVOS/TECNOLOGIAS usados
  4. IDENTIFICAÇÃO DE RISCOS (onde pode quebrar, onde está lento)
  5. SUGESTÕES DE MELHORIA
  6. ANALOGIAS DO MUNDO REAL
Critérios de aceite:
  - Documento entregue em .md no formato pedido
  - Linguagem SIMPLES
  - Verdadeiro: aponta pontos ruins também
  - Completo: todo o fluxo analisado
Prioridade: ALTA
```

---

## 📊 Templates Prontos para o REPASSAI

### Template 1: Nova Funcionalidade
```
O que eu quero: Adicionar [funcionalidade] em [tela]
Por que: [valor para o cliente final ou para nós]
Para quem: [público-alvo]
Exemplo prático: [referência visual ou site similar]
Critérios de aceite:
  1. [o que deve aparecer]
  2. [comportamento esperado]
Prioridade: [Alta/Média/Baixa]
```

### Template 2: Mudança de Design
```
O que eu quero: Mudar [elemento visual] de [estado atual] para [estado desejado]
Motivo: [razão: design, conversão, clareza]
Local: [tela e posição]
Exemplo prático: [cor, tamanho, posição]
Critérios de aceite:
  1. [como deve ficar]
Prioridade: [Alta/Média/Baixa]
```

### Template 3: Bug
```
O que eu quero: Consertar o erro em [tela/funcionalidade]
Quando acontece: [passo a passo exato]
Esperado: [o que deveria acontecer]
Ocorrido: [o que está acontecendo]
Prioridade: [Alta URGENTE / Média / Baixa]
```

---

## 🎯 Lembre-se

> **Você não precisa saber programar. Você precisa saber O QUE quer e POR QUE quer.**

Eu cuido do COMO fazer. Você cuida do O QUE e do PORQUÊ.

Juntos = REPASSAI funcionando. 🚀