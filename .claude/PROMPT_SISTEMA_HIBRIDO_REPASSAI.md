# 🚀 PROMPT DETERMINÍSTICO: Sistema Híbrido REPASSAI (Regras + LLM)

> **Destinatário:** Claude Opus 5 (Arquiteto de Software Senior)
> **Objetivo:** Criar sistema de geração de sites que funciona 95% SEM IA, usando LLM apenas em casos extremos e conversação
> **Filosofia:** "Regras primeiro, IA quando necessário"

---

```
SISTEMA HÍBRIDO DE GERAÇÃO DE SITES REPASSAI
95% Determinístico + 5% LLM como fallback

VOCÊ É: Arquiteto de Software Senior especializado em sistemas híbridos rule-based + LLM.

TAREFA: Criar o MELHOR sistema de geração de sites que priorize DETERMINISMO e FALLBACK INTELIGENTE, usando IA apenas quando absolutamente necessário.

═══════════════════════════════════════════════════════════
1. FILOSOFIA DO SISTEMA
═══════════════════════════════════════════════════════════

PRINCÍPIO FUNDAMENTAL:
"Regras e templates resolvem 95% dos casos. IA resolve os 5% de exceções."

POR QUE HÍBRIDO?
✅ Custo: 100x mais barato (não chama LLM para cada site)
✅ Velocidade: 0.7s sem IA vs 5s com LLM
✅ Confiabilidade: Regras não alucinam
✅ Controle: Você sabe EXATAMENTE o que vai sair
✅ Debugging: Determinístico = previsível

QUANDO USAR LLM (apenas estes casos):
1. Usuário solicita alteração via chatbot ("mude o botão para vermelho")
2. Descrição de negócio vaga ("Loja de coisas") → gerar texto genérico
3. Tratamento de erro extremo (formato de dados nunca visto)
4. Análise de sentimento de reviews (se implementar)
5. Geração de descrição SEO personalizada

QUANDO NÃO USAR LLM (todos os outros casos):
❌ Geração de sites padrão
❌ Substituição de texto
❌ Validação de dados
❌ Escolha de template
❌ Formatação de telefone/endereço

═══════════════════════════════════════════════════════════
2. ARQUITETURA EM CAMADAS (PIRÂMIDE DE DECISÃO)
═══════════════════════════════════════════════════════════

                    ┌─────────────────┐
                    │   CAMADA 5: LLM  │  ← 5% dos casos
                    │  (Claude/GPT-4)  │    Apenas casos complexos
                    └─────────┬───────┘
                              │ fallback
                    ┌─────────▼───────┐
                    │  CAMADA 4: ML   │  ← 10% dos casos
                    │ (Classificação,  │    Recomendação, scoring
                    │  Recomendação)   │
                    └─────────┬───────┘
                              │
                    ┌─────────▼───────┐
                    │ CAMADA 3: Regras│  ← 40% dos casos
                    │  (Validação,    │    Validação, sanitização,
                    │  Transformação) │    formatação
                    └─────────┬───────┘
                              │
                    ┌─────────▼───────┐
                    │ CAMADA 2: Templates│ ← 40% dos casos
                    │  (HTML, CSS, JS) │    Templates parametrizados
                    │  Placeholders    │    Componentes modulares
                    └─────────┬───────┘
                              │
                    ┌─────────▼───────┐
                    │ CAMADA 1: Assets │  ← 5% dos casos
                    │ (Imagens, Ícones)│    Banco de assets
                    └─────────────────┘

FLUXO DE DECISÃO:
1. Template existe para o nicho? → SIM: Usa template
                              → NÃO: Tenta template similar
                                       → NÃO encontrou: LLM gera template base (caso extremo)

2. Dados do lead estão completos? → SIM: Usa dados
                                 → NÃO: Valida campos obrigatórios
                                          → Faltando campos: Pede usuário OU usa fallback seguro

3. Texto precisa ser personalizado? → SIM: Tenta regra de nicho
                                   → NÃO encontrou regra: LLM gera (caso extremo)

4. Usuário pediu alteração via chat? → SIM: LLM interpreta + executa
                                   → NÃO: Sistema automático

═══════════════════════════════════════════════════════════
3. CAMADA 1: ASSETS BANCADOS (Determinístico)
═══════════════════════════════════════════════════════════

Banco de Assets Local (backend/data/asset_library/):
- Templates por nicho (restaurant_001, barbershop_010)
- Componentes modulares (button_cta, navbar_modern)
- Imagens de fundo (hero_restaurant_001.jpg)
- Ícones (icon_food, icon_barber)
- Cores e paletas (colors_restaurant.json)

COMO FUNCIONA:
1. Sistema detecta nicho: "Restaurante"
2. Busca assets: backend/data/asset_library/templates/restaurant/
3. Seleciona template: restaurant_001 (baseado em popularidade)
4. Aplica assets: logo, cores, imagens do nicho
5. Resultado: 95% do site pronto SEM IA

═══════════════════════════════════════════════════════════
4. CAMADA 2: TEMPLATES PARAMETRIZADOS (Determinístico)
═══════════════════════════════════════════════════════════

Sistema de Templates com Placeholders:

HTML TEMPLATE:
```html
<h1>{{NOME_EMPRESA}}</h1>
<p>{{DESCRICAO_NEGOCIO}}</p>
<a href="{{WHATSAPP_URL}}">Peça pelo WhatsApp</a>
<img src="{{HERO_IMAGE}}" alt="Hero">
```

REGRAS DE SUBSTITUIÇÃO (SEM IA):

1. Campos Obrigatórios (sempre substituem):
   {{NOME_EMPRESA}} → lead.nome
   {{TELEFONE}} → lead.telefone (formatado)
   {{ENDERECO}} → lead.endereco

2. Campos Condicionais (se existir):
   {{AVALIACAO}} → lead.avaliacao (se não existir, omite seção)
   {{RESENHAS}} → lead.reviewsCount (se não existir, omite seção)

3. Campos Gerados por Regra (sem IA):
   {{DESCRICAO_NEGOCIO}} → Regra por nicho:
     - RESTAURANTE: "O melhor em {{CATEGORIA}} em {{CIDADE}}. Nota {{AVALIACAO}} no Google."
     - BARBEARIA: "Barbearia {{NOME}} - Cortes masculinos em {{CIDADE}}."
     - PETSHOP: "Cuidado completo para seu pet em {{CIDADE}}."

4. Fallbacks Seguros (nunca deixa vazio):
   {{NOME_EMPRESA}} → "Seu Negócio" (se vazio)
   {{TELEFONE}} → "(XX) XXXXX-XXXX" (se inválido)

═══════════════════════════════════════════════════════════
5. CAMADA 3: REGRAS E VALIDAÇÕES (Determinístico)
═══════════════════════════════════════════════════════════

A) VALIDAÇÃO DE DADOS (Schemas Fixos):
```python
class LeadSchema(BaseModel):
    nome: str (min 3 chars)
    telefone: str (regex E.164)
    endereco: str (min 5 chars)
    cidade: str (min 2 chars)
    estado: str (regex: ^[A-Z]{2}$)
    categoria: str (enum: restaurant, barbershop, petshop, ...)

    def is_valid() → bool
    def get_errors() → List[str]
