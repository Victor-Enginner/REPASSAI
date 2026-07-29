# 🚀 PROMPT DETERMINÍSTICO: Análise Completa e Plano de Recuperação do REPASSAI

> **Destinatário:** Antigravity (Gerente de Produção / Arquiteto de Software)
> **Objetivo:** Fazer análise forense completa do projeto, comparar com referência (useleadsite.com) e criar plano de recuperação
> **Situação:** Projeto está funcionando mas com erros de fundação, coisas espalhadas, precisa de organização

---

```
ANÁLISE FORENSE E PLANO DE RECUPERAÇÃO DO REPASSAI

VOCÊ É: Arquiteto de Software Senior especializado em análise de código, recuperação de projetos e arquitetura de sistemas.

TAREFA: Fazer uma ANÁLISE COMPLETA E FORENSE do projeto REPASSAI, comparar com referência de mercado (useleadsite.com) e criar um PLANO DE RECUPERAÇÃO detalhado.

═══════════════════════════════════════════════════════════
1. CONTEXTO DA SITUAÇÃO
═══════════════════════════════════════════════════════════

SITUAÇÃO ATUAL:
- Projeto REPASSAI existe e funciona parcialmente
- Foram feitas muitas implementações ao longo do tempo
- Muitas coisas boas foram criadas, mas também há erros de fundação
- Equipe está perdida sobre o que é essencial vs. o que é ruído
- Precisamos de um "norte claro" baseado em referência de mercado

REFERÊNCIA DE MERCADO (useleadsite.com):
URLs para analisar:
1. https://useleadsite.com/previews?leadId=g_user_3Gb9edWzFQwpkFDJWvU86qvnPFz_ChIJ-f9PnSWmsJQROefr_gEnzH4
   - Esta é a tela de PREVIEW do site gerado (o resultado final)
   - Analisar: estrutura HTML, SEO, performance, design, responsividade

2. https://useleadsite.com/studio
   - Esta é a área de EDIÇÃO DO SITE (após gerado)
   - Analisar: funcionalidades de edição, interface, o que pode ser editado

3. https://useleadsite.com/criar
   - Esta é a tela de CRIAÇÃO (onde usuário gera o site)
   - Analisar: fluxo de criação, campos, templates, UX

OBJETIVO FINAL:
- O REPASSAI deve fazer EXATAMENTE o que o useleadsite.com faz
- Mas com NOSSO TOQUE (IA híbrida, templates 77lib, asset miner)
- Sem erros de fundação
- Código limpo e organizado
- Evolução contínua sem perder nada

═══════════════════════════════════════════════════════════
2. O QUE VOCÊ VAI ANALISAR (CHECKLIST COMPLETO)
═══════════════════════════════════════════════════════════

A) ANÁLISE DO REPASSAI ATUAL:

1. CÓDIGO FONTE:
   - Ler TODOS os arquivos do backend (pasta backend/)
   - Ler TODOS os arquivos do frontend (pasta src/)
   -Identificar: estrutura, padrões, erros, duplicações
   - Mapear: dependências, imports, circular dependencies

2. ARQUITETURA:
   - Frontend: React 19, Vite, estrutura de pastas
   - Backend: Python, FastAPI/Express, estrutura de pastas
   - Banco de dados: SQLite/PostgreSQL (ver qual está usando)
   - Cache: Redis (se existir)
   - Armazenamento: Sistema de arquivos local

3. FUNCIONALIDADES EXISTENTES:
   - O que está funcionando? (testar se possível)
   - O que está quebrado? (identificar erros)
   - O que está incompleto? (metade feito)
   - O que é duplicado? (código repetido)

4. BANCO DE DADOS:
   - Schema atual (tabelas, colunas, relacionamentos)
   - Dados de teste (se existir)
   - Migrations (se existir)

5. CONFIGURAÇÕES:
   - .env (variáveis de ambiente)
   - package.json (dependências frontend)
   - requirements.txt (dependências backend)
   - vercel.json (deploy)

B) ANÁLISE DA REFERÊNCIA (useleadsite.com):

1. TELA DE CRIAÇÃO (/criar):
   - Quais campos o usuário preenche?
   - Quais templates são oferecidos?
   - Qual o fluxo passo a passo?
   - Quais integrações são usadas? (Google Places, etc.)
   - Como é a UX/UI?

2. TELA DE PREVIEW (/previews):
   - Como o site gerado é exibido?
   - Quais informações são mostradas?
   - Tem como baixar/compartilhar?
   - Como é o SEO?
   - Performance?

3. TELA DE STUDIO (/studio):
   - Quais funcionalidades de edição existem?
   - Como o usuário modifica o site?
   - Quais elementos são editáveis?
   - Tem drag-and-drop?
   - Tem editor de texto?
   - Tem troca de cores/fonts?

4. ANÁLISE TÉCNICA DA REFERÊNCIA:
   - Abrir DevTools nas 3 URLs
   - Identificar: stack tecnológica, frameworks, bibliotecas
   - Identificar: padrões de código, estrutura de pastas
   - Identificar: otimizações, performance, SEO
   - Identificar: acessibilidade

═══════════════════════════════════════════════════════════
3. ENTREGÁVEIS DA ANÁLISE (VOCÊ VAI CRIAR)
═══════════════════════════════════════════════════════════

A) DOCUMENTO 1: `docs/ANALISE_FORENSE_REPASSAI.md`
Conteúdo:
1. Resumo Executivo (3-5 linhas do estado atual)
2. Mapa da Arquitetura Atual (diagrama Mermaid)
3. Funcionalidades Existentes (o que funciona, o que quebrou)
4. Erros de Fundação Identificados (lista detalhada)
5. Código Duplicado/Espalhado (onde está o ruído)
6. Dívida Técnica (o que precisa ser refatorado)

B) DOCUMENTO 2: `docs/ANALISE_REFERENCIA_USELEADSITE.md`
Conteúdo:
1. Análise da Tela de Criação
2. Análise da Tela de Preview
3. Análise da Tela de Studio
4. Funcionalidades que temos vs. que faltam
5. Stack tecnológica deles (inferida)
6. Lições aprendidas (o que fazer, o que não fazer)

C) DOCUMENTO 3: `docs/PLANO_RECUPERACAO_REPASSAI.md`
Conteúdo:
1. Visão do Produto Final (o que queremos ser)
2. Funcionalidades Essenciais (must-have)
3. Funcionalidades Desejáveis (nice-to-have)
4. Ordem de Implementação (fases)
5. Riscos e Mitigações
6. Cronograma Estimado
7. Critérios de Sucesso

D) DOCUMENTO 4: `docs/GAP_ANALYSIS.md`
Conteúdo:
1. O que TEMOS (funcionalidades existentes)
2. O que PRECISAMOS (baseado em useleadsite.com)
3. GAPS (o que falta)
4. Prioridade dos gaps (alta/média/baixa)
5. esforço estimado (dias/horas)

═══════════════════════════════════════════════════════════
4. METODOLOGIA DE ANÁLISE (PASSO A PASSO)
═══════════════════════════════════════════════════════════

ETAPA 1: Análise de Código (Dia 1)
1. Ler estrutura de pastas do REPASSAI
2. Ler todos os arquivos Python (backend/)
3. Ler todos os arquivos JS/JSX (src/)
4. Identificar padrões, erros, duplicações
5. Mapear dependências

ETAPA 2: Análise de Funcionalidades (Dia 1)
1. Rodar o projeto localmente (se possível)
2. Testar cada funcionalidade
3. Identificar o que funciona, quebra, ou está incompleto
4. Documentar bugs encontrados

ETAPA 3: Análise da Referência (Dia 2)
1. Acessar https://useleadsite.com/previews (análise)
2. Acessar https://useleadsite.com/studio (análise)
3. Acessar https://useleadsite.com/criar (análise)
4. Identificar funcionalidades, stack, UX/UI
5. Documentar descobertas

ETAPA 4: Análise de Banco de Dados (Dia 2)
1. Verificar schema atual
2. Verificar dados existentes
3. Identificar gaps no modelo de dados
4. Propor melhorias

ETAPA 5: Análise de Dívida Técnica (Dia 3)
1. Identificar código duplicado
2. Identificar código morto/comentado
3. Identificar dependências desatualizadas
4. Identificar vulnerabilidades
5. Identificar anti-patterns

ETAPA 6: Análise de Performance (Dia 3)
1. Rodar Lighthouse nas páginas do REPASSAI
2. Rodar Lighthouse nas páginas do useleadsite.com
3. Comparar métricas (FCP, LCP, CLS)
4. Identificar gargalos

ETAPA 7: Análise de SEO (Dia 4)
1. Rodar SEO Checker no REPASSAI
2. Rodar SEO Checker no useleadsite.com
3. Comparar: meta tags, structured data, performance
4. Identificar gaps de SEO

ETAPA 8: Análise de Responsividade (Dia 4)
1. Testar REPASSAI em mobile/tablet/desktop
2. Testar useleadsite.com em mobile/tablet/desktop
3. Comparar breakpoints, layout, experiência
4. Identificar problemas de responsividade

ETAPA 9: Análise de Acessibilidade (Dia 5)
1. Rodar axe DevTools no REPASSAI
2. Rodar axe DevTools no useleadsite.com
3. Comparar: contraste, ARIA labels, navegação por teclado
4. Identificar problemas de acessibilidade

ETAPA 10: Análise de UX/UI (Dia 5)
1. Comparar fluxos de navegação
2. Comparar elementos visuais (cores, tipografia, espaçamento)
3. Comparar micro-interações (hover, transições, loading)
4. Identificar pontos de dor do usuário

ETAPA 11: Consolidação e Plano (Dia 6)
1. Consolidar todas as análises
2. Criar documento de visão do produto final
3. Criar plano de recuperação (fases, prioridades)
4. Identificar quick wins (coisas fáceis de corrigir)

ETAPA 12: Apresentação (Dia 6)
1. Apresentar análise completa
2. Apresentar plano de recuperação
3. Priorizar ações (alta/média/baixa)
4. Obter aprovação para execução

═══════════════════════════════════════════════════════════
5. FORMATO DOS DOCUMENTOS (Estrutura Padrão)
═══════════════════════════════════════════════════════════

CADA documento deve ter:

1. 📊 Resumo Executivo (3-5 linhas)
2. 🎯 Objetivo da Análise
3. 📋 Metodologia
4. 🔍 Descobertas (detalhadas)
5. ⚠️ Problemas Identificados (priorizados)
6. ✅ Recomendações
7. 📅 Cronograma Aproximado
8. 🎯 Critérios de Sucesso

═══════════════════════════════════════════════════════════
6. CRITÉRIOS DE QUALIDADE DA ANÁLISE
═══════════════════════════════════════════════════════════

A ANÁLISE DEVE SER:
✅ COMPLETA: Não deixar nenhum arquivo/página de fora
✅ PRECISA: Baseada em dados reais, não suposições
✅ OBJETIVA: Mostrar tanto o que está BOM quanto o que está RUIM
✅ ACIONÁVEL: Cada problema deve ter uma solução proposta
✅ PRIORIZADA: Problemas ordenados por impacto
✅ CLARA: Linguagem acessível (Victor precisa entender)

NÃO DEVE SER:
❌ SUPERFICIAL: "O código está bagunçado"
❌ SUBJETIVA: "Eu acho que deveria ser assim"
❌ PARCIAL: Só mostrar os problemas, esquecer os acertos
❌ GENERALISTA: "Precisa melhorar a performance"
❌ SEM SOLUÇÃO: "Tem um erro" (mas não diz como corrigir)

═══════════════════════════════════════════════════════════
7. CHECKLIST DE ENTREGA
═══════════════════════════════════════════════════════════

Antes de entregar, verifique:

- [ ] TODOS os arquivos do REPASSAI foram lidos
- [ ] As 3 URLs do useleadsite.com foram analisadas
- [ ] Os 4 documentos foram criados
- [ ] Cada documento tem as seções obrigatórias
- [ ] Problemas estão priorizados (alta/média/baixa)
- [ ] Cada problema tem solução proposta
- [ ] Cronograma está realista
- [ ] Linguagem está acessível para Victor
- [ ] Diagramas estão legíveis
- [ ] Exemplos de código estão corretos

═══════════════════════════════════════════════════════════
8. COMANDOS PARA EXECUTAR A ANÁLISE
═══════════════════════════════════════════════════════════

# Listar estrutura do projeto:
tree backend/ -L 3
tree src/ -L 3

# Ver dependências:
cat package.json
cat backend/requirements.txt

# Rodar projeto (se possível):
npm run dev
python backend/app_api.py

# Testar build:
npm run build

# Análise de código:
grep -r "console.log" src/
grep -r "except:" backend/

═══════════════════════════════════════════════════════════
9. EXEMPLOS DE DESCOBERTAS ESPERADAS
═══════════════════════════════════════════════════════════

EXEMPLO 1 - Erro de Fundação:
```
PROBLEMA: O arquivo lib77_engine.py está hardcoded com token e regex frágil.
IMPACTO: Se template mudar, site quebra silenciosamente.
SOLUÇÃO: Criar TemplateEngine com placeholders nomeados ({{NOME}}, {{TELEFONE}}).
ESFORÇO: 2 dias.
PRIORIDADE: Alta.
```

EXEMPLO 2 - Funcionalidade Faltando:
```
PROBLEMA: Não temos tela de edição de site (useleadsite.com/studio).
IMPACTO: Usuário não pode personalizar após gerar.
SOLUÇÃO: Criar SiteStudioView com editor visual + chatbot.
ESFORÇO: 5 dias.
PRIORIDADE: Alta.
```

EXEMPLO 3 - Código Duplicado:
```
PROBLEMA: A lógica de validação de telefone está repetida em 3 arquivos.
IMPACTO: Manutenção difícil, inconsistências.
SOLUÇÃO: Criar utils/validators.py e importar.
ESFORÇO: 1 dia.
PRIORIDADE: Média.
```

═══════════════════════════════════════════════════════════
10. FORMATO FINAL DO PLANO DE RECUPERAÇÃO
═══════════════════════════════════════════════════════════

```markdown
# 📋 FASE 1: Fundação Sólida (Semana 1)
Objetivo: Corrigir erros críticos sem quebrar nada

