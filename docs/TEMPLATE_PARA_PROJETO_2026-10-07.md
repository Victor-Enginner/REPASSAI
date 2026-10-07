# Template real para projeto editável

O botão da loja agora cria identidade nova por crypto.randomUUID, preserva slug da origem e carrega HTML estático real. Não presume cidade de Goiânia. Não executa pipeline de IA nem grava automaticamente. Gravação ocorre pelo botão explícito do editor.

Carregamento valida identificador simples, resposta HTTP e MIME HTML. Preview isolado em iframe sandbox. Ainda não substitui automaticamente copy empresarial, imagens, metadados internos do template ou suas integrações: isso precisa de mapeamento semântico e revisão.

`scripts/verificar-template-editor.mjs` comprovou abertura do HTML real do primeiro template local, editor textual disponível e zero POST ao abrir com sessão/API simuladas. Não prova funcionamento integral de todos os efeitos nem save com conta real. Build aprovado.

## Pesquisa inicial — resumos, não revisão integral

- [UI Layout Generation with LLMs Guided by UI Grammar](https://arxiv.org/abs/2310.15455): gramática representa hierarquia e busca controle da geração; estudo usa LLM, portanto não comprova geração sem tokens. Direção inferida para REPASS: representar seções/slots e contratos explícitos, executados por regras locais.
- [Shape Inference and Grammar Induction for Example-based Procedural Generation](https://arxiv.org/abs/2109.10217): indução de gramática interpretável de exemplos de construções 3D em grade/Minecraft. Domínio diferente de websites; inspiração, não prova de aplicabilidade direta.

Próxima pesquisa precisa ler métodos/texto integral, relacionar com catálogo real e testar seleção/composição/adaptação de templates sem perda visual. Objetivo maior permanece pendente, incluindo editor tipo canvas, fontes licenciadas locais, mídia empresarial, backend, responsividade e produção.
