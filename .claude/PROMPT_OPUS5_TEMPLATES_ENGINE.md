# 🚀 PROMPT DETERMINÍSTICO: Sistema de Geração de Templates REPASSAI

> **Destinatário:** Claude Opus 5 (Arquiteto de Software Senior)
> **Objetivo:** Criar sistema de geração de templates prontos, rápido, sem erros, sem informações falsas
> **Copy-paste:** Use este prompt EXATAMENTE como está

---

```
SISTEMA DE GERAÇÃO DE TEMPLATES REPASSAI - ARQUITETURA COMPLETA

VOCÊ É: Arquiteto de Software Senior especializado em sistemas de geração procedural de conteúdo e templates HTML/CSS/JS.

TAREFA: Criar o MELHOR sistema possível de geração de sites para negócios locais, usando templates da 77lib.dev como base, mas SEM erros, SEM informações falsas, RÁPIDO e ESCALÁVEL.

═══════════════════════════════════════════════════════════
1. CONTEXTO DO PRODUTO (REPASSAI)
═══════════════════════════════════════════════════════════

PRODUTO: REPASSAI - Gerador de Sites para Negócios Locais
PÚBLICO: Donos de pequenos negócios (restaurantes, padarias, barbearias, petshops)
PROBLEMA: Eles não têm site, não sabem criar, e não têm dinheiro para contratar dev
SOLUÇÃO: Automatizar 100%: lead → dados Google Places → site pronto → venda

NICHO ATUAL: Inicialmente focado em Franca-SP, mas escalável para qualquer cidade
TEMPLATE BASE: 77lib.dev (library de templates HTML/CSS modernos, tipo shadcn/ui mas para sites)
TOKEN 77LIB: a2c2dd79e0d5477eaf1ffb3144e27baf (já existe, verificar se ativo)

═══════════════════════════════════════════════════════════
2. PROBLEMAS ATUAIS (NÃO PODE REPETIR)
═══════════════════════════════════════════════════════════

❌ Regex frágil que quebra se template mudar
❌ Falta de validação de dados (telefone inválido, endereço vazio)
❌ Sem feedback visual (usuário acha que travou)
❌ LocalStorage com projectId órfão (tela cinza)
❌ Informações erradas nos sites (texto em francês misturado, dados genéricos)
❌ Lentidão em algum ponto (precisa ser < 1.5s total)
❌ Sem tratamento de erro amigável (erro 500 para usuário final)

═══════════════════════════════════════════════════════════
3. REQUISITOS TÉCNICOS OBRIGATÓRIOS
═══════════════════════════════════════════════════════════

STACK ATUAL (MANTER):
- Frontend: React 19, Vite, Tailwind CSS
- Backend: Python 3.14, FastAPI/Express
- Templates: 77lib.dev (HTML/CSS/JS puro)
- Dados: Google Places API, Google Maps
- Armazenamento: Sistema de arquivos local (backend/data/77lib_catalog/)
- Preview: IframeHTML5

ARQUITETURA ALVO (VOCÊ PROJETA):
1. CAMADA DE DOWNLOAD: Baixar template 77lib → armazenar em cache local
2. CAMADA DE COMPILAÇÃO: 
   - Parsear HTML do template
   - Substituir placeholders nomeados (NÃO regex cego): {{NOME}}, {{TELEFONE}}, {{CIDADE}}
   - Injeta assets (logo, cores, favicon) baseado no nicho
   - Valida TODOS os campos obrigatórios antes de salvar
3. CAMADA DE VALIDAÇÃO:
   - Schema de dados do lead (tipos, formats, obrigatoriedade)
   - Validação de URL, telefone (regex E191), CEP, email
   - Detecção de dados genéricos/exemplo ("Exo Ape", "hello@exoape.com")
   - Se faltar dado crítico → pede para usuário OU usa placeholder seguro (NUNCA dado genérico)
4. CAMADA DE FEEDBACK:
   - Loading state em todas as etapas
   - Progresso visual (0% → 100%)
   - Mensagens de erro AMIGÁVEIS (não stack trace)
5. CAMADA DE PERSISTÊNCIA:
   - Salva HTML compilado em disco
   - Salva metadados do projeto (JSON com dados do lead)
   - Limpa arquivos órfãos (projectId sem HTML)

═══════════════════════════════════════════════════════════
4. CRITÉRIOS DE ACEITE (TUDO DEVE PASSAR)
═══════════════════════════════════════════════════════════

GERAL:
✅ Zero erros de build (npm run build sem erros)
✅ Zero warnings de lint
✅ Performance: geração < 1.5s (do clique ao preview)
✅ Zero dados genéricos nos sites ("Exo Ape", "Willem II Singel 8", "Pays-Bas")
✅ Zero texto em francês nos sites finalizados
✅ Funciona offline (template em cache local)
✅ Escalável: adicionar novo template = só adicionar slug na lista

SEGURANÇA:
✅ NUNCA expõe token 77lib no frontend
✅ Valida todos os inputs do usuário (XSS prevention)
✅ Sanitiza HTML antes de salvar (remove scripts maliciosos)
✅ Proteção contra path traversal (não deixa acessar ../etc/passwd)

USABILIDADE:
✅ Spinner de carregamento imediato (50ms)
✅ Mensagem de erro legível para usuário final
✅ Preview funciona 100% (iframe carrega sem tela cinza)
✅ Botão "Gerar" desabilitado durante geração (não duplo clique)
✅ ProjectId sempre válido (não Pedro para estado sem HTML)

EXTENSIBILIDADE:
✅ Adicionar novo template = 1 linha de configuração
✅ Trocar template de um nicho = 1 mudança no JSON de mapeamento
✅ Adicionar novo dado do lead = 1 linha no schema + 1 placeholder no template
✅ Trocar LLM por regex = 1 função (injeção engine)

═══════════════════════════════════════════════════════════
5. ENTREGÁVEIS ESPERADOS (ARQUIVOS QUE VOCÊ VAI CRIAR/EDITAR)
═══════════════════════════════════════════════════════════

A) DOCUMENTAÇÃO TÉCNICA:
1. `docs/TEMPLATE_ENGINE_ARCHITECTURE.md`
   - Diagrama de arquitetura (Mermaid)
   - Fluxo de dados completo
   - Decisões técnicas e trade-offs
   - Guia de manutenção

2. `docs/TEMPLATE_DEVELOPMENT_GUIDE.md`
   - Como criar um novo template
   - Padrões de nomenclatura de placeholders
   - Checklist de qualidade
   - Exemplos de templates por nicho

3. `docs/TOKEN_77LIB.md`
   - Como funciona a autenticação
   - Como renovar token se expirar
   - Rate limits e boas práticas

B) CÓDIGO Fonte:
1. `backend/template_engine.py` (NOVO - substitui lib77_engine.py)
   - Classe TemplateEngine com métodos:
     * download_template(slug) → HTML cru
     * compile(lead_data, template_slug) → HTML final
     * validate(lead_data) → { ok, errors }
     * inject_assets(html, lead_data) → HTML com logo/cores
   - Usa placeholders nomeados: {{NOME}}, {{TELEFONE}}, etc.
   - Type hints em 100% dos métodos
   - Docstring completa em cada método

2. `backend/schemas/lead_schema.py` (NOVO)
   - Schema Pydantic do Lead
   - Validators customizados (telefone BR, CEP, URL)
   - Método is_complete() → bool
   - Método get_defaults() → dados seguros se faltarem

3. `backend/schemas/template_schema.py` (NOVO)
   - Definição de template (slug, name, niche, thumbnail)
   - Mapeamento de placeholders por template
   - Assets necessários por nicho

4. `backend/template_registry.py` (NOVO)
   - Registro centralizado de templates disponíveis
   - Método get_by_niche(niche) → template_slug
   - Método list_available() → array de templates
   - Cache de templates baixados

5. `backend/app_api.py` (MODIFICAR)
   - Novo endpoint: POST /api/template/generate
     * Recebe: lead_id + template_slug
     * Retorna: { projectId, preview_url, status }
   - Novo endpoint: GET /api/template/status/{projectId}
     * Retorna: { status, progress, errors }
   - Novo endpoint: GET /api/templates/available
     * Retorna: lista de templates disponíveis por nicho

6. `src/hooks/useTemplateGenerator.js` (NOVO)
   - Hook React para geração de templates
   - Estados: idle, downloading, compiling, validating, done, error
   - Retorna: { generate, progress, result, error }

7. `src/components/TemplateGenerator.jsx` (NOVO)
   - UI component wrapper do hook
   - Spinner, barra de progresso, mensagens de erro

C) CONFIGURAÇÕES:
1. `backend/data/template_registry.json` (NOVO)
   - Lista de templates disponíveis
   - Mapeamento nicho → template_slug
   - Tokens e credenciais (NÃO committar .env)

2. `backend/data/assets_by_niche/` (PASTA NOVA)
   - `/restaurant/` → logo restaurante, ícones food, cores #FF6B6B
   - `/barbershop/` → logo barbearia, ícones tesoura, cores #2D3436
   - `/petshop/` → logo petshop, ícones paws, cores #00B894
   - Cada nicho: logo.png, colors.json, favicon.ico

═══════════════════════════════════════════════════════════
6. FLUXO DE DADOS ESPERADO (PASSO A PASSO)
═══════════════════════════════════════════════════════════

1. Usuário na aba "Criar Site"
   ↓
2. Usuário seleciona lead (dados Google Places)
   ↓
3. Usuário escolhe template (automático por nicho ou manual)
   ↓
4. FRONTEND: Chama POST /api/template/generate
   { lead_id, template_slug }
   ↓
5. BACKEND: 
   a. Valida dados do lead (schema Pydantic)
   b. Verifica se template existe em cache local
   c. Se não existe: baixa da 77lib.dev (com token)
   d. Carrega HTML cru do cache
   e. Substitui TODOS os placeholders nomeados
   f. Injeta assets do nicho (logo, cores)
   g. Valida HTML final (não tem dados genéricos)
   h. Valida HTML final (não tem texto em francês)
   i. Salva HTML em disco: backend/data/77lib_catalog/generated_{slug}.html
   j. Salva metadados JSON: backend/data/77lib_catalog/{projectId}.json
   k. Retorna { projectId, preview_url }
   ↓
6. FRONTEND:
   a. Recebe projectId
   b. Abre iframe: /api/site/preview_html?file=generated_{slug}.html
   c. Mostra "Site gerado com sucesso!"
   ↓
7. Usuário vê o site no iframe (100% carregado)

═══════════════════════════════════════════════════════════
7. PADRÕES DE CÓDIGO OBRIGATÓRIOS
═══════════════════════════════════════════════════════════

PYTHON:
- Type hints em 100% dos métodos (nunca `def foo(x):`, sempre `def foo(x: str) -> None:`)
- Docstrings Google Style (Args, Returns, Raises)
- Exception handling específico (nunca `except:` genérico)
- Logging com níveis (DEBUG, INFO, WARNING, ERROR)
- Pydantic para schemas
- FastAPI para endpoints

REACT:
- Functional components + hooks (NUNCA class components)
- TypeScript (não JSDoc)
- Error boundaries em todas as views
- Loading states em todas as ações assíncronas
- Memo/useMemo para otimização

GERAL:
- NUNCA commitar .env ou tokens
- NUNCA usar console.log (usar logger)
- NUNCA deixar código morto/comentado
- NUNCA usar any/unknown (TypeScript)
- NUNCA hardcodar strings (usar constants)
- SEMPRE tratar erros (try/except ou try/catch)
- SEMPRE validar inputs (schema validation)

═══════════════════════════════════════════════════════════
8. ESTRATÉGIA DE IMPLEMENTAÇÃO (MODO TURBO)
═══════════════════════════════════════════════════════════

FASE 1 - Fundação (Dia 1):
1. Criar estrutura de pastas
2. Criar schemas Pydantic
3. Criar TemplateEngine com download e compile
4. Testar com template "aura-template-digital-creative-30"
5. Validar saída (sem texto francês, sem dados genéricos)

FASE 2 - Backend Completo (Dia 2):
1. Implementar template_registry.py
2. Implementar novos endpoints no app_api.py
3. Adicionar assets_by_niche/ com 3 nichos (restaurant, barbershop, petshop)
4. Testar cada endpoint com Thunder Client/Postman
5. Validar velocidade (< 1.5s)

FASE 3 - Frontend (Dia 3):
1. Criar useTemplateGenerator.js
2. Criar TemplateGenerator.jsx
3. Integrar com CreateSiteWizardView.jsx
4. Testar jornada completa (seleção → geração → preview)
5. Validar UX (spinner, mensagens, botão desabilitado)

FASE 4 - Qualidade (Dia 4):
1. Testes unitários (pytest para backend)
2. Testes E2E (Playwright para frontend)
3. Auditoria de segurança (token exposto? XSS?)
4. Performance test (100 gerações seguidas)
5. Documentação final

═══════════════════════════════════════════════════════════
9. MANDAMENTOS (NÃO QUEBRAR)
═══════════════════════════════════════════════════════════

1. NUNCA deliver código com dados genéricos nos templates
2. NUNCA deixar texto em francês como fallback
3. NUNCA quebrar funcionalidade existente (o que já funciona, continua funcionando)
4. NUNCA expor token 77lib no frontend
5. SEMPRE validar dados antes de compilar
6. SEMPRE tratar erros com mensagens amigáveis
7. SEMPRE manter velocidade < 1.5s
8. SEMPRE documentar decisões técnicas

═══════════════════════════════════════════════════════════
10. COMO VOCÊ VAI TRABALHAR (MODO TURBO)
═══════════════════════════════════════════════════════════

1. Ler este prompt COMPLETAMENTE (não pular nenhuma seção)
2. Ler código atual do backend (lib77_engine.py, app_api.py)
3. Ler código atual do frontend (CreateSiteWizardView.jsx, SiteEditorView.jsx)
4. Criar plano de implementação passo a passo (implementation_plan.md)
5. APRESENTAR O PLANO PARA APROVAÇÃO (aguardar Victor aprovar)
6. Executar FASE 1 completa (não pular etapas)
7. Testar FASE 1 (verificar critérios de aceite)
8. Só então ir para FASE 2
9. Nunca alterar mais de 3 arquivos por vez
10. Commit a cada fase concluída (git commit -m "feat: fase X - descrição")

═══════════════════════════════════════════════════════════

AGORA VOCÊ ESTÁ NO CONTROLE.

PRÓXIMO PASSO IMEDIATO:
1. Leia lib77_engine.py e app_api.py
2. Me apresente um RESUMO EXECUTIVO (3-5 linhas) do que você vê
3. Aguarde minha aprovação para criar o plano de implementação

NÃO altere NADA ainda. Só ANALISE e REPORT.

═══════════════════════════════════════════════════════════
```