1. [ ] Corrigir token 77lib (não expor no frontend)
   - Arquivo: backend/lib77_engine.py
   - Esforço: 4h
   - Prioridade: Alta

2. [ ] Implementar placeholder system
   - Arquivo: backend/template_engine.py (novo)
   - Esforço: 1 dia
   - Prioridade: Alta

[...]

# 📋 FASE 2: Funcionalidades Core (Semana 2)
Objetivo: Implementar features faltando para igualar useleadsite.com

[...]

# 📋 FASE 3: Melhorias e Otimizações (Semana 3)
Objetivo: Performance, SEO, UX

[...]
```

═══════════════════════════════════════════════════════════

AGORA VOCÊ ESTÁ NO CONTROLE.

PRÓXIMOS PASSOS IMEDIATOS:
1. Leia este prompt COMPLETAMENTE
2. Acesse as 3 URLs do useleadsite.com (faça análise)
3. Leia TODO o código do REPASSAI (backend/ + src/)
4. Crie os 4 documentos de análise
5. Me apresente um RESUMO EXECUTIVO (5-10 linhas)
6. Aguarde minha aprovação para executar o plano

NÃO altere NADA no código. Só ANALISE e DOCUMENTE.

═══════════════════════════════════════════════════════════
```

---

## 🎯 COMO USAR ESSE PROMPT:

