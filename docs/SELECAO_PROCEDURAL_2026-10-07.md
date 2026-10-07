# Seleção de modelos por briefing

O editor de novos projetos consulta o catálogo local e classifica templates por termos da categoria/orientação. Grupos bilíngues aproximam nichos PT-BR dos títulos/descritivos em inglês. Resultado ordenado deterministicamente, com razões armazenadas no documento. Se há correspondência, carrega HTML original em vez de executar pipeline básico/IA; sem correspondência, permanece o fluxo local anterior.

Classificação é heurística, não aprendizado comprovado ou recomendação universal. Nichos de saúde/beleza foram agrupados amplamente e podem produzir modelo apenas aproximado; seleção manual na loja permanece disponível. A copy/imagens originais não são automaticamente empresariais: documento recebe requiresContentReview e aviso no painel. Não deve ser entregue sem revisão.

Corrigido envio dos leads reais ao wizard. Retirada alegação falsa de fotos capturadas via Google no log do planner clássico e desativada sugestão implícita de geração de fotos reais por IA. Fotos de estoque permanecem apenas fallback ilustrativo naquele fluxo, não fotos verificadas da empresa.

Evidências: ranking em 7 categorias conhecidas, ordem reproduzível e categoria desconhecida com score zero; abertura manual de template sem POST aprovada; build aprovado.

`scripts/verificar-briefing-procedural.mjs`: fluxo real da interface Descrever → Gerar → HTML original recomendado no editor e aviso de revisão, sem POST, em 390/768/1360/1920; sem overflow horizontal do documento principal. Valida retorno ao wizard com botão Gerar habilitado (corrigido estado de compilação preso). Sessão/API simuladas. Não mede overflow interno, fidelity, tempo de carga ou efeitos 3D dos 61 previews.

Ainda faltam ajuste semântico, substituição de fotos/contatos e gravação com conta real. Não publicado nesta etapa.