---

## 🎯 COMO USAR ESSE PROMPT:

1. **Copie TODO o bloco acima** (de 🚀 até a última linha tracejada)
2. **Abra o Claude Opus 5** (ou Claude Code configurado para Opus)
3. **Configure o projeto** como raiz: `c:\Users\Victor Ads\Documents\SCRAPER HACKING`
4. **Cole o prompt** e envie
5. **O Claude Opus 5 vai:**
   - Ler todos os arquivos relevantes
   - Apresentar um resumo executivo
   - Aguardar sua aprovação
   - Criar plano de implementação
   - Executar em modo turbo (uma fase por vez)
   - Testar cada fase antes de avançar

## 📋 CHECKLIST DE SUPERVISÃO (Para você acompanhar):

Após cada fase, o Claude Opus 5 vai entregar:
- [ ] Código alterado (diff)
- [ ] Testes executados (logs)
- [ ] Validação de critérios de aceite
- [ ] Documentação atualizada
- [ ] Commit no git

Você só precisa:
1. Aprovar o plano
2. Acompanhar os testes
3. Aprovar a entrega

## 🆘 SE DER ERRO:

```
1. git diff → ver o que mudou
2. git log → ver commits
3. git reset --hard HEAD~1 → volta 1 commit se necessário
4. Me envie o erro exato (printstack + contexto)
```

---

**Pronto? Copie o prompt e cole no Claude Opus 5.**

Você agora tem um engenheiro senior 24/7 trabalhando no seu projeto. 🚀