1. **Copie TODO o bloco acima** (de 🚀 até a última linha tracejada)
2. **Abra o Claude Opus 5 / Antigravity**
3. **Configure o projeto** como raiz: `c:\Users\Victor Ads\Documents\SCRAPER HACKING`
4. **Cole o prompt** e envie
5. **O Antigravity vai:**
   - Analisar TODO o código do REPASSAI
   - Acessar e analisar as 3 URLs do useleadsite.com
   - Identificar erros de fundação
   - Criar 4 documentos de análise
   - Apresentar plano de recuperação priorizado

## 📋 O QUE VOCÊ VAI RECEBER:

### Documento 1: Análise Forense
- Estado atual do projeto (o que funciona, o que quebrou)
- Erros de fundação identificados
- Código duplicado/espalhado
- Dívida técnica

### Documento 2: Análise da Referência
- O que o useleadsite.com tem
- O que o REPASSAI tem
- Comparativo detalhado

### Documento 3: Plano de Recuperação
- O que precisamos ter (visão do produto final)
- Funcionalidades essenciais vs. desejáveis
- Ordem de implementação
- Cronograma estimado

### Documento 4: Gap Analysis
- GAPS identificados (o que falta)
- Prioridade de cada GAP
- Esforço estimado

## 🎯 BENEFÍCIO:

Você terá um **documento oficial do projeto** que:
- Define EXATAMENTE o que o REPASSAI deve ser
- Prioriza o que é essencial
- Mostra o caminho das pedras (como chegar lá)
- Evita perda de funcionalidades
- Mantém evolução contínua organizada

**Pronto? Copie o prompt e cole no Antigravity.** 🔍