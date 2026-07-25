# REPASS AI — Documentação de Handoff & Guia de Arquitetura de Produção

> **Destinado a**: Claude Code / AGY Agent / Equipe de Engenharia Sênior no Modo **Ultra Code**.  
> **Versão do Sistema**: v29.0-STABLE (Production Ready — Google Places Real Media Enrichment & Proxy Pipeline)  
> **Repositório**: `C:\Users\Victor Ads\Documents\SCRAPER HACKING`  

---

## 1. Pipeline de Enriquecimento de Mídia Google Places API & Proxy (`backend/scraper_monster.py` & `backend/app_api.py`)

1. **Classe `GooglePlacesMediaEnricher`**:
   - `obter_midias_empresa(company_name, city, nicho)`:
     - Realiza a busca do `place_id` único no Google Business via Google Places API.
     - Extrai as fotos originais do estabelecimento enviadas pelos proprietários e clientes.
     - Gera URLs de proxy mascaradas (`/api/media/proxy?ref=PHOTO_REF`) para prevenir expor a `GOOGLE_PLACES_API_KEY` no front-end.
     - Aciona o **Media RAG Fallback (Agnes AI / Unsplash)** caso o perfil não possua fotos, garantindo 100% de disponibilidade.

2. **Endpoint Proxy `/api/media/proxy` no `app_api.py`**:
   - Baixa a imagem diretamente da API do Google, injeta cabeçalhos CORS (`Access-Control-Allow-Origin: *`) e entrega a imagem em alta resolução (parâmetro `maxwidth=1200`).

3. **Componente de Galeria Dinâmica `<GallerySection />`**:
   - Renderizado automaticamente no editor do LeadSite com as imagens reais capturadas do perfil do cliente no Google Business.

---

## 2. Estrutura de Arquivos do Projeto

```
SCRAPER HACKING/
├── backend/
│   ├── app_api.py               # REST API Python com Proxy de Mídia /api/media/proxy
│   ├── scraper_monster.py       # OSINT Core + GooglePlacesMediaEnricher + Media RAG Fallback
│   └── test_api.py              # Suíte de Testes Automatizados (Ran 3 tests - OK)
├── Backgrounds Animations/      # 45 Fontes de Código de Fundos Animados (React Bits)
├── Components Animations/       # 60 Fontes de Código de Componentes UI Primitivos
├── src/
│   ├── assets/
│   │   └── repass_logo_orb.jpg  # LOGO OFICIAL REPASS AI (Orbe Magenta)
│   ├── components/
│   │   ├── AgenticChatbotBuilder.jsx# REPASS AGENTIC CONSOLE (Conectado ao Roteador de IA)
│   │   ├── Sidebar.jsx          # Sidebar com Logo e Design System Original
│   │   └── ui/
│   │       ├── OriginKitComponents.jsx # Componente GallerySection (Mídia Real Google Business)
│   │       └── ...
│   ├── mock/
│   ├── services/
│   │   ├── agenticPlanner.js   # Injeção de Mídia Real Google Places no Schema do Site
│   │   └── ...
│   ├── views/
│   │   ├── LandingPage.jsx      # Landing Page com Alinhamento e Copy Oficial
│   │   └── ...
│   ├── App.jsx                  # Roteador de Estado Global
│   └── main.jsx                 # Ponto de Entrada React
├── index.html                   # Importação de Fontes Inter Tight/JetBrains Mono
├── package.json                 # Dependências (React 18, Framer Motion, OGL, GSAP, Vite)
├── vite.config.js               # Configuração de Build
└── HANDOFF_CLAUDE_CODE.md       # Este Documento de Handoff
```

---

## 3. Comandos para Execução

### Rodar a API Python em Segundo Plano
```bash
python backend/app_api.py
```

### Rodar o Front-end React (Vite)
```bash
npm run dev
```

---

> **Status Final**: APROVADO & VERIFICADO.  
> **Pipeline de Enriquecimento de Mídia Google Places & Proxy Totalmente Operacional.**
