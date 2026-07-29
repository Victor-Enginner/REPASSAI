> **HISTÓRICO — não é referência.**
> CONTEM ERRO: diz React 19 (e 18.2) e trata modal_engine como parte da arquitetura, quando ele tem zero referencias no codigo.
> A referência atual está em [../ARQUITETURA.md](../ARQUITETURA.md) e
> [../ROADMAP.md](../ROADMAP.md). Índice em [../README.md](../README.md).

# 🚀 REPASS AI — DASHBOARD ROADMAP DE ENGENHARIA & TODO LIST

> **Plataforma**: REPASS AI — B2B Commercial Intelligence & AI Landing Page Generator  
> **Padrão de Qualidade**: Estilo Replit Agent / Lovable.ai Architectural System  
> **Última Atualização**: 2026-07-25  
> **Status Geral**: 🟢 **9 / 10 FASES CONCLUÍDAS COM SUCESSO (SISTEMA TOTALMENTE OPERACIONAL)**

---

## 📋 FASE 1: Arquitetura Core & Banco de Dados NoSQL Declarativo

- [x] **Arquitetura Vite + React 19 + Vanilla CSS Tokens**
- [x] **Gerenciador de Banco de Documentos NoSQL (`src/mock/documentDB.js`)**: Armazenamento declarativo de páginas sem erros de JSX.
- [x] **Estrutura de Histórico de Versões de Sites**: Capacidade de salvar e recuperar versões anteriores de landing pages.
- [x] **Persistência de Dados**: Salvamento em arquivo JSON local e sincronização de sessão.

---

## 🔍 FASE 2: Motor OSINT de Varredura & Backend Python REST API

- [x] **Servidor REST API em Python (`backend/app_api.py`)**: Endpoints `/api/health`, `/api/leads/scan`, `/api/site/generate`, `/api/site/clone`.
- [x] **Motor OSINT de Varredura (`backend/scraper_monster.py`)**: Algoritmo de cruzamento de coordenadas, filtro de ausência de site e scoring de oportunidade (0 a 100).
- [x] **Seletor de Nichos por Menu Dropdown & Chips Interativos (`LeadsView.jsx`)**: Menu de seleção identico ao seletor de Estado e Cidade com atalhos em chips.
- [x] **Modal de Auditoria OSINT Aprofundada**: Raio-X com status de domínio, score de oportunidade e diagnóstico estratégico do lead.

---

## 🧠 FASE 3: Roteador Multi-Provedor LLM & Gateway Seguro

- [x] **Roteador LLM Multi-Provedor com fallback no backend (`backend/llm_gateway.py`)**: Chaveamento transparente entre os provedores configurados sem expor chaves ou modelos ao navegador.
- [x] **Cliente neural seguro (`src/services/llmRouter.js`)**: Toda inferência do frontend passa por `/api/ai/generate`; o gateway externo direto e sua chave em `localStorage` foram removidos.
- [x] **Console de Diagnóstico de Motores de IA (`AIEngineView.jsx`)**: Visualização em tempo real de latência, cota e consumo de tokens por provedor.

---

## 🎨 FASE 4: Design System Architectural Type System & 106 Primitivos

