# Mapa estrutural dos templates

61 templates analisados localmente, com rede bloqueada e DOMParser inerte: 7.234 nós de texto, 468 imagens e 380 seções. Resultado em `public/templates/structure.json`, com hash SHA-256 do HTML, caminhos de elementos/nós, hosts externos e indicadores de canvas/model-viewer/scripts/forms.

`scripts/mapear-templates.mjs` regenera o mapa. `scripts/test-template-structure.mjs` reproduz mapas dos 61 arquivos e valida edição literal, rejeição de conteúdo original divergente e preservação de estrutura/imagem numa fixture. Não executa scripts de templates. Não prova qualidade visual, uso offline, licença de recursos ou semântica empresarial.

`applyTemplateTextEdits` é a operação inicial do motor local: aplica mudanças de texto por endereço estrutural, com limites e validação. Não toca scripts, estilos ou SVG, não chama IA, não substitui nomes/imagens de empresas automaticamente. Atribuição semântica de slots e integração ao editor continuam pendentes.

## Pesquisa que orienta a representação

Lida a seção metodológica 2.2–2.3 de [Exploring Mobile UI Layout Generation using Large Language Models Guided by UI Grammar](https://arxiv.org/html/2310.15455v1). Ela define regras de produção entre pais e filhos e usa JSON como representação hierárquica. A aplicação inferida para REPASS é preservar hierarquia em vez de substituir a página inteira por uma geração de código livre. O trabalho usa LLMs e dados móveis; não demonstra este motor determinístico nem sua fidelidade visual. Ainda falta revisão dos experimentos e limites do texto integral e demais pesquisas do objetivo.

O mapa é estrutura observada, não gramática aprendida nem interpretação confiável de quais fotos/textos pertencem a uma marca. Próximas etapas exigem revisão de slots empresariais, restrições responsivas, comparação visual e fontes/mídias licenciadas.