```

B) FORMATADORES (Regras Fixas):
- Telefone: (16) 99050-5914 (sempre BR)
- CEP: 14400-000 (sempre Brazilian format)
- Endereço: "Rua X, 123 - Bairro - Cidade/SP"
- URL WhatsApp: https://wa.me/55{telefone_sem_caracteres}

C) NORMALIZADORES:
- Nome: sempre Title Case
- Categoria: mapeia para nicho (ex: "Restaurante" → "restaurant")
- Cidade: remove acentos, capitalize

D) ENRIQUECEDORES (APIs Públicas):
- Google Places → fotos, avaliação, reviews, horário
- ViaCEP → CEP → endereço completo
- Google Maps → coordenadas, place_id

═══════════════════════════════════════════════════════════
6. CAMADA 4: MACHINE LEARNING (Opcional - 10% casos)
═══════════════════════════════════════════════════════════

A) RECOMENDAÇÃO DE TEMPLATE:
```
Input: categoria="Restaurante", cidade="Franca", avaliacao=4.8
  ↓
Modelo treinado: "Quais templates restaurant têm melhor conversão em cidades pequenas?"
  ↓
Output: template_restaurant_003 (score: 0.95)
```

Treinamento: Histórico de qual template gerou mais visualizações/contatos

B) CLASSIFICAÇÃO DE NICHO:
```
Input: categoria="Pizzaria"
  ↓
