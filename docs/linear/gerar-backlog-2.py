# -*- coding: utf-8 -*-
"""
Segundo lote de issues do REPASS AI para o Linear.

Cobre o que apareceu DEPOIS da primeira importação: o pipeline de templates
em 5 camadas, os defeitos encontrados durante a construção dele, e a dívida
nova que ele criou.

Não repete nada do primeiro CSV — importar os dois não gera duplicata.

Uso:
    python docs/linear/gerar-backlog-2.py
"""

import csv
import os

BASE = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(BASE, "backlog-repass-ai-2.csv")

# (Título, Descrição, Status, Prioridade, Estimativa, Labels, Projeto)
ISSUES: list[tuple[str, str, str, str, str, str, str]] = [

    # ── Pipeline de templates: o que foi construído ────────────────────
    (
        "Pipeline de templates em 5 camadas",
        "O motor antigo tinha ~25 regras escritas à mão, cada uma procurando uma "
        "frase específica em francês de UM template. Nenhuma funcionava nos 7 "
        "templates novos, que chegaram em 6 idiomas (ingles, catalao, alemao, "
        "bulgaro, espanhol, frances). Manter aquele método exigiria ~200 regras "
        "impossíveis de revisar.\n\n"
        "**Feito:** catálogo (nicho→template), preparador (extrai texto por "
        "POSIÇÃO em bytes, funciona em qualquer idioma), classificador com IA, "
        "compilador e seletor.\n\n"
        "**Divisão que sustenta o produto:** IA roda uma vez por template "
        "(~90s, ~R$ 0,40); gerar site é troca de texto (14ms, R$ 0,00).\n\n"
        "**Aceite:** 12 nichos compilando e aprovados na auditoria. Verificado.",
        "Done", "Urgent", "13", "motor-sites,arquitetura", "Motor de Sites",
    ),
    (
        "Traduzir e classificar os 8 templates para pt-BR",
        "935 trechos de texto processados, **nenhum perdido**.\n\n"
        "Cada trecho recebe um destino: `traduzir` (interface), `variavel` "
        "(vira {{NOME}}, {{ENDERECO}}...) ou `adaptar` (produto do dono "
        "original vira equivalente brasileiro).\n\n"
        "Sem essa separação o site sairia em português falando de outra "
        "empresa — traduzir 'Little Latte Cafe' não resolve nada.\n\n"
        "**Repescagem:** a IA pulava trechos em silêncio; um deles era um CEP "
        "canadense. Segunda passada recuperou 28 trechos em 3 templates.",
        "Done", "Urgent", "8", "motor-sites,conteudo", "Motor de Sites",
    ),
    (
        "Remover o rastreador do 77lib dos sites entregues ao cliente",
        "Todo template do 77lib embute o Google Analytics deles "
        "(`G-2M6V79H761`). Confirmado em 2 templates distintos, ou seja, é "
        "sistemático. Cada visitante do site do SEU cliente era contado por "
        "outra empresa.\n\n"
        "**Feito:** 17 scripts removidos na preparação dos 8 templates.",
        "Done", "High", "2", "motor-sites,privacidade", "Motor de Sites",
    ),
    (
        "Auditoria: bloquear moeda estrangeira no site gerado",
        "Uma padaria em Franca saiu com o cardápio em dólar ($6, $7, $5) e a "
        "auditoria aprovou. Causa dupla: o filtro de extração descartava '$6' "
        "como 'texto sem valor', e a auditoria não checava moeda.\n\n"
        "**Feito:** extração passou a capturar preço e telefone; auditoria "
        "ganhou a regra. 45 preços neutralizados nos 8 templates.\n\n"
        "**Decisão de produto:** todo preço vira 'Sob consulta'. Não sabemos o "
        "que o cliente cobra, e a IA provou que inventa — escreveu 'Entrada: "
        "R$ 1.000.000' numa pousada e '$ 50' num template búlgaro.",
        "Done", "Urgent", "3", "motor-sites,integridade", "Integridade de Dados",
    ),
    (
        "Trava de alinhamento entre plano de tradução e extração",
        "O plano guarda posições por id. Quando a extração passou a capturar "
        "telefones, o número de trechos mudou em 5 templates e os ids "
        "deslocaram — o plano colaria cada texto no lugar errado, produzindo "
        "uma página embaralhada SEM erro nenhum aparecendo.\n\n"
        "**Feito:** verificação que compara plano e extração e se recusa a "
        "gerar quando divergem. Pegou os 5 exatos.",
        "Done", "High", "2", "motor-sites,qualidade", "Motor de Sites",
    ),
    (
        "Corrigir regra de marcas que destruía classificações corretas",
        "A regra que força a marca do template original a virar {{NOME}} "
        "olhava o texto ORIGINAL. Resultado: 'hello@exoape.com' já tinha sido "
        "corretamente classificado como {{EMAIL}}, mas a regra via "
        "'exoape.com' no original e sobrescrevia com {{NOME}}.\n\n"
        "O site sairia com o nome da empresa nos campos de e-mail, telefone, "
        "endereço, cidade e estado.\n\n"
        "**Feito:** a regra só age se o resíduo sobreviveu no RESULTADO.",
        "Done", "Urgent", "1", "motor-sites,bug", "Motor de Sites",
    ),
    (
        "Substituir contatos do template original que ficam em atributos",
        "A extração de texto só enxerga o que está entre tags, então "
        "`href=\"mailto:hello@exoape.com\"` sobrevivia intacto em 3 templates. "
        "O site do cliente saía com o e-mail da agência holandesa.\n\n"
        "**Feito:** reescrita de `mailto:` e `tel:` no compilador.",
        "Done", "High", "1", "motor-sites,bug", "Motor de Sites",
    ),
    (
        "Trocar o vídeo do negócio original por imagem do nicho",
        "O template genérico tocava o vídeo institucional da agência holandesa "
        "no site do cliente. Estava em `<video><source>`, que a troca de "
        "imagens não alcançava.\n\n"
        "**Feito:** o `<source>` sai e o `<video>` ganha um `poster` com a "
        "imagem do nicho — quadro estático coerente até o dono subir o dele.",
        "Done", "High", "2", "motor-sites,bug", "Motor de Sites",
    ),

    # ── Persistência ───────────────────────────────────────────────────
    (
        "Corrigir HTTP 409 ao salvar site (duplicate key)",
        "Erro visível no terminal do operador:\n\n"
        "`duplicate key value violates unique constraint \"sites_user_slug_idx\"`\n\n"
        "O handler fazia SELECT para checar existência e só então INSERT. Entre "
        "os dois havia uma brecha: o editor e o chatbot salvam quase juntos, os "
        "dois liam 'nao existe' e os dois tentavam criar. O segundo batia na "
        "trava do banco.\n\n"
        "**Feito:** `upsert` com `on_conflict=user_id,slug` — o Postgres decide "
        "entre criar e atualizar numa operação só. Cota passou a ser cobrada "
        "apenas quando o registro nasce.",
        "Done", "Urgent", "2", "persistencia,backend,bug", "Persistência",
    ),

    # ── Loja de templates ──────────────────────────────────────────────
    (
        "Publicar os 8 templates na loja, sem preço",
        "A loja mostrava 2 templates, ambos por R$ 19,90 — valor que vinha "
        "fixo do backend (`PRECO_PADRAO_CENTAVOS = 1990`). Todo template "
        "importado nascia com preço que ninguém decidiu.\n\n"
        "**Feito:** preço padrão zero, selo escondido quando não há valor, e "
        "os 8 templates do catálogo importados. Loja com 9.",
        "Done", "Medium", "3", "loja,frontend", "Loja de Templates",
    ),
    (
        "Decidir: tela para editar preço de template, ou editar o arquivo?",
        "Hoje o preço é um número na ficha JSON "
        "(`data/templates_store/<slug>.json`, campo `preco_centavos`, em "
        "centavos).\n\n"
        "Construir a tela agora só faz sentido se ela for usada logo. Se a "
        "definição de preço ficar para quando o produto estiver vendendo, a "
        "tela passa semanas parada e apodrece.\n\n"
        "**Decisão do Victor.**",
        "Todo", "Low", "3", "loja,decisao", "Loja de Templates",
    ),
    (
        "Unificar loja de templates e catálogo do gerador",
        "São duas listas separadas hoje: a loja lê de "
        "`data/templates_store/`, o gerador lê de `template_catalog.json`.\n\n"
        "Estão iguais agora, mas nada garante que continuem. Importar um "
        "template pela loja NÃO o torna disponível para o gerador — e o "
        "sintoma disso aparece semanas depois, como 'template que não aparece'.",
        "Todo", "High", "5", "loja,arquitetura,divida-tecnica", "Loja de Templates",
    ),

    # ── Mídia e acabamento ─────────────────────────────────────────────
    (
        "Permitir que o dono envie fotos e vídeo do próprio negócio",
        "Hoje o site usa fotos do Google Places ou uma imagem genérica do "
        "nicho, e a seção 'Experiência Ao Vivo' mostra um quadro estático.\n\n"
        "É o que mais aproxima o site gerado de um site feito à mão.\n\n"
        "Inclui: campo de upload, guardar no R2 por site, e usar no compilador "
        "no lugar da imagem de nicho.",
        "Todo", "High", "8", "motor-sites,frontend,deploy", "Motor de Sites",
    ),
    (
        "Templates carregam Tailwind de CDN externo",
        "Todo site gerado busca `cdn.tailwindcss.com` a cada visita. Se o "
        "serviço cair ou ficar lento, o site do cliente aparece quebrado. A "
        "própria documentação do Tailwind diz que esse modo não é para "
        "produção.\n\n"
        "Vira problema real quando houver dezenas de clientes pagando.",
        "Todo", "Medium", "5", "motor-sites,infra,risco", "Motor de Sites",
    ),
    (
        "Nome de produto e descrição descolam na adaptação",
        "Cada trecho é adaptado isoladamente, então o par nome+descrição perde "
        "a relação. Exemplo real no site da padaria:\n\n"
        "**PÃO DE QUEIJO** — *'Brilhante, refrescante, divertido e feito para "
        "o descanso da tarde.'*\n\n"
        "A descrição veio do 'Strawberry Dirty Soda' original. Não impede a "
        "venda, mas é perceptível.\n\n"
        "**Correção:** agrupar nome e descrição no mesmo pedido à IA, olhando "
        "a estrutura do HTML.",
        "Todo", "Medium", "5", "motor-sites,conteudo", "Motor de Sites",
    ),
    (
        "Sem template próprio para petshop, academia e comércio geral",
        "Esses nichos caem no template Genérico Editorial. Funciona, mas o "
        "site fica com cara de agência de design, não de petshop.\n\n"
        "**O que fazer:** escolher 3 templates na biblioteca do 77lib e "
        "adicionar ao catálogo — cada um é 1 objeto em `template_catalog.json` "
        "mais uma rodada do classificador.",
        "Todo", "Medium", "5", "motor-sites,catalogo", "Motor de Sites",
    ),

    # ── Verificação ────────────────────────────────────────────────────
    (
        "Abrir os 12 sites gerados e revisar a aparência",
        "A auditoria garante que não há resíduo, moeda estrangeira, marcador "
        "vazio nem idioma errado. Ela **não julga se a página está bonita**.\n\n"
        "O texto sobrepondo o menu passou por todas as regras e só foi pego "
        "olhando a tela.\n\n"
        "Arquivos em `backend/data/77lib_catalog/generated_*.html`.\n\n"
        "**Responsável: Victor.** Não precisa de código — precisa de olho.",
        "Todo", "Urgent", "2", "qualidade,validacao", "Qualidade",
    ),
    (
        "Investigar lentidão do llm_gateway na importação de templates",
        "Um template de 56 trechos levou 11 minutos, contra ~90s dos outros. "
        "O gateway estava saudável no mesmo momento (0,4s numa chamada de "
        "teste).\n\n"
        "Causa provável: `TIMEOUT_PADRAO = 45s` por chamada, com rodízio entre "
        "4 provedores e várias chaves. Uma única chamada pode consumir minutos "
        "esperando provedores que não respondem antes de chegar num que "
        "funciona.\n\n"
        "**Ideia:** reduzir o timeout, ou reordenar o rodízio pelo provedor que "
        "respondeu por último.",
        "Todo", "Medium", "3", "backend,performance", "Qualidade",
    ),

    # ── Documentação ───────────────────────────────────────────────────
    (
        "Documentar arquitetura, roadmap e fluxos visuais",
        "**Feito:**\n"
        "- `docs/ARQUITETURA.md` — mapa do sistema, as 5 camadas, as 8 redes "
        "de proteção com o defeito real que cada uma impediu, fluxos em "
        "diagrama de sequência, endereços de arquivo e decisões técnicas\n"
        "- `docs/ROADMAP.md` — linha do tempo, ordem recomendada, decisões em "
        "aberto e riscos\n"
        "- `docs/arquitetura-visual.html` — página navegável com os "
        "fluxogramas renderizados\n\n"
        "O foco foi registrar o PORQUÊ de cada proteção, não só o que ela faz "
        "— é o que se perde com o tempo e leva alguém a removê-la por parecer "
        "exagero.\n\n"
        "**Medição:** 20.471 linhas escritas (o repositório tem 135.768, mas a "
        "diferença é arquivo gerado).",
        "Done", "High", "5", "documentacao", "Qualidade",
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
    print(f"{len(ISSUES)} issues -> {SAIDA}\n")
    for rotulo, indice in (("status", 2), ("projeto", 6)):
        print(f"Por {rotulo}:")
        for chave, n in Counter(i[indice] for i in ISSUES).most_common():
            print(f"  {chave:<24} {n}")
        print()


if __name__ == "__main__":
    main()