- [x] **Design Tokens Architectural Swiss-Brutalist (`src/index.css`)**:
  - Hairlines de `0.5px solid rgba(255,255,255,0.12)`
  - Paleta Monocromática (#000000 abissal, #ffffff destaque, #6366f1 indigo)
  - Tipografia: *Inter Tight* (Títulos 900), *JetBrains Mono* (Metadados), *Inter* (Corpo).
- [x] **Indexador Central de 106 Componentes Primitivos (`src/services/componentRegistry.js`)**:
  - 46 Fundos Animados 60fps (`Backgrounds Animations/`)
  - 60 Componentes Visuais Neomórficos (`Components Animations/`)
- [x] **Componente OriginKit Character Waves / ASCII Noise (`src/components/ui/ASCIIWaves.jsx`)**: Efeito interativo de ondas ASCII com reação ao cursor integrado na Hero Matrix 2x2.

---

## 🤖 FASE 5: Chatbot Agêntico Builder & Systemista Glitch Engine

- [x] **Painel de Chat Agêntico Interativo (`src/components/AgenticChatbotBuilder.jsx`)**: Interface de conversa estilo Lovable para envio de prompts e comandos.
- [x] **Motor de Extração de Variáveis Systemista**: Leitura de `BRAND_NAME`, `HERO_H1_LINES`, `STATS`, `SERVICES`, `STEPS`, `CTA_COPY`.
- [x] **Preview Split-Screen com Compilação em Tempo Real (`SiteEditorView.jsx`)**: Edição e pré-visualização ao vivo sem recarregar a tela.
- [x] **Gerador de Roteiro Comercial por IA**: Modal para geração de scripts persuasivos de abordagem no CRM.

---

## 🔗 FASE 6: Open Lovable Site Cloner Engine

- [x] **Endpoint de Clonagem por URL (`/api/site/clone`)**: Ingestão de URLs públicas e conversão automatizada do DOM em React/Tailwind.
- [x] **Barra de Entrada de URL no Chatbot Agêntico**: Campo de clonagem direta de sites por URL dentro do editor.
- [x] **Atalhos Rápidos de Clonagem de Referências**: Botões de 1 clique para clonar o `systemista.lovable.app`.

---

## 📦 FASE 7: Módulos SaaS B2B Completos

- [x] **Biblioteca de Templates Pro por Nicho (`TemplatesView.jsx`)**: 6 modelos pré-configurados (Gastronomia, Barbearia Cyber, Estética, Fitness, Auto Center, Odonto).
- [x] **Portfólio de Meus Projetos (`ProjectsView.jsx`)**: Gestão de landing pages publicadas, links públicos e histórico.
- [x] **Compilador e Exportador HTML5 Autônomo em 1 Clique (`siteDeployer.js`)**: Download de arquivos HTML5 autônomos prontos para produção.
- [x] **Agenda de Reuniões & Demos (`AppointmentsView.jsx`)**: Gestão de reuniões comerciais agendadas via CRM.
- [x] **Assistente de Disparo de WhatsApp em Lote (`BulkWhatsAppView.jsx`)**: Disparo assistido de abordagens em massa.
- [x] **Planos de Assinatura SaaS (`BillingView.jsx`)**: Tabela de preços interativa (Starter, Agency, Enterprise).
- [x] **Programa de Afiliados (`AffiliateView.jsx`)**: Painel de indicação com comissão de 30% recorrente via PIX.

---

## 🧪 FASE 8: Suíte de Testes Automatizados & Validação de Build

- [x] **Suíte de Testes Unitários Python (`backend/test_api.py`)**: 100% de aprovação nos testes REST e OSINT.
- [x] **Validação de Build de Produção Vite (`npm run build`)**: Compilação sem avisos ou erros.
- [x] **Tradução 100% em Português do Brasil (pt-BR)**: Todos os rótulos, botões e menus ajustados.

---

## 🔮 FASE 9: Próximas Evoluções Avançadas & Roadmap de Escala (Futuro)

- [ ] **Fase 9.1: Conexão Oficial WhatsApp Cloud API Meta (Webhooks Diretos)**
  - *Descrição*: Permitir disparo 100% automatizado sem necessidade do WhatsApp Web aberto.
  - *Status*: ⏳ Em Planejamento para v9.0.

- [ ] **Fase 9.2: Sandbox Serverless Docker / E2B Local**
  - *Descrição*: Ambiente virtualizado e isolado para compilar código React não confiável.
  - *Base concluída*: ✅ Docker Compose do produto, imagens separadas de frontend/backend, proxy Nginx, healthchecks, rede interna e persistência de `backend/data`.
  - *Ainda pendente*: ⏳ O Compose atual executa o REPASS AI; ele **não** é sandbox para código gerado por usuário. Faltam isolamento efêmero, limites de CPU/RAM/tempo, bloqueio de rede e destruição segura do container por execução.
  - *Status*: 🟡 Fundação de containers concluída; sandbox de compilação permanece em planejamento.

- [ ] **Fase 9.3: Integração de Domínios Customizados via CNAME / Cloudflare Worker**
  - *Descrição*: Mapeamento automático de domínios dos clientes (`site.cliente.com.br`).
  - *Status*: ⏳ Em Planejamento para v9.0.

---

## 🛠️ TABELA RESUMO DE FERRAMENTAS E IMPLEMENTAÇÕES

| Módulo / Ferramenta | Arquivo / Endpoint | Função no Sistema | Status |
| :--- | :--- | :--- | :---: |
| **Vite + React 19** | `src/App.jsx` | Front-end e Roteador Global | ✅ OK |
| **Architectural CSS** | `src/index.css` | Design System Swiss Brutalist (0.5px) | ✅ OK |
| **DocumentDB NoSQL** | `src/mock/documentDB.js` | Armazenamento de Esquemas de Sites | ✅ OK |
| **Python REST API** | `backend/app_api.py` | Backend de Varredura e Clonagem | ✅ OK |
| **OSINT Scraper** | `backend/scraper_monster.py` | Busca e Scoring de Empresas Locais | ✅ OK |
| **LLM Router** | `src/services/llmRouter.js` | Fallback em Grafo Multi-Provedor | ✅ OK |
| **Component Registry** | `src/services/componentRegistry.js` | Indexador dos 106 Primitivos UI | ✅ OK |
| **ASCIIWaves Canvas** | `src/components/ui/ASCIIWaves.jsx` | Fundo Interativo de Ruído ASCII | ✅ OK |
| **Site Deployer** | `src/services/siteDeployer.js` | Exportador de HTML5 Autônomo | ✅ OK |
| **Chatbot Builder** | `src/components/AgenticChatbotBuilder.jsx` | Chat Agêntico Estilo Lovable | ✅ OK |
| **Open Lovable Cloner** | `/api/site/clone` | Clonagem de Sites por URL | ✅ OK |
| **Suíte de Testes** | `backend/test_api.py` | Testes Unitários de Integração | ✅ OK |
