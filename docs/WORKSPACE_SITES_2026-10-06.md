# Continuação — workspace de sites

## Implementado
- Automações substituído por planejador manual de pipelines de sites, sem catálogo de agentes ou iframe n8n.
- Sete etapas iniciais: briefing, referências/conteúdo, template, criação, revisão responsiva, aprovação e entrega.
- Criar/excluir pipelines, concluir etapas, reordenar, adicionar/remover etapas.
- Base de Conhecimento refeita como biblioteca de referências por projeto: marca, conteúdo, requisitos técnicos e referências visuais; criação/edição/exclusão, pesquisa e filtro.
- Novos rascunhos em chaves locais por conta. Componentes remontam ao mudar identidade. Isso não substitui autorização no servidor nem protege dados de quem usa o mesmo computador.
- Chaves legadas não apagadas nem importadas automaticamente para evitar atribuir dados de titular desconhecido.
- Formulários: armazenamento novo por conta, exemplos como rascunho sem respostas fictícias, segmento mapeado corretamente; publicação e compartilhamento indisponíveis até integração real.
- Testar formulário não gera lead ou telefone fictício, não incrementa envios nem promete entrega externa.
- Ajustes de layout mobile para Formulários e Prospector, preservando a pesquisa via API.

## Testes
- Compilação de produção passou.
- scripts/verificar-modulos-sites.mjs: abertura das quatro abas, criação de pipeline com sete etapas, adicionar etapa, concluir briefing, cadastrar referência por projeto e buscar sem resultado.
- Após recarregar, pipeline e etapa concluída persistem.
- Quatro abas sem overflow horizontal em 390×844, 768×1024, 1360×768 e 1920×1080; screenshots gravados em docs/modulo-*.png.
- Conferência visual em amostras de desktop e mobile. Testes usam API simulada; não comprovam conexão real com motores externos.

## Limites
- Planejador não executa geração nem publica sites automaticamente.
- Biblioteca não alimenta o LLM/RAG automaticamente.
- Rascunhos locais, sem sincronização entre dispositivos.
- Não foi criado endpoint público de formulário nem alterada RLS de produção.
- Próxima etapa: persistência e vínculo de projetos no servidor com autorização, migração revisada e integração dos briefings/referências ao gerador.
- Nenhum commit, push ou deploy desta etapa.
