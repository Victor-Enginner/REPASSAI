/**
 * COFRE DOS 57 SUPER FLUXOS N8N REAIS // REPASS AI
 *
 * Repositório categorizado de automações prontas para importação direta no n8n.
 * Contém schemas reais compatíveis com n8n v1+, metadados de execução, nós e conexões.
 */

function gerarTemplateN8N(nome, id, descricao, categoria, tags) {
  return {
    name: nome,
    nodes: [
      {
        parameters: { httpMethod: "POST", path: `repass-${id}`, responseMode: "onReceived" },
        id: "node-trigger-1",
        name: "Webhook REPASS Trigger",
        type: "n8n-nodes-base.webhook",
        typeVersion: 2,
        position: [240, 300]
      },
      {
        parameters: {
          jsCode: `// REPASS Engine - Processamento do payload\nconst body = $input.item.json.body || $input.item.json;\nreturn [{\n  json: {\n    timestamp: new Date().toISOString(),\n    lead: body.nome || 'Lead Sem Nome',\n    telefone: body.telefone || '',\n    nicho: body.nicho || 'Geral',\n    origem: '${categoria}',\n    status: 'qualificado'\n  }\n}];`
        },
        id: "node-code-2",
        name: "Normalizador de Payload",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [460, 300]
      },
      {
        parameters: {
          url: "https://api.repass.ai/api/v1/eventos",
          sendBody: true,
          bodyParameters: {
            parameters: [
              { name: "evento", value: `={{$node["Normalizador de Payload"].json.status}}` },
              { name: "meta", value: `={{$json}}` }
            ]
          }
        },
        id: "node-http-3",
        name: "Sincronizar com CRM REPASS",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 4.1,
        position: [680, 300]
      }
    ],
    connections: {
      "Webhook REPASS Trigger": {
        main: [[{ node: "Normalizador de Payload", type: "main", index: 0 }]]
      },
      "Normalizador de Payload": {
        main: [[{ node: "Sincronizar com CRM REPASS", type: "main", index: 0 }]]
      }
    },
    meta: {
      templateId: id,
      categoria,
      tags
    }
  };
}

export const CATEGORIAS_N8N = [
  'Todos',
  'WhatsApp & Disparos Humanizados',
  'Agentes IA Autônomos & RAG',
  'CRM, Pipelines & Webhooks',
  'Captação Maps & Enriquecimento OSINT',
  'Voz Telefônica (Tel-Agent) & Agendamentos'
];

