# Geração local como padrão

Os dois serviços de geração frontend agora só consultam modelo com `opcoes.usarIA === true`. Planner clássico entrega estrutura de regras; gerador moderno usa retrieval e schema local validado, sem tentativas de modelo. Isto não prova ausência de custo em toda a aplicação: compilação backend, enriquecimento Google e comandos de ajuste têm fluxos separados ainda a revisar.

Teste `scripts/verificar-geracao-sem-tokens.mjs` em navegador real/Vite, interceptando APIs: 0 requisições durante invocação dos serviços, 3 componentes clássicos e 4 blocos modernos, 0 tentativas. Não é teste completo de gerar/salvar/publicar com conta real.

## Pesquisa e decisão

Revisadas seções experimentais e discussão de [UI Grammar](https://arxiv.org/html/2310.15455v1): ensaio preliminar com 192 telas e GPT-4; gramática elevou MaxIoU de 0,29 a 0,34, mas piorou sobreposição de 8,14 a 12,47. Não é prova de qualidade universal nem geração sem tokens. A decisão de produto inferida é separar regras de estrutura e verificações mensuráveis; modelo opcional não pode ser requisito para abrir, adaptar ou compilar um template existente.

Pendências: seleção procedural de templates por briefing, copy verificável, substituir fotos genéricas e logs que alegam captura Google, evitar schema local reduzido substituir o template completo, editor canvas, estilos/fontes locais, backend e produção. Pesquisa SIGI ainda não revisada integralmente nesta etapa.