Modelo: "Pizzaria é restaurant ou fast_food?"
  ↓
Output: restaurant (confidence: 0.92)
```

Treinamento: Dados históricos de categorias do Google Places

C) SCORING DE QUALIDADE:
```
Input: template HTML + CSS + JS
  ↓
Modelo: "Qual score de performance/acessibilidade?"
  ↓
Output: {performance: 92, accessibility: 85}
```

═══════════════════════════════════════════════════════════
7. CAMADA 5: LLM (Apenas 5% - Casos Extremos)
═══════════════════════════════════════════════════════════

TRIGGERS que ativam LLM:

1. Chatbot do usuário:
   Usuário: "Mude a cor do botão para vermelho"
   → LLM interpreta intenção + extrai parâmetros
   → Sistema executa: button.style.color = "#FF0000"

2. Descrição vaga do negócio:
   Input: "Loja de coisas"
   → Regras não conseguem categorizar
   → LLM: "Parece ser uma loja geral. Vou usar template de varejo."

3. Texto personalizado solicitado:
   Usuário: "Quero uma frase de impacto sobre qualidade"
   → LLM gera: "Qualidade que você vê, preço que você aprova."

4. Erro 500 recuperação:
   Sistema: "Erro inesperado: campo 'tipo' não reconhecido"
   → LLM analisa erro + sugere correção automática

5. Tradução de template (caso raro):
   Template vem em francês (exo-ape)
   → Regras: traduz termos comuns
   → LLM: traduz termos específicos que regras não pegaram

═══════════════════════════════════════════════════════════
8. FLUXO HÍBRIDO COMPLETO
═══════════════════════════════════════════════════════════

PASSO 1: Usuário seleciona lead
  ↓
PASSO 2: Sistema detecta nicho (Regra: categoria do Google Places)
  ✅ "Restaurante" → Nicho: restaurant
  ↓
PASSO 3: Sistema busca template (Determinístico)
  ✅ SELECT template FROM banco WHERE nicho='restaurant' ORDER BY popularity DESC
  → Template: restaurant_001
  ↓
PASSO 4: Sistema valida dados (Determinístico - Pydantic)
  ✅ Todos os campos obrigatórios OK?
  ❌ ERRO: faltando telefone
  → Sistema pede usuário OU usa fallback "(XX) XXXXX-XXXX"
  ↓
PASSO 5: Sistema compila site (Determinístico - Regex/Replace)
  ✅ Template HTML: {{NOME}} → "Fogo Vivo"
  ✅ Template HTML: {{TELEFONE}} → "(16) 99050-5914"
  ✅ Template HTML: {{DESCRICAO}} → Regra: "O melhor em Restaurante em Franca..."
  ↓
PASSO 6: Sistema valida saída (Determinístico)
  ✅ Não sobrou placeholder?
  ✅ Não tem texto genérico?
  ✅ HTML válido?
  ↓
PASSO 7: Salva arquivo (Determinístico)
  → Salva em: backend/data/77lib_catalog/generated_fogo_vivo.html
  ↓
PASSO 8: Retorna preview (Determinístico)
  → URL: /api/site/preview_html?file=generated_fogo_vivo.html

[CASO EXTREMO 1: Descrição vaga]
  Input: categoria="Loja de coisas"
  → Regras: "categoria não reconhecida"
  → LLM fallback: "Vou classificar como varejo_general"
  → Sistema continua com template de varejo

[CASO EXTREMO 2: Chatbot]
  Usuário: "Mude para tema escuro"
  → Sistema: Comando não reconhecido
  → LLM: Interpreta → "Usuário quer theme='dark'"
  → Sistema aplica: template.colors = dark_theme

═══════════════════════════════════════════════════════════
9. VANTAGENS DO SISTEMA HÍBRIDO
═══════════════════════════════════════════════════════════

CUSTO:
- 95% sem LLM = $0.00 por site
- 5% com LLM = $0.10 por site (apenas casos complexos)
- Custo médio: $0.005 por site (vs $0.50 se fosse 100% LLM)

VELOCIDADE:
- 95% sites: 0.7s (determinístico)
- 5% sites: 2.0s (com LLM)
- Média: 0.77s

CONFIABILIDADE:
- Regras: 100% previsível
- LLM fallback: Apenas quando regras falham
- Zero alucinações em produção

CONTROLE:
- Você sabe exatamente o que cada template vai gerar
- LLM só modifica quando autorizado
- Fácil de debugar (logs determinísticos)

ESCALABILIDADE:
- 1000 sites/hora sem LLM
- 50 sites/hora com LLM (casos extremos)
- Auto-scale: adicionar templates = código

═══════════════════════════════════════════════════════════
10. IMPLEMENTAÇÃO DO SISTEMA HÍBRIDO
═══════════════════════════════════════════════════════════

ARQUIVOS A CRIAR:

A) BACKEND - Motor Híbrido:

1. `backend/hybrid_engine.py` (NOVO)
   - Classe HybridSiteGenerator
   - Métodos:
     * generate(lead_data) → HTML (rota padrão sem LLM)
     * generate_with_fallback(lead_data) → HTML (rota com fallback LLM)
     * should_use_llm(context) → bool
     * call_llm_fallback(context) → dict
   - Lógica de decisão: quando usar LLM?

2. `backend/template_engine.py` (NOVO - substitui lib77_engine.py)
   - Classe TemplateEngine (determinística)
   - Métodos: download_template(), compile(), validate()
   - Placeholders: {{NOME}}, {{TELEFONE}}, etc.

3. `backend/rules/` (PASTA NOVA)
   - `regras_texto.py` → Gera texto por nicho (sem LLM)
   - `regras_validacao.py` → Valida dados do lead
   - `regras_enriquecimento.py` → Enriquece com APIs públicas
   - `regras_categorizacao.py` → Detecta nicho do negócio

4. `backend/schemas/lead_schema.py` (NOVO)
   - Schema Pydantic
   - Validators customizados

B) FRONTEND - Interface do Usuário:

1. `src/hooks/useHybridGenerator.js` (NOVO)
   - Estados: idle, compiling, validating, fallback_llm, done, error
   - Decidir se usa LLM ou não

2. `src/components/ChatbotWidget.jsx` (NOVO)
   - Chat interface para usuário
   - Quando detecta comando → chama LLM
   - Quando é automático → só mostra loading

═══════════════════════════════════════════════════════════
11. EXEMPLOS DE CÓDIGO
═══════════════════════════════════════════════════════════

EXEMPLO 1: Regra de Geração de Texto (SEM LLM)

```python
# backend/rules/regras_texto.py

