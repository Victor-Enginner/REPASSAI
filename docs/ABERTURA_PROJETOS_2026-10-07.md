# Abertura de projetos — etapa do objetivo maior

## Implementado localmente
- Identificador original propagado da lista para editor e gravação por comando.
- Documento existente não é regenerado ao abrir, mesmo sem HTML físico.
- HTML salvo renderizado em iframe isolado; blocos declarativos usam SchemaRenderer.
- Formato legado com HeroAnimated recupera preview por compilador local (hero e cards), sem tokens ou sobrescrita. Outros formatos ainda mostram aviso.
- Compilador escapa conteúdo, valida cor/contato e não inventa telefone. Download preserva HTML existente.
- Falha de leitura/projeto ausente mostra mensagem explícita.
- Removida migração automática de dados globais do navegador e exemplos fictícios na lista.

## Evidências
- `node scripts/test-project-preview.mjs`: identidade e classificação aprovadas.
- `node scripts/verificar-abertura-projetos.mjs`: browser com API simulada; HTML, legado e ausente, zero POST na abertura.
- `node scripts/test-site-compiler.mjs`: conteúdo hostil, cor inválida e contato ausente/real aprovados.
- `npm run build`: aprovado após conexão do preview legado.

## Ainda incompleto
- Compatibilidade integral dos demais componentes legados (preview atual contempla hero/cards, não todos os efeitos/galerias).
- Editor visual de textos, fontes e componentes; geração procedural completa com templates.
- Teste ponta a ponta com conta real/backend e publicação destas alterações.
- Pesquisa científica, adaptação de mídia empresarial com direitos e entrega final conforme objetivo original.

Os 61 templates estáticos já publicados não provam conclusão do gerador/editor.
