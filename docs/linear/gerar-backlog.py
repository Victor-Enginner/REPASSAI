# -*- coding: utf-8 -*-
"""
Gera o CSV de importação do backlog REPASS AI para o Linear.

Por que um script e não um CSV escrito à mão: as descrições têm vírgula,
aspas e quebra de linha. Montar isso manualmente quebra a importação de um
jeito silencioso — o Linear aceita o arquivo e corta a descrição no meio.
O módulo `csv` escapa corretamente.

Colunas aceitas pelo importador do Linear:
    Title, Description, Status, Priority, Estimate, Labels, Project

Uso:
    python docs/linear/gerar-backlog.py
"""

import csv
import os

BASE = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(BASE, "backlog-repass-ai.csv")

# (Título, Descrição, Status, Prioridade, Estimativa, Labels, Projeto)
ISSUES: list[tuple[str, str, str, str, str, str, str]] = [
    # ── Segurança e Produção ────────────────────────────────────────────
    (
        "Fechar bypass de autenticação nas rotas que gastam dinheiro",
        "O bloco de cota em app_api.py usava `if usuario:` — sem token, a checagem "
        "inteira era pulada e a varredura executava assim mesmo. Qualquer pessoa com "
        "a URL consumia a chave do Google Places do dono.\n\n"
        "**Feito:** portão único em `do_POST`/`do_GET` cobrindo /api/leads/scan, "
        "/api/site/generate, /api/site/clone, /api/ai/generate, /api/sites.\n\n"
        "**Aceite:** as 5 rotas devolvem 401 sem token. Verificado.",
        "Done", "Urgent", "3", "seguranca,backend", "Segurança e Produção",
    ),
    (
        "Rate limiting por IP e por usuário",
        "Não existia nenhuma proteção: mil requisições esgotavam a cota do Places.\n\n"
        "**Feito:** `LimitadorDeTaxa` com janela deslizante, thread-safe (o servidor é "
        "ThreadingHTTPServer). Limite por IP antes de validar o token — validar primeiro "
        "faria uma enxurrada anônima queimar cota do Supabase. Quem está logado tem "
        "janela própria pelo user_id.\n\n"
        "**Aceite:** 30 req/60s; a 31ª devolve 429 com Retry-After. Teste de "
        "concorrência com 20 threads contra teto de 5. Verificado.",
        "Done", "Urgent", "3", "seguranca,backend", "Segurança e Produção",
    ),
    (
        "Parar de devolver str(e) ao cliente",
        "Mensagem de exceção crua ia para a resposta HTTP, carregando caminho de "
        "arquivo e potencialmente trecho de credencial.\n\n"
        "**Feito:** detalhe técnico vai para o log; cliente recebe mensagem em "
        "português. Helper `_responder_erro_amigavel`.",
        "Done", "High", "1", "seguranca,backend", "Segurança e Produção",
    ),
    (
        "Trocar os 6 `except Exception` genéricos por exceções específicas",
        "Mascaram a causa real da falha e engolem erros de programação junto com "
        "erros de rede. Localizados em app_api.py.\n\n"
        "**Aceite:** cada except nomeia as exceções que espera; o resto sobe.",
        "Todo", "Medium", "3", "backend,divida-tecnica", "Segurança e Produção",
    ),
    (
        "Migrar o rate limiter para Redis quando houver mais de uma instância",
        "O limitador é em memória. Com um processo só está correto; ao escalar "
        "horizontalmente cada instância teria a própria contagem e o teto real "
        "viraria N × 30.\n\n"
        "**Gatilho:** antes do primeiro deploy com réplica.",
        "Backlog", "Low", "5", "backend,escala", "Segurança e Produção",
    ),
    (
        "Documentar a decisão sobre as chaves expostas no histórico do git",
        "Os commits bf11c0d e f62e7fa contêm backend/.env com GOOGLE_PLACES_API_KEY, "
        "LLM_API_KEY, MODAL_TOKEN_ID e MODAL_TOKEN_SECRET. Decidido em 27/07/2026 não "
        "rotacionar e não reescrever o histórico.\n\n"
        "**Risco aceito** enquanto o repositório permanecer privado. Se ele for "
        "aberto ou compartilhado, rotacionar antes.",
        "Todo", "Medium", "1", "seguranca,documentacao", "Segurança e Produção",
    ),

    # ── Motor de Sites ──────────────────────────────────────────────────
    (
        "Auditoria que bloqueia site com resíduo do template original",
        "O motor entregava sites com texto em francês, dados da agência holandesa "
        "(Exo Ape, Willem II Singel, Pays-Bas) e 8 fotos do Storyblok — as imagens de "
        "outra empresa no site do cliente.\n\n"
        "**Feito:** auditoria sobre o texto visível com 26 marcadores gramaticais do "
        "francês, mais lista de termos proibidos e clientes fictícios. Site sujo é "
        "BLOQUEADO, não salvo.\n\n"
        "**Aceite:** 5 leads de completude diferente, 0 resíduos, < 1,5s. Verificado "
        "renderizando a página, não só pela auditoria.",
        "Done", "Urgent", "5", "motor-sites,qualidade", "Motor de Sites",
    ),
    (
        "Corrigir `<html lang=\"fr\">` nos sites gerados",
        "Todo site de negócio brasileiro declarava ser francês. O Google usa isso "
        "para direcionar idioma e região — anulava exatamente a promessa do produto "
        "(site que indexa).\n\n"
        "**Feito:** lang=pt-BR, meta description, Open Graph completo e twitter:card. "
        "A auditoria bloqueia se o idioma voltar a não ser pt.\n\n"
        "**Aceite:** 4 casos testados (fr / sem lang / sem description / correto).",
        "Done", "Urgent", "2", "motor-sites,seo", "Motor de Sites",
    ),
    (
        "Substituir regex cega por casamento tolerante a marcação",
        "O template quebra frases dentro de tags (`<span>Voir</span> <span>la "
        "Vidéo</span>`), então `.replace('Voir la Vidéo')` nunca casava e o francês "
        "ia ao ar.\n\n"
        "**Feito:** `_frase_regex` aceita espaços e tags entre as palavras. Toda regra "
        "é contada; `regras_sem_efeito` no retorno aponta o que parou de casar se o "
        "template mudar na origem.",
        "Done", "High", "3", "motor-sites", "Motor de Sites",
    ),
    (
        "Tirar o token da 77lib do código-fonte",
        "Estava hardcoded em lib77_engine.py linha 23.\n\n"
        "**Feito:** lê `LIB77_TOKEN` do ambiente e falha com mensagem clara se faltar.",
        "Done", "High", "1", "seguranca,motor-sites", "Motor de Sites",
    ),
    (
        "Corrigir NameError que quebrava /api/site/generate e /api/site/clone",
        "`html_content` era usado sem nunca ser definido — toda chamada estourava. "
        "`handle_site_clone` lia `sintese['html_content']`, chave que o motor nunca "
        "devolveu. Provável origem da tela cinza relatada.\n\n"
        "**Feito:** HTML é lido do arquivo gerado.",
        "Done", "Urgent", "1", "backend,bug", "Motor de Sites",
    ),
    (
        "Imagem de reserva por nicho quando o lead não tem foto do Google",
        "Lead sem mediaEnrichment mantinha as 9 imagens da agência do template.\n\n"
        "**Feito:** fallback coerente por segmento (padaria, restaurante, barbearia, "
        "petshop, academia, oficina) e rede de segurança que troca qualquer imagem "
        "remanescente.",
        "Done", "High", "2", "motor-sites", "Motor de Sites",
    ),
    (
        "/api/site/clone não clona nada — implementar ou remover",
        "Devolve um schema fixo dizendo 'Firecrawl'. Está exposto na interface como "
        "se funcionasse, o que é promessa falsa para o operador.\n\n"
        "**Decisão necessária:** implementar clonagem real ou retirar da UI.",
        "Todo", "High", "5", "backend,divida-tecnica", "Motor de Sites",
    ),
    (
        "Adicionar <main> e hierarquia h1→h3 no HTML gerado",
        "O site gerado tem 4 <section>, <footer>, <nav>, 1 <h1> e 4 <h2>, mas não tem "
        "<main> nem <h3> — a hierarquia pula um nível.\n\n"
        "Depende de reestruturar o HTML da 77lib; melhor fazer junto com o pipeline "
        "de composição, quando o HTML for nosso.",
        "Backlog", "Medium", "3", "seo,acessibilidade", "Motor de Sites",
    ),
    (
        "Remover modal_engine.py (código morto)",
        "Zero referências no projeto inteiro.",
        "Todo", "Low", "1", "divida-tecnica", "Motor de Sites",
    ),

    # ── Biblioteca de Assets ────────────────────────────────────────────
    (
        "Minerador de registries de componentes (local + Cloudflare R2)",
        "**Feito:** 1.140 componentes MIT de 6 fontes (React Bits 556, Magic UI 246, "
        "SmoothUI 152, Vue Bits 132, shadcn 54). 1.399 arquivos, 18 MB locais, todos "
        "com URL de CDN respondendo 200.\n\n"
        "Cache local em backend/data/asset_library (no .gitignore), cópia canônica no "
        "R2, índice leve versionado. Adicionar fonte nova = 1 objeto em sources.json.\n\n"
        "**Descartadas por não terem registry público:** 21st.dev, uiverse.io, "
        "inspira-ui, svelte-bits, framer motion. v0.app e demais fontes pagas ficaram "
        "fora por licença.",
        "Done", "High", "8", "assets,infra", "Biblioteca de Assets",
    ),
    (
        "Pré-renderizar os 34 blocos e 36 temas para composição de sites",
        "A biblioteca é código React/Vue (737 tsx, 278 jsx, 133 vue) e o gerador "
        "produz HTML standalone — não dá para concatenar TSX em HTML.\n\n"
        "**Proposta:** build que converte cada bloco em fragmento HTML+CSS uma vez "
        "(lento, roda offline) e depois compõe por lead em milissegundos, mantendo a "
        "meta de < 1,5s.\n\n"
        "**Risco conhecido:** blocos com estado/animação React podem não sobreviver à "
        "pré-renderização. Validar com 3 blocos antes de escalar.",
        "Todo", "High", "13", "assets,motor-sites", "Biblioteca de Assets",
    ),

    # ── Design System ───────────────────────────────────────────────────
    (
        "Migrar cores escritas à mão para tokens CSS",
        "Hex literais subiram de 619 para 870 entre sprints. Trocar a identidade "
        "visual custava 870 edições.\n\n"
        "**Feito:** 473 substituições em 17 arquivos, tokens no :root de 15 para 40, "
        "var(--token) de 94 para 567.\n\n"
        "**Cuidado tomado:** só valores de propriedade de estilo foram trocados. Hex "
        "passado como prop para componente WebGL e os hex de services/ (que geram o "
        "HTML do cliente, sem acesso ao nosso CSS) ficaram literais de propósito.",
        "Done", "High", "5", "design-system,frontend", "Design System",
    ),
    (
        "Trava de lint que reprova cor hex solta no JSX",
        "A regressão foi estrutural: não existe ESLint no projeto e `npm run lint` era "
        "apelido para `vite build` — nunca checou nada. Sem trava, os 870 voltam.\n\n"
        "**Feito:** scripts/verificar-tokens.mjs, sem dependência nova, sai com código "
        "1 e aponta arquivo e linha. Ligado no `npm run lint`.",
        "Done", "High", "2", "design-system,tooling", "Design System",
    ),
    (
        "Extrair componentes Botao, Card, Campo e Selo",
        "941 blocos `style={{ }}` inline. Componentizar reduz para a ordem de 200 e "
        "torna a interface consistente.",
        "Todo", "Medium", "8", "design-system,frontend", "Design System",
    ),
    (
        "Escala tipográfica fluida com clamp()",
        "325 fontSize em px fixo contra 32 clamp(). Texto não acompanha a viewport.",
        "Todo", "Medium", "3", "design-system,frontend", "Design System",
    ),
    (
        "Quebrar arquivos acima de 400 linhas",
        "AgenticChatbotBuilder 688, LandingPage 625, TemplatesView 556, LeadsView 539, "
        "PixelTetris 471, componentRetrieval 436, FaultyTerminal 430, "
        "CreateSiteWizardView 404.",
        "Backlog", "Low", "8", "frontend,divida-tecnica", "Design System",
    ),

    # ── Persistência ────────────────────────────────────────────────────
    (
        "Ligar o editor de sites no Supabase",
        "documentDB.js era um mock em localStorage: cliente limpava o cache e perdia "
        "todos os sites. Também era a causa do projectId órfão que abria o editor "
        "vazio (tela cinza).\n\n"
        "**Feito:** src/services/documentDB.js fala com o backend; mock removido. "
        "GET /api/sites, GET /api/sites/detail, POST /api/sites, todos filtrando por "
        "user_id no servidor (o schema revoga acesso de anon/authenticated, então o "
        "navegador não fala com o Postgres direto).\n\n"
        "Site inexistente devolve 404 explícito em vez de undefined silencioso.",
        "Done", "Urgent", "8", "persistencia,backend,frontend", "Persistência",
    ),
    (
        "Histórico de versões dos sites",
        "**Feito:** cada save grava em site_versoes; o detalhe devolve as 10 últimas. "
        "O número da versão é decidido no servidor — duas abas abertas não gravam a "
        "mesma versão.",
        "Done", "High", "3", "persistencia,backend", "Persistência",
    ),
    (
        "Migração dos sites que estão no localStorage",
        "**Feito:** roda uma vez por navegador ao abrir Projetos. O localStorage antigo "
        "NÃO é apagado: se a migração falhar no meio, o dado original continua lá para "
        "nova tentativa.",
        "Done", "High", "2", "persistencia,frontend", "Persistência",
    ),
    (
        "Cota de sites por plano",
        "**Feito:** cobrada só na criação — cobrar a cada save puniria quem edita o "
        "próprio site e esvaziaria o plano em minutos.",
        "Done", "Medium", "2", "persistencia,backend", "Persistência",
    ),
    (
        "Validar persistência ponta a ponta com conta real",
        "Login → gerar site → F5 → o site continua em Projetos.\n\n"
        "Não foi verificado: exige entrar com credencial do dono. Tudo que dava para "
        "checar sem isso foi checado (endpoints 401 sem token, 3 tabelas acessíveis, "
        "tabela sites vazia confirmando que nada era salvo, 23 testes verdes).\n\n"
        "**Responsável: Victor.**",
        "Todo", "Urgent", "1", "persistencia,validacao", "Persistência",
    ),
    (
        "Endpoint DELETE de site",
        "O CRUD está sem remoção. Não estava no plano original, mas o operador vai "
        "acumular rascunho.",
        "Todo", "Medium", "2", "persistencia,backend", "Persistência",
    ),
    (
        "Unificar o vocabulário de status_crm",
        "Hoje há três vocabulários para a mesma coisa: o backend devolve 'Base', o "
        "gerador local usava 'Leads em Aberto' e o painel fala 'Abordados'. As colunas "
        "do CRM são 'Leads em Aberto', 'Em Negociação', 'Agendados', 'Convertidos', e "
        "o dashboard exibe 'Abordados', 'Follow Up' e 'Perdidos', que não existem como "
        "coluna.\n\n"
        "Contornado com o marcador `enviado_crm`, mas a raiz continua.",
        "Todo", "High", "3", "divida-tecnica,backend,frontend", "Persistência",
    ),

    # ── Acessibilidade e SEO ────────────────────────────────────────────
    (
        "Nome acessível em todos os inputs e botões só com ícone",
        "**Feito:** 13 de 13 inputs com rótulo; aria-* de 25 para 36.\n\n"
        "Registrado para não ser reaberto: `role=` continua em 0 e está correto — o "
        "app usa 10 landmarks nativos (<main>, <nav>, <aside>, <footer>), e elemento "
        "semântico nativo dispensa role sobreposto. O :focus-visible já existia.",
        "Done", "High", "3", "acessibilidade,frontend", "Acessibilidade e SEO",
    ),
    (
        "Medir Lighthouse de acessibilidade no painel e no site gerado",
        "Critério do plano: ≥ 90. Precisa ser medido no navegador, não estimado.",
        "Todo", "Medium", "2", "acessibilidade,validacao", "Acessibilidade e SEO",
    ),

    # ── Integridade de Dados ────────────────────────────────────────────
    (
        "Nunca inventar telefone quando a varredura falha",
        "O fallback do frontend gerava leads com telefone sorteado — "
        "`(16) 99` + dígitos aleatórios — sem marcar is_demo. Os cards apareciam como "
        "reais com botões liberados: o operador podia mandar mensagem comercial para "
        "o número de um desconhecido.\n\n"
        "O backend tem teste contra isso (test_modo_demo_nunca_inventa_contato); o "
        "frontend passava por fora.\n\n"
        "**Feito:** contato vira null, lead marcado como demonstração (botões travam "
        "pela regra que já existia), e o log diz o motivo real da falha em vez de "
        "fingir sucesso.",
        "Done", "Urgent", "2", "integridade,frontend", "Integridade de Dados",
    ),
    (
        "Leads de exemplo não podem entrar no funil sozinhos",
        "O gerador local marcava status_crm 'Leads em Aberto', o que jogava os 30 "
        "exemplos direto na primeira coluna do CRM sem ninguém ter enviado nada — "
        "esvaziando o sentido do botão.\n\n"
        "**Feito:** usam 'Base', igual ao backend. Verificado: funil em 0 sem enviar.",
        "Done", "High", "1", "integridade,frontend", "Integridade de Dados",
    ),

    # ── Correções de UX ─────────────────────────────────────────────────
    (
        "Enviar para CRM não deve trocar de aba nem manter o card na lista",
        "Dois sintomas, uma causa: os leads da varredura viviam em estado local do "
        "LeadsView. A aba desmonta ao trocar de menu, então a varredura sumia ao ir "
        "no Funil e voltar; e o botão atualizava a lista do App enquanto a tela "
        "desenhava a cópia local.\n\n"
        "Além disso, handleSendToCRM marcava 'Abordados', status que não existe como "
        "coluna — o lead sumia da triagem e não aparecia no funil.\n\n"
        "**Feito:** estado subiu para o App; marcador `enviado_crm`. Verificado: "
        "33→32 cards, lead aparece no funil, 32 preservados ao voltar da aba.",
        "Done", "High", "3", "bug,frontend", "Correções de UX",
    ),
    (
        "Página descia sozinha durante a varredura",
        "`scrollIntoView` rola todos os ancestrais roláveis, inclusive o documento. "
        "Como o backend emite uma linha de log por lugar encontrado, a página descia "
        "durante a varredura inteira.\n\n"
        "**Feito:** scrollTop no próprio console, e não arrasta de volta se o operador "
        "subiu para reler. Verificado com instrumentação: zero chamadas de rolagem, "
        "scrollY fixo durante a varredura.",
        "Done", "High", "2", "bug,frontend", "Correções de UX",
    ),

    # ── Internacionalização ─────────────────────────────────────────────
    (
        "Camada de i18n (pt-BR / en / es)",
        "src/i18n/ não existe; strings em português direto no JSX. Não bloqueia nada "
        "hoje, mas cada tela nova encarece a extração.\n\n"
        "Inclui formato de telefone por país, termos de busca por locale e "
        "LOCALE_PADRAO/PAIS_PADRAO no .env.",
        "Backlog", "Low", "13", "i18n,frontend", "Internacionalização",
    ),

    # ── Deploy ──────────────────────────────────────────────────────────
    (
        "Domínio próprio servindo o bucket R2",
        "Hoje publica em pub-*.r2.dev, o domínio padrão da Cloudflare. Funciona, mas o "
        "cliente vê uma URL que não é a marca dele.",
        "Todo", "High", "3", "deploy,infra", "Deploy",
    ),
    (
        "Worker de CNAME para domínio do cliente",
        "site.cliente.com.br apontando para o site gerado. Tem apelo comercial forte — "
        "pode furar a fila se virar objeção de venda.",
        "Todo", "Medium", "5", "deploy,infra", "Deploy",
    ),
    (
        "Botão Publicar com estado real",
        "`publicado: true` só quando o site está de fato no ar. O motor de storage já "
        "distingue upload de publicação (cdn_url só existe com domínio configurado); "
        "falta a UI refletir isso.",
        "Todo", "Medium", "3", "deploy,frontend", "Deploy",
    ),
    (
        "Pixel do Facebook e GTM injetáveis no <head> do site gerado",
        "Rastreamento é o que permite provar resultado para o cliente.",
        "Backlog", "Low", "3", "deploy,motor-sites", "Deploy",
    ),

    # ── Qualidade ───────────────────────────────────────────────────────
    (
        "Testes end-to-end com Playwright",
        "Hoje há 23 testes de backend e nenhum de jornada. Os bugs mais caros desta "
        "sessão (tela cinza, card que não sai da lista, varredura apagada ao trocar "
        "de aba) só apareceriam em teste de jornada.",
        "Todo", "High", "8", "qualidade,testes", "Qualidade",
    ),
    (
        "Reduzir o peso do SiteEditorView",
        "216 KB (53 KB gzip), o maior chunk depois do index. Vale investigar o que "
        "está sendo importado de forma síncrona.",
        "Backlog", "Low", "3", "performance,frontend", "Qualidade",
    ),
]

CABECALHO = ["Title", "Description", "Status", "Priority", "Estimate", "Labels", "Project"]


def main() -> None:
    """Escreve o CSV com escape correto e imprime um resumo."""
    with open(SAIDA, "w", encoding="utf-8", newline="") as f:
        escritor = csv.writer(f, quoting=csv.QUOTE_ALL)
        escritor.writerow(CABECALHO)
        escritor.writerows(ISSUES)

    from collections import Counter
    por_status = Counter(i[2] for i in ISSUES)
    por_projeto = Counter(i[6] for i in ISSUES)

    print(f"{len(ISSUES)} issues -> {SAIDA}\n")
    print("Por status:")
    for k, v in por_status.most_common():
        print(f"  {k:<10} {v}")
    print("\nPor projeto:")
    for k, v in por_projeto.most_common():
        print(f"  {k:<26} {v}")


if __name__ == "__main__":
    main()
