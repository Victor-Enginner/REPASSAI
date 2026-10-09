# Publicação confirmada — 7 de outubro de 2026

- Repositório autorizado: https://github.com/Victor-Enginner/Repass-Ai
- main: a2e5664 (workspace) e 819a240 (catálogo completo).
- Nenhum push para Victor-Enginner/REPASSAI.
- Netlify produção: https://repass-ai-beta.netlify.app
- Deploy final: 6ac5d2c41dad390465720aaa; artefato compilado do commit 819a240.
- 61 fichas JSON, previews HTML, ZIPs e miniaturas no pacote estático do site.
- Registry tokens removidos dos arquivos públicos. Previews com sandbox, sem formulários/popups, sem conexões ou navegação na origem autenticada.
- Verificação pública: catalog.json retorna 61 templates; todos os 244 arquivos (ficha, HTML, ZIP, JPEG por template) retornam HTTP 200 com tipo esperado; previews têm CSP sandbox; /api/auth/status responde JSON 200.
- Teste local de integridade de todos os ZIPs passou.
- API do Render não alterada. Seu catálogo ainda é separado; a loja usa o catálogo completo estático do Netlify.
- Agenda e novos rascunhos continuam locais por conta; nenhum schema/RLS foi alterado.
- Atualização de produção feita por CLI. Não foi configurado um novo vínculo automático GitHub–Netlify.