def gerar_descricao_restaurante(lead: Lead) → str:
    return f"O melhor em {lead.categoria} em {lead.cidade}. " \
           f"Experiência gastronômica com nota {lead.avaliacao} no Google " \
           f"({lead.reviewsCount} avaliações)."

def gerar_cta_restaurante(lead: Lead) → str:
    return f"Faça sua reserva pelo WhatsApp"

# Uso:
descricao = gerar_descricao_restaurante(lead)
# Output: "O melhor em Restaurante em Franca. Experiência gastronômica com nota 4.8 no Google (1177 avaliações)."
```

EXEMPLO 2: Decisão Híbrida (Quando usar LLM?)

```python
# backend/hybrid_engine.py

class HybridSiteGenerator:
    def __init__(self):
        self.template_engine = TemplateEngine()
        self.llm_client = LLMClient() # Apenas para fallback

    def generate(self, lead_data: dict) → dict:
        # PASSO 1: Tenta determinístico
        try:
            # Valida dados
            lead = LeadSchema(**lead_data)

            # Escolhe template
            template = self.escolher_template(lead)

            # Compila site
            html = self.template_engine.compile(lead, template)

            # Valida saída
            if self.validar_saida(html):
                return {"status": "success", "method": "deterministic"}

        except DadosIncompletosError:
            # Tenta recuperar com fallbacks
            lead = self.aplicar_fallbacks(lead_data)

        except CategoriaDesconhecidaError:
            # LLM categoriza
            categoria = self.llm_client.classify_category(lead_data['descricao'])
            lead_data['categoria'] = categoria

        except TemplateNaoEncontradoError:
            # LLM escolhe template similar
            template = self.llm_client.recommend_template(lead_data)

        # PASSO 2: Fallback LLM (apenas se necessário)
        if self.deve_usar_llm(lead_data):
            html = self.llm_client.generate_site(lead_data)
            return {"status": "success", "method": "llm_fallback"}

        raise GenerationError("Falha em todos os métodos")