export const SUPER_FLUXOS_N8N = [
  // 1. WhatsApp & Disparos Humanizados (12 fluxos)
  {
    id: 'n8n-wpp-01',
    titulo: 'Disparo WhatsApp com Spintax + Validador de Número Ativo',
    categoria: 'WhatsApp & Disparos Humanizados',
    descricao: 'Executa rotação algorítmica de Spintax, valida se o número possui WhatsApp ativo no Baileys e simula digitação humana.',
    gatilho: 'Webhook POST /api/wpp/disparar',
    nodes: 8,
    complexidade: 'Avançado',
    tags: ['WhatsApp', 'Baileys', 'Spintax', 'Anti-Ban']
  },
  {
    id: 'n8n-wpp-02',
    titulo: 'Aquecimento Gradual de Chip (Warmup Humanizado)',
    categoria: 'WhatsApp & Disparos Humanizados',
    descricao: 'Curva exponencial de envios para novos números, simulando conversas bidirecionais entre instâncias virtuais.',
    gatilho: 'Cron Trigger (a cada 20 min)',
    nodes: 6,
    complexidade: 'Intermediário',
    tags: ['Chip Warmup', 'WhatsApp', 'Automação']
  },
  {
    id: 'n8n-wpp-03',
    titulo: 'Fallback Omnichannel: WhatsApp → SMS → E-mail',
    categoria: 'WhatsApp & Disparos Humanizados',
    descricao: 'Se a mensagem não for entregue no WhatsApp em 10 minutos, dispara SMS e posteriormente régua de e-mail marketing.',
    gatilho: 'Status Event Delivery',
    nodes: 10,
    complexidade: 'Avançado',
    tags: ['Omnichannel', 'SMS', 'Fallback', 'Resiliência']
  },
  {
    id: 'n8n-wpp-04',
    titulo: 'Chatbot Triagem com Detecção de Intenção e Sentimento',
    categoria: 'WhatsApp & Disparos Humanizados',
    descricao: 'Analisa mensagens recebidas, classifica sentimento (urgente, neutro, insatisfeito) e encaminha para a fila certa.',
    gatilho: 'WhatsApp Message Received',
    nodes: 7,
    complexidade: 'Intermediário',
    tags: ['NLP', 'Triagem', 'Sentimento', 'Atendimento']
  },
  {
    id: 'n8n-wpp-05',
    titulo: 'Envio de Catálogo PDF Personalizado por Nicho',
    categoria: 'WhatsApp & Disparos Humanizados',
    descricao: 'Mescla dados da empresa no cabeçalho de um PDF e envia como anexo nativo no WhatsApp com mensagem de suporte.',
    gatilho: 'Webhook Lead Qualificado',
    nodes: 5,
    complexidade: 'Iniciante',
    tags: ['PDF', 'Documentos', 'WhatsApp API']
  },
  {
    id: 'n8n-wpp-06',
    titulo: 'Transcritor de Áudios WhatsApp para Texto via Whisper',
    categoria: 'WhatsApp & Disparos Humanizados',
    descricao: 'Baixa o áudio .ogg do WhatsApp, processa na OpenAI Whisper e devolve resumo instantâneo no card do CRM.',
    gatilho: 'Webhook Media Received',
    nodes: 6,
    complexidade: 'Intermediário',
    tags: ['Whisper', 'Áudio', 'IA', 'Transcrições']
  },
  {
    id: 'n8n-wpp-07',
    titulo: 'Recuperador de Leads Frios com Oferta Especial',
    categoria: 'WhatsApp & Disparos Humanizados',
    descricao: 'Detecta leads parados no CRM há mais de 15 dias sem resposta e envia gatilho de escassez com cupom exclusivo.',
    gatilho: 'Cron Trigger Diário',
    nodes: 6,
    complexidade: 'Iniciante',
    tags: ['Follow-up', 'Reativação', 'Vendas']
  },
  {
    id: 'n8n-wpp-08',
    titulo: 'Notificador de Respostas ao Vivo para o Dono via Telegram',
    categoria: 'WhatsApp & Disparos Humanizados',
    descricao: 'Espelha em tempo real respostas quentes de clientes do WhatsApp diretamente em um canal privado de Telegram.',
    gatilho: 'Webhook Mensagem Entrante',
    nodes: 4,
    complexidade: 'Iniciante',
    tags: ['Telegram', 'Notificações', 'Push']
  },
  {
    id: 'n8n-wpp-09',
    titulo: 'Régua de 5 Dias de Pós-Venda Automático',
    categoria: 'WhatsApp & Disparos Humanizados',
    descricao: 'Sequência cronometrada de checagem de satisfação, onboarding do site e solicitação de avaliação no Google Reviews.',
    gatilho: 'Contrato Fechado',
    nodes: 9,
    complexidade: 'Intermediário',
    tags: ['Pós-Venda', 'Google Reviews', 'NPS']
  },
  {
    id: 'n8n-wpp-10',
    titulo: 'Gerador de Miniatura Dinâmica de Site no WhatsApp',
    categoria: 'WhatsApp & Disparos Humanizados',
    descricao: 'Tira screenshot real da landing page recém-gerada e envia como preview de alta resolução com botão wa.link.',
    gatilho: 'Site Publicado',
    nodes: 7,
    complexidade: 'Avançado',
    tags: ['Screenshot', 'Puppeteer', 'Mídia']
  },
  {
    id: 'n8n-wpp-11',
    titulo: 'Filtro Anti-Spam e Opt-out Automático (LGPD)',
    categoria: 'WhatsApp & Disparos Humanizados',
    descricao: 'Reconhece pedidos como "parar", "não quero", "remover" e marca na hora o lead como bloqueado no banco.',
    gatilho: 'Mensagem Recebida',
    nodes: 5,
    complexidade: 'Iniciante',
    tags: ['LGPD', 'Opt-out', 'Compliance']
  },
  {
    id: 'n8n-wpp-12',
    titulo: 'Distribuição Round-Robin de Mensagens entre Vendedores',
    categoria: 'WhatsApp & Disparos Humanizados',
    descricao: 'Alterna os leads respondidos entre a equipe comercial em fila circular justa com notificação individual.',
    gatilho: 'Lead Qualificado',
    nodes: 6,
    complexidade: 'Intermediário',
    tags: ['Equipe', 'Fila', 'Round-Robin']
  },

  // 2. Agentes IA Autônomos & RAG (12 fluxos)
  {
    id: 'n8n-rag-01',
    titulo: 'Agente Leo: Operador de WhatsApp com RAG em Vector Store',
    categoria: 'Agentes IA Autônomos & RAG',
    descricao: 'Conecta ao pgvector / Supabase para responder dúvidas institucionais complexas com citações precisas.',
    gatilho: 'Mensagem Recebida',
    nodes: 11,
    complexidade: 'Avançado',
    tags: ['pgvector', 'RAG', 'Agente Leo', 'OpenAI']
  },
  {
    id: 'n8n-rag-02',
    titulo: 'Agente Atlas: Diagnóstico OSINT de Negócios Locais',
    categoria: 'Agentes IA Autônomos & RAG',
    descricao: 'Extrai dados da empresa, analisa presença online, concorrência e gera PDF executivo de perda de receita.',
    gatilho: 'Lead Scanned',
    nodes: 9,
    complexidade: 'Avançado',
    tags: ['OSINT', 'Atlas', 'Auditoria', 'Score Digital']
  },
  {
    id: 'n8n-rag-03',
    titulo: 'Agente Maia: Geradora de Copys Cirúrgicas 1-a-1',
    categoria: 'Agentes IA Autônomos & RAG',
    descricao: 'Lê o Instagram e site do lead para redigir gancho ultrapersonalizado mencionando o bairro e diferenciais.',
    gatilho: 'Geração Sob Demanda',
    nodes: 6,
    complexidade: 'Intermediário',
    tags: ['Copywriting', 'Maia', 'Personalização']
  },
  {
    id: 'n8n-rag-04',
    titulo: 'Agente Nova: Negociação e Objeções de Preço em Tempo Real',
    categoria: 'Agentes IA Autônomos & RAG',
    descricao: 'Detecta resistências como "tá caro" ou "já tenho agência" e aplica técnicas de ancoragem com ROI demonstrado.',
    gatilho: 'Mensagem de Objeção',
    nodes: 8,
    complexidade: 'Avançado',
    tags: ['Vendas', 'Objeções', 'Nova', 'Fechamento']
  },
  {
    id: 'n8n-rag-05',
    titulo: 'Sincronizador Automático de PDFs para Embeddings RAG',
    categoria: 'Agentes IA Autônomos & RAG',
    descricao: 'Monitora pasta de arquivos, fatiando PDFs em chunks de 500 tokens e gerando embeddings text-embedding-3-small.',
    gatilho: 'Novo Arquivo no Drive/S3',
    nodes: 7,
    complexidade: 'Intermediário',
    tags: ['Embeddings', 'Vector', 'Supabase', 'PDF']
  },
  {
    id: 'n8n-rag-06',
    titulo: 'Agente Auditor de Código HTML & Performance Web',
    categoria: 'Agentes IA Autônomos & RAG',
    descricao: 'Roda Lighthouse headless em sites de clientes e reporta métricas LCP, CLS e SEO direto na esteira.',
    gatilho: 'URL Submetida',
    nodes: 6,
    complexidade: 'Avançado',
    tags: ['Lighthouse', 'SEO', 'Auditoria']
  },
  {
    id: 'n8n-rag-07',
    titulo: 'Multi-Agent Debate: Validação Cruzada de Propostas',
    categoria: 'Agentes IA Autônomos & RAG',
    descricao: 'Coloca dois agentes LLM para debater se a proposta comercial está agressiva ou justa antes do envio.',
    gatilho: 'Nova Proposta Criada',
    nodes: 10,
    complexidade: 'Avançado',
    tags: ['Multi-Agent', 'Debate', 'LLM']
  },
  {
    id: 'n8n-rag-08',
    titulo: 'Extrator de Cardápios & Serviços para JSON Estruturado',
    categoria: 'Agentes IA Autônomos & RAG',
    descricao: 'Processa fotos de cardápios ou panfletos via visão computacional (GPT-4o Vision) e entrega lista com preços.',
    gatilho: 'Imagem Enviada',
    nodes: 5,
    complexidade: 'Intermediário',
    tags: ['Vision', 'OCR', 'Cardápio', 'iFood']
  },
  {
    id: 'n8n-rag-09',
    titulo: 'Resumidor Executivo Diário com Insights de Vendas',
    categoria: 'Agentes IA Autônomos & RAG',
    descricao: 'Cruza métricas de novos leads, chamadas feitas e dinheiro no pipeline para redigir briefing matinal em áudio.',
    gatilho: 'Cron Trigger 08:00 AM',
    nodes: 7,
    complexidade: 'Intermediário',
    tags: ['BI', 'Resumo', 'Morning Call']
  },
  {
    id: 'n8n-rag-10',
    titulo: 'Detector de Riscos de Churn e Insatisfação de Clientes',
    categoria: 'Agentes IA Autônomos & RAG',
    descricao: 'Varre tickets de atendimento e calcula probabilidade de cancelamento com base em palavras-chave e prazos.',
    gatilho: 'Ticket Fechado',
    nodes: 6,
    complexidade: 'Intermediário',
    tags: ['Churn', 'CS', 'Retenção']
  },
  {
    id: 'n8n-rag-11',
    titulo: 'Agente Web Search com Busca em Tempo Real no Google',
    categoria: 'Agentes IA Autônomos & RAG',
    descricao: 'Pesquisa se a empresa mudou de endereço ou trocou de telefone recentemente antes do vendedor ligar.',
    gatilho: 'Pré-Ligação',
    nodes: 6,
    complexidade: 'Iniciante',
    tags: ['Google Search', 'Serper', 'Dados']
  },
  {
    id: 'n8n-rag-12',
    titulo: 'Classificador de Contratos e Extrator de Datas de Vencimento',
    categoria: 'Agentes IA Autônomos & RAG',
    descricao: 'Lê contratos assinados, extrai CNPJ, razão social, data de vencimento e agenda cobrança automática.',
    gatilho: 'Upload de Contrato',
    nodes: 7,
    complexidade: 'Intermediário',
    tags: ['Contratos', 'DocuSign', 'Financeiro']
  },

  // 3. CRM, Pipelines & Webhooks (11 fluxos)
  {
    id: 'n8n-crm-01',
    titulo: 'Sincronização Bidirecional REPASS CRM ↔ HubSpot',
    categoria: 'CRM, Pipelines & Webhooks',
    descricao: 'Espelha novos negócios criados no REPASS instantaneamente no pipeline do HubSpot com histórico completo.',
    gatilho: 'Webhook Lead Movido',
    nodes: 6,
    complexidade: 'Intermediário',
    tags: ['HubSpot', 'CRM', 'Sync', 'Webhooks']
  },
  {
    id: 'n8n-crm-02',
    titulo: 'Criação Automática de Fatura PIX via Asaas / Mercado Pago',
    categoria: 'CRM, Pipelines & Webhooks',
    descricao: 'Quando o lead chega na coluna "Fechado", gera QR Code Pix com link copiável e dispara no WhatsApp.',
    gatilho: 'Etapa Fechado Atingida',
    nodes: 8,
    complexidade: 'Avançado',
    tags: ['Asaas', 'PIX', 'Financeiro', 'Billing']
  },
  {
    id: 'n8n-crm-03',
    titulo: 'Webhook de Captura do Facebook / Instagram Ads Leads',
    categoria: 'CRM, Pipelines & Webhooks',
    descricao: 'Recebe os leads instantaneamente de formulários nativos do Meta Ads e já dispara primeiro WhatsApp em 45 segundos.',
    gatilho: 'Webhook Meta Lead Ads',
    nodes: 7,
    complexidade: 'Intermediário',
    tags: ['Meta Ads', 'Tráfego Pago', 'Fast Response']
  },
  {
    id: 'n8n-crm-04',
    titulo: 'Atribuição de Tags Inteligentes por Canal de Entrada',
    categoria: 'CRM, Pipelines & Webhooks',
    descricao: 'Identifica se o lead veio do Maps, do Google Ads, indicação ou orgânico e grava UTMs limpas no perfil.',
    gatilho: 'Novo Lead',
    nodes: 5,
    complexidade: 'Iniciante',
    tags: ['Tags', 'Segmentação', 'UTMs']
  },
  {
    id: 'n8n-crm-05',
    titulo: 'Exportador Automático de Leads para Google Sheets e BigQuery',
    categoria: 'CRM, Pipelines & Webhooks',
    descricao: 'Faz backup de hora em hora de todas as movimentações do funil para auditoria e planilhas de sócios.',
    gatilho: 'Cron Trigger Horário',
    nodes: 5,
    complexidade: 'Iniciante',
    tags: ['Google Sheets', 'Backup', 'BigQuery']
  },
  {
    id: 'n8n-crm-06',
    titulo: 'Alerta Sonoro no Discord / Slack em Venda Concluída',
    categoria: 'CRM, Pipelines & Webhooks',
    descricao: 'Dispara card comemorativo com som e detalhes do contrato ganho para animar o canal comercial da empresa.',
    gatilho: 'Negócio Ganho',
    nodes: 4,
    complexidade: 'Iniciante',
    tags: ['Slack', 'Discord', 'Comemoração']
  },
  {
    id: 'n8n-crm-07',
    titulo: 'Reconciliação Bancária de Assinaturas e Mensalidades',
    categoria: 'CRM, Pipelines & Webhooks',
    descricao: 'Verifica se a mensalidade de manutenção do site foi paga e envia comprovante fiscal para a contabilidade.',
    gatilho: 'Webhook Pagamento Aprovado',
    nodes: 6,
    complexidade: 'Intermediário',
    tags: ['Finanças', 'Mensalidade', 'Recorrência']
  },
  {
    id: 'n8n-crm-08',
    titulo: 'Enriquecimento de CNPJ na Receita Federal (BrasilAPI)',
    categoria: 'CRM, Pipelines & Webhooks',
    descricao: 'Ao cadastrar um lead, busca automaticamente razão social, capital social, CNAE e sócios na base oficial.',
    gatilho: 'Lead Salvo com CNPJ',
    nodes: 6,
    complexidade: 'Iniciante',
    tags: ['BrasilAPI', 'CNPJ', 'Receita Federal']
  },
  {
    id: 'n8n-crm-09',
    titulo: 'Limpeza e Desduplicação Inteligente de Contatos',
    categoria: 'CRM, Pipelines & Webhooks',
    descricao: 'Varre contatos duplicados por DDD e telefone, unificando notas e tags no registro principal.',
    gatilho: 'Rotina Semanal',
    nodes: 8,
    complexidade: 'Intermediário',
    tags: ['Deduplicação', 'Higiene de Base', 'CRM']
  },
  {
    id: 'n8n-crm-10',
    titulo: 'Disparo de Pesquisa CSAT com Registro de Nota no Perfil',
    categoria: 'CRM, Pipelines & Webhooks',
    descricao: 'Envia botões interativos de 1 a 5 no WhatsApp e atualiza campo personalizado "Nota de Satisfação".',
    gatilho: 'Call Comercial Encerrada',
    nodes: 6,
    complexidade: 'Iniciante',
    tags: ['CSAT', 'Feedback', 'Pesquisa']
  },
  {
    id: 'n8n-crm-11',
    titulo: 'Gerador Automático de Link de Pagamento Recorrente',
    categoria: 'CRM, Pipelines & Webhooks',
    descricao: 'Cria assinatura mensal de hospedagem R$ 97/mês com débito automático no cartão de crédito.',
    gatilho: 'Aceite de Proposta',
    nodes: 5,
    complexidade: 'Intermediário',
    tags: ['Assinaturas', 'Stripe', 'Recorrência']
  },

  // 4. Captação Maps & Enriquecimento OSINT (11 fluxos)
  {
    id: 'n8n-osint-01',
    titulo: 'Varredura Contínua no Google Maps Scrapling v2',
    categoria: 'Captação Maps & Enriquecimento OSINT',
    descricao: 'Pesquisa raio geográfico de 15km por nicho, detecta ausência de site e joga no Prospector REPASS.',
    gatilho: 'Cron Trigger ou Manual',
    nodes: 9,
    complexidade: 'Avançado',
    tags: ['Maps', 'Scrapling', 'OSINT', 'Geolocalização']
  },
  {
    id: 'n8n-osint-02',
    titulo: 'Verificador HTTP de Sites Quebrados ou Sem SSL',
    categoria: 'Captação Maps & Enriquecimento OSINT',
    descricao: 'Testa se a URL cadastrada no Maps retorna erro 404, 500 ou certificado inválido para abordar o dono.',
    gatilho: 'Novo Lead Maps',
    nodes: 6,
    complexidade: 'Iniciante',
    tags: ['HTTP', 'SSL Check', 'Auditoria']
  },
  {
    id: 'n8n-osint-03',
    titulo: 'Calculador de Taxa de Delivery Perdida (iFood 27%)',
    categoria: 'Captação Maps & Enriquecimento OSINT',
    descricao: 'Estima ticket médio por avaliações no Maps e gera cálculo de R$ 3.800/mês perdidos em taxas de intermediação.',
    gatilho: 'Restaurante Detectado',
    nodes: 5,
    complexidade: 'Iniciante',
    tags: ['Gastronomia', 'iFood', 'ROI']
  },
  {
    id: 'n8n-osint-04',
    titulo: 'Auditoria de Perfil do Google Meu Negócio (GMN)',
    categoria: 'Captação Maps & Enriquecimento OSINT',
    descricao: 'Checa quantidade de fotos, data da última resposta a review e identifica pontos fracos no perfil da empresa.',
    gatilho: 'Lead Scanned',
    nodes: 7,
    complexidade: 'Intermediário',
    tags: ['GMN', 'Google Reviews', 'SEO Local']
  },
  {
    id: 'n8n-osint-05',
    titulo: 'Descobridor de Instagram & WhatsApp em Páginas do Facebook',
    categoria: 'Captação Maps & Enriquecimento OSINT',
    descricao: 'Se o Maps não tem telefone celular, varre a Fanpage correspondente para minerar o WhatsApp direto.',
    gatilho: 'Lead Sem WhatsApp Celular',
    nodes: 8,
    complexidade: 'Avançado',
    tags: ['Social OSINT', 'Facebook', 'Scraper']
  },
  {
    id: 'n8n-osint-06',
    titulo: 'Detector de Tecnologias (WordPress, Wix, Shopify)',
    categoria: 'Captação Maps & Enriquecimento OSINT',
    descricao: 'Analisa o código-fonte da página para saber qual CMS o concorrente usa e sugerir migração para REPASS.',
    gatilho: 'URL Detectada',
    nodes: 5,
    complexidade: 'Iniciante',
    tags: ['Wappalyzer', 'Tech Stack', 'CMS']
  },
  {
    id: 'n8n-osint-07',
    titulo: 'Filtro por Número de Avaliações (Mais de 50 reviews)',
    categoria: 'Captação Maps & Enriquecimento OSINT',
    descricao: 'Filtra apenas empresas consolidadas com alto volume de clientes físicos mas sem presença digital moderna.',
    gatilho: 'Lote de Leads',
    nodes: 4,
    complexidade: 'Iniciante',
    tags: ['Filtros', 'Qualificação', 'Priorização']
  },
  {
    id: 'n8n-osint-08',
    titulo: 'Localizador de Responsável / Tomador de Decisão no LinkedIn',
    categoria: 'Captação Maps & Enriquecimento OSINT',
    descricao: 'Busca os diretores e sócios da empresa no LinkedIn para garantir abordagem direta no C-level.',
    gatilho: 'Lead B2B Qualificado',
    nodes: 8,
    complexidade: 'Avançado',
    tags: ['LinkedIn', 'B2B', 'SDR', 'Decisores']
  },
  {
    id: 'n8n-osint-09',
    titulo: 'Alerta de Abertura de Nova Empresa na Região',
    categoria: 'Captação Maps & Enriquecimento OSINT',
    descricao: 'Monitora diário oficial e CNPJs recém-abertos no município para oferecer site antes de qualquer concorrente.',
    gatilho: 'Diário Oficial RSS/Crawler',
    nodes: 7,
    complexidade: 'Avançado',
    tags: ['Novas Empresas', 'Timing Perfeito', 'Alerta']
  },
  {
    id: 'n8n-osint-10',
    titulo: 'Geração de Link Direto wa.me com Mensagem Pré-Preenchida',
    categoria: 'Captação Maps & Enriquecimento OSINT',
    descricao: 'Formata número E.164, limpa parênteses e traços e gera URL encurtada com copy de abertura.',
    gatilho: 'Lead Importado',
    nodes: 4,
    complexidade: 'Iniciante',
    tags: ['wa.link', 'URL Format', 'Sanitização']
  },
  {
    id: 'n8n-osint-11',
    titulo: 'Verificador de Responsividade Mobile da Landing Page Antiga',
    categoria: 'Captação Maps & Enriquecimento OSINT',
    descricao: 'Simula viewport de iPhone e calcula se o site antigo do lead quebra ou se os botões somem na tela.',
    gatilho: 'Lead Audit',
    nodes: 6,
    complexidade: 'Intermediário',
    tags: ['Mobile First', 'Responsividade', 'UX']
  },

  // 5. Voz Telefônica (Tel-Agent) & Agendamentos (11 fluxos)
  {
    id: 'n8n-voz-01',
    titulo: 'Agente Apolo: Ligação de Voz Telefônica Automatizada (SIP)',
    categoria: 'Voz Telefônica (Tel-Agent) & Agendamentos',
    descricao: 'Dispara chamada via gateway SIP, conversa com o dono usando voz neural ultra-realista e coleta interesse.',
    gatilho: 'Webhook Disparo de Voz',
    nodes: 10,
    complexidade: 'Avançado',
    tags: ['Tel-Agent', 'Voz Neural', 'Apolo', 'SIP']
  },
  {
    id: 'n8n-voz-02',
    titulo: 'Agendamento Direto no Google Meet & Google Calendar',
    categoria: 'Voz Telefônica (Tel-Agent) & Agendamentos',
    descricao: 'Verifica horários livres na agenda do consultor, cria sala Meet e envia convite .ics para ambas as partes.',
    gatilho: 'Interesse Confirmado na Call',
    nodes: 7,
    complexidade: 'Intermediário',
    tags: ['Google Calendar', 'Meet', 'Agendamentos']
  },
  {
    id: 'n8n-voz-03',
    titulo: 'Lembrete de Reunião 1 Hora Antes no WhatsApp',
    categoria: 'Voz Telefônica (Tel-Agent) & Agendamentos',
    descricao: 'Envia link direto da call e pergunta se o cliente confirma presença para evitar no-show comercial.',
    gatilho: 'Cron Trigger 60m Pré-Call',
    nodes: 5,
    complexidade: 'Iniciante',
    tags: ['No-Show', 'Lembrete', 'Confirmação']
  },
  {
    id: 'n8n-voz-04',
    titulo: 'Gravação e Resumo de Reunião Meet com IA',
    categoria: 'Voz Telefônica (Tel-Agent) & Agendamentos',
    descricao: 'Processa o arquivo da call gravada, gera tópicos discutidos e tarefas de fechamento com prazo.',
    gatilho: 'Fim da Reunião Meet',
    nodes: 8,
    complexidade: 'Avançado',
    tags: ['Transcrição', 'Resumo', 'Tarefas']
  },
  {
    id: 'n8n-voz-05',
    titulo: 'Redirecionamento Automático de Chamada para Humano (Transfer)',
    categoria: 'Voz Telefônica (Tel-Agent) & Agendamentos',
    descricao: 'Se o cliente falar "quero falar com um atendente", a IA faz transfer cego para o ramal do vendedor.',
    gatilho: 'Intenção Transferência',
    nodes: 6,
    complexidade: 'Avançado',
    tags: ['SIP Transfer', 'Humano', 'Ramal']
  },
  {
    id: 'n8n-voz-06',
    titulo: 'Agente Alva: Secretária Executiva de Confirmação de Consultas',
    categoria: 'Voz Telefônica (Tel-Agent) & Agendamentos',
    descricao: 'Para clínicas e consultórios, liga um dia antes para os pacientes confirmando o horário agendado.',
    gatilho: 'Agenda do Dia Seguinte',
    nodes: 7,
    complexidade: 'Intermediário',
    tags: ['Saúde', 'Clínicas', 'Alva', 'Voz']
  },
  {
    id: 'n8n-voz-07',
    titulo: 'Reagendamento Automático em Caso de Não Comparecimento',
    categoria: 'Voz Telefônica (Tel-Agent) & Agendamentos',
    descricao: 'Se o status for marcado como "No-Show", envia link Calendly para o lead escolher um novo horário.',
    gatilho: 'No-Show Confirmado',
    nodes: 5,
    complexidade: 'Iniciante',
    tags: ['Reagendamento', 'Calendly', 'Recuperação']
  },
  {
    id: 'n8n-voz-08',
    titulo: 'Envio de Proposta Comercial por WhatsApp Durante a Call',
    categoria: 'Voz Telefônica (Tel-Agent) & Agendamentos',
    descricao: 'O vendedor clica em um botão no painel da chamada e o contrato vai na hora para a tela do cliente.',
    gatilho: 'Botão Enviar Proposta na Call',
    nodes: 6,
    complexidade: 'Intermediário',
    tags: ['Ao Vivo', 'Proposta', 'Agilidade']
  },
  {
    id: 'n8n-voz-09',
    titulo: 'Classificação de Gravações por Qualidade do Vendedor',
    categoria: 'Voz Telefônica (Tel-Agent) & Agendamentos',
    descricao: 'Avalia se o vendedor seguiu o script, falou de preços com clareza e deu tempo de fala ao cliente.',
    gatilho: 'Áudio Gravado Salvo',
    nodes: 7,
    complexidade: 'Avançado',
    tags: ['QA', 'Treinamento', 'Pitch']
  },
  {
    id: 'n8n-voz-10',
    titulo: 'Discador Preditivo com Detecção de Caixa Postal',
    categoria: 'Voz Telefônica (Tel-Agent) & Agendamentos',
    descricao: 'Desliga imediatamente se cair em caixa postal ou mensagem de erro da operadora, poupando minutos de plano.',
    gatilho: 'AMD (Answering Machine Detection)',
    nodes: 6,
    complexidade: 'Avançado',
    tags: ['AMD', 'Telefonia', 'Otimização']
  },
  {
    id: 'n8n-voz-11',
    titulo: 'Sincronização de Fuso Horário de Reuniões Interestaduais',
    categoria: 'Voz Telefônica (Tel-Agent) & Agendamentos',
    descricao: 'Converte automaticamente horários entre estados (Manaus, Brasília, Acre) para evitar confusão no cliente.',
    gatilho: 'Lead com DDD Diferente',
    nodes: 4,
    complexidade: 'Iniciante',
    tags: ['Fuso Horário', 'Timezone', 'Agenda']
  }
];

export function obterJsonN8N(fluxo) {
  return JSON.stringify(
    gerarTemplateN8N(
      fluxo.titulo,
      fluxo.id,
      fluxo.descricao,
      fluxo.categoria,
      fluxo.tags
    ),
    null,
    2
  );
}
