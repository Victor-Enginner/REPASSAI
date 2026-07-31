# Padrão Arquitetural: TypeScript (Frontend/Motor Web) + Python (Backend/IA)

> **Documento Estratégico de Arquitetura — REPASS AI**
> *Registrado no Banco de DOCS do Projeto*

---

## 1. Visão Geral e Fundamentação

A combinação de **TypeScript** no Frontend e **Python** no Backend representa o padrão-ouro no desenvolvimento de aplicações modernas impulsionadas por Inteligência Artificial (AI-Native Applications).

No **REPASS AI**, a divisão de responsabilidades é assim definida:

- **Frontend & Motor de Renderização Web (TypeScript / React)**: Responsável pela interface reativa, dashboard 3D, editor interativo de sites, renderização de componentes de UI (shadcn, MagicUI, ReactBits) e garantia de tipagem em tempo de compilação.
- **Backend, OSINT & RAG / IA (Python 3)**: Responsável pela varredura de dados em massa (Google Places, mineração OSINT), integração com LLMs, compilador de templates (`lib77_engine.py`, `hybrid_engine.py`), otimização de busca e orquestração agêntica.

---

## 2. Por Que Essa Combinação é Crucial para o Motor de Criação de Sites?

### A. Integração com Registries Modernos de UI (Shadcn, MagicUI, Aceternity)
A esmagadora maioria dos componentes UI modernos e de alta estética (como os minerados no `backend/miners/registry_miner.py`) é escrita nativamente em **TypeScript/TSX**. 
Adotar TypeScript no motor de geração garante:
- **Interfaces de Props estritamente tipadas**: A IA consegue validar as props aceitas por cada componente (`interface ButtonProps { variant: 'default' | 'outline', ... }`), evitando que o gerador monte componentes com propriedades inválidas.
- **Segurança ao mesclar código gerado**: Ao compilar e montar blocos de código via React, o compilador TypeScript valida se todas as importações e referências existem antes do site ir para produção.

### B. Contrato End-to-End entre Python e TypeScript (OpenAPI / JSON Schema)
O backend em Python fornece os endpoints de geração de sites (`/api/site/generate`, `/api/site/clone`).
Com contrato de tipos:
- O Python gera/expõe schemas JSON rigorosos dos modelos de site e leads.
- O TypeScript consome esses schemas no Frontend, permitindo **autocompletion** e detecção imediata no editor se um campo retornado pelo backend mudar ou for descontinuado.

### C. Eliminação de Erros de Runtime no Editor de Sites (`SiteEditorView`)
Erros comuns em JavaScript puro como `Cannot read properties of undefined` ou falhas de parse de JSON vindo de LLMs são eliminados em tempo de compilação via guardas de tipo (*Type Guards*) e validação via Zod / Pydantic.

---

## 3. Resumo Comparativo dos Papéis no REPASS AI

| Camada | Tecnologia | Função Principal no REPASS AI | Benefício Chave |
| :--- | :--- | :--- | :--- |
| **Frontend & UI Engine** | **TypeScript + React (Vite)** | Editor de Sites, Visualizador 3D, Dashboard de Leads e Renderizador de Componentes TSX. | Zero erros silenciosos na UI, autocompletion rigoroso e suporte nativo a componentes modernos. |
| **Backend & Core Agêntico** | **Python 3 (app_api, LLM Gateway)** | Scrapers OSINT, Integração com Google Places, Rotação de Keys de IA, Cloudflare R2 e Compilador de Templates. | Sintaxe limpa, velocidade de desenvolvimento em IA, manipulação robusta de strings e pipelines de scraping. |
| **Comunicação** | **REST + OpenAPI / JSON Schema** | Conecta a API Python aos hooks/serviços TypeScript do Frontend. | Contrato de dados seguro e sincronizado entre os dois lados. |

---

## 4. Plano de Ação para o Motor de Criação de Sites

1. **Migração Gradual do Frontend para TypeScript (`.tsx` / `.ts`)**:
   - Migrar os serviços de geração agêntica (`src/services/agenticGenerator.js` e `src/services/agenticPlanner.js`) para `.ts` com definições de tipos para os contratos dos sites gerados.
2. **Definição dos Tipos dos Moldes de Site (`TemplateSchema`)**:
   - Criar arquivo `src/types/siteTemplate.ts` representando a estrutura genômica de cada template (seções, paleta de cores, componentes React, dados do lead).
3. **Validação de Props na Compilação Agêntica**:
   - Usar TypeScript para validar a árvore de AST / sintaxe JSX gerada pelos agentes antes de salvar a visualização no Cloudflare R2 ou renderizar na tela.