```

EXEMPLO 3: Chatbot como Interface LLM

```python
# backend/chatbot_engine.py

class ChatbotEngine:
    def __init__(self):
        self.llm = LLMClient()

    def processar_comando(self, mensagem: str, contexto: dict) → dict:
        # LLM interpreta comando
        intencao = self.llm.interpret_command(mensagem)

        # Executa comando (sistema determinístico)
        if intencao['acao'] == 'mudar_cor':
            return self.mudar_cor(contexto['project_id'], intencao['cor'])
        elif intencao['acao'] == 'mudar_texto':
            return self.mudar_texto(contexto['project_id'], intencao['texto'])
        elif intencao['acao'] == 'adicionar_secao':
            return self.adicionar_secao(contexto['project_id'], intencao['secao'])

        return {"erro": "Comando não reconhecido"}
```

═══════════════════════════════════════════════════════════
12. CRITÉRIOS DE DECISÃO (Quando usar LLM?)
═══════════════════════════════════════════════════════════

USA LLM SE:
✅ Usuário solicitou via chatbot
✅ Categoria desconhecida (não existe regra)
✅ Descrição de negócio vaga/incompleta
✅ Erro de geração (todas as regras falharam)
✅ Personalização avançada solicitada

NÃO USA LLM SE:
❌ Geração padrão de site (tem template + regra)
❌ Dados do lead completos + categoria conhecida
❌ Validação de campos
❌ Formatação de dados
❌ Aplicação de template

LOGGING:
- Log TODO processo (qual camada foi usada)
- Log custo de LLM (para controle)
- Log tempo de geração (determinístico vs LLM)

═══════════════════════════════════════════════════════════
13. ESTRATÉGIA DE IMPLEMENTAÇÃO (7 DIAS)
═══════════════════════════════════════════════════════════

DIA 1: Camada 1 + 2 (Assets + Templates)
1. Criar estrutura asset_library/
2. Baixar 10 templates de v0.app + originkit
3. Criar template_engine.py (compile sem LLM)
4. Testar: gerar 1 site 100% determinístico

DIA 2: Camada 3 (Regras)
1. Criar regras_texto.py (textos por nicho)
2. Criar regras_validacao.py (Pydantic schemas)
3. Criar regras_enriquecimento.py (APIs)
4. Testar: validar 10 leads diferentes

DIA 3: Camada 4 (ML Opcional)
1. Treinar classificador de nicho (scikit-learn)
2. Treinar recomendador de template (collaborative filtering)
3. Testar: precisão > 85%

DIA 4: Camada 5 (LLM Fallback)
1. Integrar LLM client (Claude API)
2. Criar prompts de fallback
3. Implementar decisão: quando usar LLM?
4. Testar: 10 casos extremos

DIA 5: Integração Híbrida
1. Criar hybrid_engine.py (orquestrador)
2. Integrar todas as camadas
3. Implementar logging
4. Testar: 100 gerações (misturar normal + extremo)

DIA 6: Chatbot + Frontend
1. Criar chatbot widget
2. Conectar com LLM
3. Interpretar comandos
4. Testar: edição via chat

DIA 7: Testes + Documentação
1. Testes unitários (pytest)
2. Testes E2E (Playwright)
3. Teste de carga (1000 sites)
4. Documentação completa
5. Deploy staging

═══════════════════════════════════════════════════════════
14. CUSTO BENCHMARK (Importante para Victor)
═══════════════════════════════════════════════════════════

CENÁRIO: 10.000 sites/mês

SEM HIBRIDO (100% LLM):
- 10.000 sites × $0.50 = $5.000/mês

COM HIBRIDO (95% determinístico):
- 9.500 sites × $0.00 = $0.00
- 500 sites × $0.10 = $50.00
- TOTAL: $50/mês

ECONOMIA: $4.950/mês (99%)

═══════════════════════════════════════════════════════════
15. MANDAMENTOS DO SISTEMA HÍBRIDO
═══════════════════════════════════════════════════════════

1. NUNCA usar LLM por padrão
2. SEMPRE tentar determinístico primeiro
3. LLM é FALLBACK, não regra
4. Log TODO processo (para auditoria)
5. Limite de custo LLM (budget mensal)
6. Timeout LLM (máximo 3s)
7. Validação de saída LLM (não pode ter dados genéricos)
8. Cache de respostas LLM (não repetir chamadas)

═══════════════════════════════════════════════════════════
16. ENTREGÁVEIS
═══════════════════════════════════════════════════════════

A) DOCUMENTAÇÃO:
1. `docs/HYBRID_ENGINE_ARCHITECTURE.md`
2. `docs/WHEN_TO_USE_LLM.md` (guia de decisão)
3. `docs/RULES_REFERENCE.md` (todas as regras)

B) CÓDIGO:
1. `backend/hybrid_engine.py` (orquestrador)
2. `backend/template_engine.py` (compilador determinístico)
3. `backend/rules/` (regras por nicho)
4. `backend/llm_fallback.py` (integração LLM)
5. `backend/chatbot_engine.py` (chatbot)
6. `src/hooks/useHybridGenerator.js`
7. `src/components/ChatbotWidget.jsx`

C) CONFIGURAÇÕES:
1. `backend/data/rules/` (regras por nicho em JSON)
2. `backend/data/llm_prompts/` (prompts de fallback)
3. `.env` (LLM_API_KEY)

═══════════════════════════════════════════════════════════
17. PRÓXIMOS PASSOS
═══════════════════════════════════════════════════════════

1. Ler este prompt COMPLETAMENTE
2. Verificar arquitetura (faz sentido?)
3. Me apresente RESUMO EXECUTIVO (3-5 linhas)
4. Aguarde aprovação
5. Implementar FASE 1 (determinístico puro)
6. Testar FASE 1
7. Implementar FASE 2 (LLM fallback)
8. Testar FASE 2
9. Documentar
10. Deploy

NÃO altere NADA ainda. Só ANALISE e REPORT.

═══════════════════════════════════════════════════════════
```

---

## 🎯 COMO USAR ESSE PROMPT:

1. **Copie TODO o bloco acima** (de 🚀 até a última linha tracejada)
2. **Abra o Claude Opus 5**
3. **Configure o projeto** como raiz: `c:\Users\Victor Ads\Documents\SCRAPER HACKING`
4. **Cole o prompt** e envie
5. **O Claude Opus 5 vai:**
   - Analisar a arquitetura híbrida
   - Implementar motor determinístico (95%)
   - Integrar LLM como fallback (5%)
   - Criar todas as regras por nicho
   - Implementar chatbot
   - Testar sistema completo

**Resultado final:**
- Sistema 95% determinístico (barato, rápido, confiável)
- LLM apenas em casos extremos (inteligência quando necessário)
- Economia de 99% em custos de LLM
- Performance: 0.7s por site

**Pronto? Copie o prompt e cole no Claude Opus 5.** 🚀