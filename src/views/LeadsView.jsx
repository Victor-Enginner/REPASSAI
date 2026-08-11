import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Phone, Globe, Star, ArrowUpRight, Download, Send, Check, Sparkles, Filter, RefreshCw, Plus, X, Tag, Eye, ShieldCheck, AlertCircle } from 'lucide-react';
// Os 5.571 municípios do IBGE, agrupados por UF. Gerado por
// `node scripts/gerar-municipios.mjs` e versionado de propósito: consultar o
// IBGE ao abrir a tela colocaria um serviço de terceiros no caminho crítico
// do primeiro passo da varredura.
import MUNICIPIOS_POR_UF from '../data/municipiosBR.json';
import { apiUrl } from '../config';
import { fetchAutenticado } from '../services/authService';
import LeadCard from '../components/LeadCard';

/**
 * Ordem de prioridade comercial, da melhor oportunidade para a pior.
 *
 * Espelha `places_engine.FAIXA_*` no backend. A ordenação de verdade acontece
 * lá — esta cópia serve só para a amostra de demonstração, que nunca passa
 * pelo servidor. Se mudar a ordem lá, mude aqui: uma demonstração que ordena
 * diferente do produto real ensina o operador a esperar a coisa errada.
 */
const FAIXA_DE_OPORTUNIDADE = {
  sem_site: 0,
  so_rede_social: 1,
  site_inseguro: 2,
  tem_site: 3,
};

function gerarLeadsLocalmente(cidade, estado, nichosStr, qtd = 20) {
  const nichos = (nichosStr || 'Serviços').split(',').map(n => n.trim()).filter(Boolean);
  const sufixos = ['Especializada', 'VIP', 'Prime', 'Express', 'Gourmet', 'Imperial', 'Master', 'Studio', 'Centro', 'Premium'];
  
  const resultados = [];
  const total = Math.min(qtd || 20, 30);
  
  for (let i = 0; i < total; i++) {
    const nicho = nichos[i % nichos.length] || 'Serviços';
    const sufixo = sufixos[i % sufixos.length];
    const nichoCap = nicho.charAt(0).toUpperCase() + nicho.slice(1);
    const nome = `${nichoCap} ${sufixo} ${cidade}`;

    // Quatro presenças digitais, como na varredura real. A demonstração tinha
    // só duas — sem site ou com site —, então a tela de exemplo não mostrava
    // "só rede social", que é a segunda melhor oportunidade e existe de fato
    // nos dados verdadeiros. Amostra que esconde uma categoria ensina errado.
    const presencas = ['sem_site', 'so_rede_social', 'tem_site', 'sem_site', 'site_inseguro', 'tem_site'];
    const presenca = presencas[i % presencas.length];
    const dominio = nome.toLowerCase().replace(/[^a-z0-9]/g, '');
    const siteFalso = {
      sem_site: null,
      so_rede_social: `https://instagram.com/${dominio}`,
      site_inseguro: `http://${dominio}.com.br`,
      tem_site: `https://${dominio}.com.br`,
    }[presenca];
    const pontos = { sem_site: 100, so_rede_social: 70, site_inseguro: 55, tem_site: 40 }[presenca];
    const ddd = estado === 'SP' ? '16' : (estado === 'GO' ? '62' : (estado === 'RJ' ? '21' : '31'));

    resultados.push({
      id: `scanned-${Date.now()}-${i}`,
      nome: nome,
      categoria: nichoCap,
      cidade: cidade,
      estado: estado,
      bairro: 'Centro',
      // NUNCA inventar contato. O código anterior sorteava os dígitos do
      // telefone, e um número sorteado pertence a alguém — o operador
      // mandaria mensagem comercial para um estranho achando que era o lead.
      is_demo: true,
      telefone: null,
      whatsapp: null,
      site: siteFalso,
      status_site: presenca,
      score: pontos,
      temperatura: 'Quente',
      avaliacao: (4.2 + Math.random() * 0.7).toFixed(1),
      reviewsCount: Math.floor(20 + Math.random() * 500),
      endereco: `Av. Principal, ${100 + i * 25} - Centro, ${cidade} - ${estado}`,
      orientacao: 'Exemplo de layout — rode a varredura real para dados verdadeiros.',
      // 'Base' é o mesmo valor que o backend usa para lead recém-varrido.
      // Com 'Leads em Aberto' eles caíam direto na primeira coluna do funil
      // sem ninguém ter enviado nada, esvaziando o sentido do botão.
      status_crm: 'Base',
      criado_em: new Date().toISOString()
    });
  }
  
  // Mesma regra do backend: faixa primeiro, score dentro da faixa.
  resultados.sort((a, b) => {
    const faixa = FAIXA_DE_OPORTUNIDADE[a.status_site] - FAIXA_DE_OPORTUNIDADE[b.status_site];
    return faixa !== 0 ? faixa : b.score - a.score;
  });

  return resultados;
}

export default function LeadsView({ leads, onLeadsScanned, onSendToCRM, onGenerateSite }) {
  const [selectedEstado, setSelectedEstado] = useState('SP');
  const [selectedCidade, setSelectedCidade] = useState('Franca');
  
  const [selectedNichoPreset, setSelectedNichoPreset] = useState('salão de unhas, barbearia, hamburgueria, academia');
  const [selectedNicho, setSelectedNicho] = useState('salão de unhas, barbearia, hamburgueria, academia, estética facial, pet shop');
  
  const [quantidade, setQuantidade] = useState(40);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  // Os leads da varredura NÃO ficam em estado local desta view.
  //
  // Ficavam, e isso causava dois defeitos: a aba desmonta ao trocar de menu,
  // então a varredura sumia ao ir no Funil e voltar; e o card não reagia ao
  // "Enviar para CRM", porque o App atualizava a lista dele enquanto a tela
  // continuava desenhando a cópia local. Agora existe uma fonte de verdade só.
  const [activeLeadForModal, setActiveLeadForModal] = useState(null);
  const [logStream, setLogStream] = useState([]);
  const logBoxRef = useRef(null);

  useEffect(() => {
    const eventSource = new EventSource(apiUrl('/api/logs/stream'));
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.message) {
          setLogStream(prev => [...prev.slice(-49), data.message]);
        }
      } catch (err) {}
    };
    return () => eventSource.close();
  }, []);

  // Mantém o log rolado no fim SEM mexer na rolagem da página.
  //
  // Antes isto usava `scrollIntoView`, que rola TODOS os ancestrais roláveis
  // — inclusive o documento. Como o backend emite uma linha de log por lugar
  // encontrado, a página descia sozinha durante a varredura inteira e o
  // operador perdia de vista os controles.
  //
  // Mexer só no `scrollTop` do próprio console resolve: o contêiner rola,
  // a página fica parada.
  useEffect(() => {
    const caixa = logBoxRef.current;
    if (!caixa) return;

    // Se o operador subiu o log para reler algo, não arrasta ele de volta.
    const estaNoFim = caixa.scrollHeight - caixa.scrollTop - caixa.clientHeight < 40;
    if (estaNoFim) caixa.scrollTop = caixa.scrollHeight;
  }, [logStream]);

  /**
   * Nichos agrupados PELO MOTIVO de o site converter, não por ordem
   * alfabética — o agrupamento é a explicação.
   *
   * A pergunta que o operador precisa responder antes de ligar não é "que
   * tipo de negócio é este", e sim "por que este negócio perde dinheiro sem
   * site". São quatro respostas possíveis, e elas mudam o argumento de venda:
   *
   *  1. DECISÃO CARA — o cliente pesquisa antes de gastar. Sem site, ele
   *     compara você com quem tem, e perde. É o grupo de maior ticket.
   *  2. VENDE MOSTRANDO — a decisão é visual. Instagram até mostra, mas não
   *     organiza: ninguém acha o trabalho de dois anos atrás numa timeline.
   *  3. AGENDAMENTO E CARDÁPIO — o site tira trabalho do dono. Deixa de
   *     responder "qual o preço" e "que horas abre" vinte vezes por dia.
   *  4. URGÊNCIA — o cliente busca no celular e liga no primeiro. Aqui o
   *     site ajuda MENOS: o perfil do Google com avaliação é que decide.
   *     Estão no fim da lista de propósito.
   *
   * Cada preset tem no máximo LIMITE_NICHOS_POR_VARREDURA itens, porque é o
   * que o backend aceita por varredura. Preset maior seria cortado calado.
   */
  const GRUPOS_DE_NICHOS = [
    {
      grupo: '1 · Decisão cara — o cliente pesquisa antes',
      opcoes: [
        { label: 'Odontologia & Implantes', value: 'odontologia, dentista, implante dentário, ortodontia, clínica odontológica, aparelho dentário' },
        { label: 'Clínicas & Terapias', value: 'fisioterapia, psicologia, nutricionista, quiropraxia, fonoaudiologia, terapia ocupacional' },
        { label: 'Estética Avançada', value: 'clínica de estética, harmonização facial, micropigmentação, depilação a laser, massoterapia, spa' },
        { label: 'Advocacia & Contabilidade', value: 'advocacia, escritório de advocacia, contabilidade, escritório contábil, despachante, consultoria' },
        { label: 'Imobiliária & Arquitetura', value: 'imobiliária, corretor de imóveis, arquitetura, design de interiores, engenharia, paisagismo' },
        { label: 'Educação & Cursos', value: 'autoescola, escola de idiomas, curso profissionalizante, escola infantil, reforço escolar, escola de música' },
        { label: 'Energia Solar & Automação', value: 'energia solar, automação residencial, ar condicionado, elétrica predial, câmeras de segurança, alarmes' },
      ],
    },
    {
      grupo: '2 · Vende mostrando — precisa de portfólio',
      opcoes: [
        { label: 'Fotografia & Filmagem', value: 'fotografia, fotógrafo, filmagem, estúdio fotográfico, filmmaker, ensaio fotográfico' },
        { label: 'Eventos & Buffet', value: 'buffet, chácara para eventos, salão de festas, espaço de eventos, decoração de festas, cerimonial' },
        { label: 'Marcenaria & Planejados', value: 'móveis planejados, marcenaria, serralheria, marmoraria, vidraçaria, gesso e drywall' },
        { label: 'Tatuagem & Body Art', value: 'tatuagem, estúdio de tatuagem, piercing, tatuador, body art, micropigmentação' },
        { label: 'Moda & Noivas', value: 'loja de noivas, aluguel de trajes, moda feminina, loja de roupas, brechó, loja de calçados' },
      ],
    },
    {
      grupo: '3 · Agendamento e cardápio — tira trabalho do dono',
      opcoes: [
        { label: 'Todos os Nichos (Varredura Ampla)', value: 'salão de unhas, barbearia, hamburgueria, academia, estética facial, pet shop' },
        { label: 'Barbearia & Estilo VIP', value: 'barbearia, corte masculino, barba, salão masculino, barber shop, barbearia infantil' },
        { label: 'Salão, Unhas & Sobrancelhas', value: 'salão de unhas, manicure, design de sobrancelhas, alongamento de unhas, cabeleireiro, lash designer' },
        { label: 'Academias & Fitness', value: 'academia, crossfit, pilates, personal trainer, muay thai, studio de treino' },
        { label: 'Restaurantes & Delivery', value: 'restaurante, pizzaria, hamburgueria, lanchonete, marmitaria, self service' },
        { label: 'Padaria, Doces & Café', value: 'padaria, confeitaria, cafeteria, doceria, casa de bolos, salgaderia' },
        { label: 'Açaí, Sorvete & Lanches', value: 'açaí, sorveteria, espetinho, pastelaria, food truck, creperia' },
        { label: 'Hospedagem & Turismo', value: 'pousada, hotel, chácara, camping, pesqueiro, casa de campo' },
        { label: 'Pet Shop & Veterinária', value: 'pet shop, banho e tosa, clínica veterinária, veterinário, hotel para pets, adestrador' },
        { label: 'Joalheria, Ótica & Presentes', value: 'joalheria, ótica, relojoaria, perfumaria, loja de presentes, semijoias' },
      ],
    },
    {
      grupo: '4 · Urgência — aqui o site pesa menos',
      opcoes: [
        { label: 'Automotivo', value: 'oficina mecânica, auto center, funilaria, autopeças, lava rápido, borracharia' },
        { label: 'Construção & Reforma', value: 'construtora, reforma, pintura predial, eletricista, encanador, pedreiro' },
        { label: 'Casa & Manutenção', value: 'dedetizadora, chaveiro, piscinas, desentupidora, jardinagem, limpeza pós-obra' },
      ],
    },
  ];

  /**
   * Teto de nichos por varredura, espelhando NicheFilter.MAX_NICHOS no
   * backend (backend/scraper_monster.py).
   *
   * O backend SEMPRE cortou em 6, mas em silêncio: o preset "Varredura Ampla"
   * tinha 8 nichos, o rodapé anunciava 8, e dois eram descartados sem nada na
   * tela. O operador acreditava ter varrido nichos que nunca foram buscados.
   *
   * O teto existe por dinheiro, não por capricho: cada nicho é uma busca a
   * mais no Places, e cada lead custa duas chamadas (~US$ 17 / 1.000).
   */
  const LIMITE_NICHOS_POR_VARREDURA = 6;

  /**
   * As 27 unidades federativas.
   *
   * O dropdown listava quatro. Não era decisão de produto — o backend recebe
   * `estado` como texto livre e nunca validou contra lista. Vinte e três
   * estados estavam fora do produto por um array escrito à mão.
   */
  const UNIDADES_FEDERATIVAS = [
    { sigla: 'AC', nome: 'Acre' },            { sigla: 'AL', nome: 'Alagoas' },
    { sigla: 'AP', nome: 'Amapá' },           { sigla: 'AM', nome: 'Amazonas' },
    { sigla: 'BA', nome: 'Bahia' },           { sigla: 'CE', nome: 'Ceará' },
    { sigla: 'DF', nome: 'Distrito Federal' },{ sigla: 'ES', nome: 'Espírito Santo' },
    { sigla: 'GO', nome: 'Goiás' },           { sigla: 'MA', nome: 'Maranhão' },
    { sigla: 'MT', nome: 'Mato Grosso' },     { sigla: 'MS', nome: 'Mato Grosso do Sul' },
    { sigla: 'MG', nome: 'Minas Gerais' },    { sigla: 'PA', nome: 'Pará' },
    { sigla: 'PB', nome: 'Paraíba' },         { sigla: 'PR', nome: 'Paraná' },
    { sigla: 'PE', nome: 'Pernambuco' },      { sigla: 'PI', nome: 'Piauí' },
    { sigla: 'RJ', nome: 'Rio de Janeiro' },  { sigla: 'RN', nome: 'Rio Grande do Norte' },
    { sigla: 'RS', nome: 'Rio Grande do Sul' },{ sigla: 'RO', nome: 'Rondônia' },
    { sigla: 'RR', nome: 'Roraima' },         { sigla: 'SC', nome: 'Santa Catarina' },
    { sigla: 'SP', nome: 'São Paulo' },       { sigla: 'SE', nome: 'Sergipe' },
    { sigla: 'TO', nome: 'Tocantins' },
  ];

  /**
   * Sugestões de cidade — atalho, não limite.
   *
   * O campo aceita qualquer texto; estas só aparecem no autocomplete e nos
   * chips de acesso rápido. Capitais mais as praças onde já houve operação.
   */
  const CIDADES_SUGERIDAS = [
    { nome: 'Franca', estado: 'SP' },
    { nome: 'São Paulo', estado: 'SP' },
    { nome: 'Campinas', estado: 'SP' },
    { nome: 'Ribeirão Preto', estado: 'SP' },
    { nome: 'Goiânia', estado: 'GO' },
    { nome: 'Rio de Janeiro', estado: 'RJ' },
    { nome: 'Belo Horizonte', estado: 'MG' },
    { nome: 'Uberlândia', estado: 'MG' },
    { nome: 'Curitiba', estado: 'PR' },
    { nome: 'Porto Alegre', estado: 'RS' },
    { nome: 'Florianópolis', estado: 'SC' },
    { nome: 'Salvador', estado: 'BA' },
    { nome: 'Recife', estado: 'PE' },
    { nome: 'Fortaleza', estado: 'CE' },
    { nome: 'Brasília', estado: 'DF' },
    { nome: 'Vitória', estado: 'ES' },
    { nome: 'Manaus', estado: 'AM' },
    { nome: 'Belém', estado: 'PA' },
    { nome: 'Natal', estado: 'RN' },
    { nome: 'João Pessoa', estado: 'PB' },
    { nome: 'Maceió', estado: 'AL' },
    { nome: 'Cuiabá', estado: 'MT' },
    { nome: 'Campo Grande', estado: 'MS' },
    { nome: 'Teresina', estado: 'PI' },
    { nome: 'São Luís', estado: 'MA' },
    { nome: 'Aracaju', estado: 'SE' },
    { nome: 'Palmas', estado: 'TO' },
    { nome: 'Porto Velho', estado: 'RO' },
    { nome: 'Rio Branco', estado: 'AC' },
    { nome: 'Macapá', estado: 'AP' },
    { nome: 'Boa Vista', estado: 'RR' },
  ];

  /**
   * As cidades do estado escolhido, já em ordem alfabética.
   *
   * Acesso direto por UF, não filtro sobre os 5.571 municípios: a tela sempre
   * pergunta o estado antes da cidade, então o agrupamento por UF é o formato
   * natural do dado.
   */
  const cidadesDoEstado = MUNICIPIOS_POR_UF[selectedEstado] || [];

  /**
   * Troca o estado e reposiciona a cidade dentro dele.
   *
   * Sem isto, escolher Minas Gerais deixaria "Franca" (que é de SP) no
   * estado. Um <select> controlado com valor fora das opções não mostra erro:
   * ele exibe a primeira opção da lista enquanto o React ainda acha que o
   * valor é o antigo — e a varredura sairia com o par cidade/estado errado,
   * sem nada na tela denunciando.
   *
   * A cidade nova é a praça conhecida do estado, quando existe, senão a
   * primeira da lista. Nunca fica vazia.
   */
  const handleEstadoChange = (uf) => {
    const conhecida = CIDADES_SUGERIDAS.find(c => c.estado === uf);
    const cidades = MUNICIPIOS_POR_UF[uf] || [];
    const cidadeValida = conhecida && cidades.includes(conhecida.nome)
      ? conhecida.nome
      : (cidades[0] || '');

    setSelectedEstado(uf);
    setSelectedCidade(cidadeValida);
  };

  /**
   * Atalhos de um clique. Não é a lista de nichos possíveis — o campo aceita
   * qualquer termo, e os presets acima cobrem 25 combinações.
   *
   * A escolha aqui é por TICKET e frequência: os que mais costumam fechar
   * primeiro. Odontologia e advocacia entram porque são o maior valor por
   * venda; barbearia e salão porque são os mais numerosos em qualquer cidade.
   */
  const NICHOS_SUGERIDOS = [
    'odontologia',
    'clínica de estética',
    'advocacia',
    'imobiliária',
    'energia solar',
    'barbearia',
    'salão de unhas',
    'academia',
    'pet shop',
    'restaurante',
    'padaria',
    'oficina mecânica',
  ];

  const handleNichoDropdownChange = (e) => {
    const val = e.target.value;
    setSelectedNichoPreset(val);
    setSelectedNicho(val);
  };

  const toggleNichoChip = (nicho) => {
    const list = selectedNicho.split(',').map(n => n.trim().toLowerCase()).filter(Boolean);
    if (list.includes(nicho.toLowerCase())) {
      const updated = list.filter(n => n !== nicho.toLowerCase());
      setSelectedNicho(updated.join(', '));
    } else {
      const updated = [...list, nicho.toLowerCase()];
      setSelectedNicho(updated.join(', '));
    }
  };

  const handleSelectCityChip = (cidadeObj) => {
    setSelectedCidade(cidadeObj.nome);
    setSelectedEstado(cidadeObj.estado);
  };

  const handleRunScan = async () => {
    setIsScanning(true);
    const logInicio = `[OSINT SCANNER] Iniciando varredura em ${selectedCidade}, ${selectedEstado} (${selectedNicho})...`;
    setLogStream(prev => [...prev.slice(-49), logInicio]);

    try {
      const res = await fetchAutenticado('/api/leads/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: selectedEstado,
          cidade: selectedCidade,
          nichos: selectedNicho,
          max_results: quantidade
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.leads && data.leads.length > 0) {
          onLeadsScanned(data.leads);
          setLogStream(prev => [...prev.slice(-49), `[OSINT SUCCESS] Varredura concluída! ${data.leads.length} leads encontrados em ${selectedCidade}, ${selectedEstado}.`]);
          return;
        }
      }

      // A varredura falhou. Dizer o motivo real importa: antes o app
      // apresentava exemplos como se fossem o resultado da busca, e o
      // operador não tinha como saber que aqueles negócios não existem.
      const motivo = res.status === 429
        ? 'muitas varreduras seguidas — aguarde um minuto'
        : res.status === 401
          ? 'sessao expirada, faca login novamente'
          : `a busca real nao respondeu (HTTP ${res.status})`;
      const localLeads = gerarLeadsLocalmente(selectedCidade, selectedEstado, selectedNicho, quantidade);
      onLeadsScanned(localLeads);
      setLogStream(prev => [...prev.slice(-49), `[OSINT AVISO] Varredura real indisponivel: ${motivo}. Exibindo ${localLeads.length} exemplos de layout — NAO sao negocios reais.`]);
    } catch (err) {
      console.warn("API de varredura offline. Exibindo exemplos de layout.", err);
      const localLeads = gerarLeadsLocalmente(selectedCidade, selectedEstado, selectedNicho, quantidade);
      onLeadsScanned(localLeads);
      setLogStream(prev => [...prev.slice(-49), `[OSINT AVISO] Backend fora do ar. Exibindo ${localLeads.length} exemplos de layout — NAO sao negocios reais.`]);
    } finally {
      setIsScanning(false);
    }
  };

  const nichosEscolhidos = selectedNicho.split(',').map(n => n.trim().toLowerCase()).filter(Boolean);

  // O backend corta em LIMITE_NICHOS_POR_VARREDURA e devolve só o que coube.
  // Repetir o corte aqui é o que mantém o rodapé honesto: contar o escolhido
  // em vez do varrido faria a tela anunciar buscas que nunca aconteceram.
  const nichosListActive = nichosEscolhidos.slice(0, LIMITE_NICHOS_POR_VARREDURA);
  const nichosIgnorados = nichosEscolhidos.slice(LIMITE_NICHOS_POR_VARREDURA);

  /**
   * Leads exibidos.
   *
   * O seletor de nicho define O QUE VARRER, não o que mostrar. Antes esta
   * lista refiltrava por nicho resultados que o backend JÁ tinha filtrado
   * por nicho — e como a comparação era `categoria.includes(nicho)`, um
   * lead de categoria "Restaurante" nunca casava com o nicho "hamburgueria"
   * que o produziu. Resultado: "Todos os Nichos" exibia 0 encontrados.
   *
   * Aqui sobra apenas a busca textual, que é filtro de exibição de fato.
   */
  // Lead enviado ao CRM sai da triagem: continuar aparecendo aqui faz o
  // operador abordar o mesmo negócio duas vezes.
  //
  // O critério é o marcador `enviado_crm`, não `status_crm`: este último vem
  // como "Base" do backend, "Leads em Aberto" do gerador local e "Abordados"
  // do painel, então filtrar por ele descartava os 36 leads reais da varredura.
  const emTriagem = leads.filter((l) => !l.enviado_crm);

  const displayLeads = emTriagem.filter((l) => {
    if (!searchTerm) return true;
    const alvo = `${l.nome || ''} ${l.cidade || ''} ${l.categoria || ''}`.toLowerCase();
    return alvo.includes(searchTerm.toLowerCase());
  });

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === displayLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(displayLeads.map(l => l.id));
    }
  };

  const toggleSelectLead = (id) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter(i => i !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  const handleExportCSV = () => {
    const itemsToExport = selectedLeadIds.length > 0 ? leads.filter(l => selectedLeadIds.includes(l.id)) : displayLeads;
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Nome,Categoria,Cidade,Estado,Telefone,Status Site,Score"].join(",") + "\n"
      + itemsToExport.map(e => `"${e.nome}","${e.categoria}","${e.cidade}","${e.estado}","${e.telefone}","${e.status_site}",${e.score}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads_repassai.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ position: 'relative', padding: '32px 40px', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh' }}>
      <div style={{ position: 'relative', zIndex: 10 }}>
        
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="mono-label">MODULE // LEADS_OSINT_02</span>
            <h1 className="font-headline" style={{ fontSize: '32px', color: 'var(--fg-white)', marginTop: '4px' }}>
              SCANNER DE LEADS OSINT
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--fg-muted)', marginTop: '4px' }}>
              Varredura ilimitada por seleção de estado, cidade e nichos com pontuação de oportunidade
            </p>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--sobre-12)', padding: '12px 18px', textAlign: 'right', borderRadius: '4px' }}>
            <div className="font-mono" style={{ fontSize: '12px', color: 'var(--fg-white)' }}>
              MOTOR OSINT // 100% OPERACIONAL
            </div>
            <div style={{ width: '140px', height: '4px', background: 'var(--sobre-10)', marginTop: '8px', overflow: 'hidden', borderRadius: '2px' }}>
              <div style={{ width: '100%', height: '100%', background: 'var(--accent-indigo)' }} />
            </div>
          </div>
        </div>

        {/* Filter Bar with Responsive Grid */}
        <div data-testid="leads-controls" className="glass-panel" style={{ padding: '24px', marginBottom: '24px', background: 'var(--bg-surface)', borderRadius: '8px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'flex-end', marginBottom: '16px' }}>
            
            <div>
              <label htmlFor="leads-pais" className="mono-label" style={{ display: 'block', marginBottom: '6px', fontSize: '9px' }}>País</label>
              <select id="leads-pais" style={{ width: '100%', padding: '11px 12px', border: '0.5px solid var(--sobre-20)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--fg-white)', fontWeight: '500', borderRadius: '4px' }}>
                <option>Brasil (BR)</option>
              </select>
            </div>

            <div>
              <label htmlFor="leads-estado" className="mono-label" style={{ display: 'block', marginBottom: '6px', fontSize: '9px' }}>Estado</label>
              <select 
                id="leads-estado"
                value={selectedEstado}
                onChange={(e) => handleEstadoChange(e.target.value)}
                style={{ width: '100%', padding: '11px 12px', border: '0.5px solid var(--sobre-20)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--fg-white)', fontWeight: '500', borderRadius: '4px' }}
              >
                {/*
                  As 27 unidades federativas.

                  Eram quatro — SP, GO, RJ, MG — escritas à mão. O backend
                  nunca teve essa limitação: `handle_scan` recebe `estado` como
                  texto livre e repassa ao Google Places sem validar contra
                  lista nenhuma. O teto estava só aqui, e cortava 23 estados
                  do produto.
                */}
                {UNIDADES_FEDERATIVAS.map(uf => (
                  <option key={uf.sigla} value={uf.sigla}>{uf.nome} ({uf.sigla})</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="leads-cidade" className="mono-label" style={{ display: 'block', marginBottom: '6px', fontSize: '9px' }}>
                Cidade <span style={{ color: 'var(--fg-muted)' }}>({cidadesDoEstado.length})</span>
              </label>
              {/*
                Lista fechada, alimentada pelo estado — não campo de digitação.

                A versão anterior era um <input> livre com sugestões. Ela
                resolvia o problema de cobertura (qualquer cidade do Brasil),
                mas ao custo de exigir que o operador SOUBESSE e ESCREVESSE o
                nome certo. Quem não lembra a grafia trava na primeira tela.

                Agora as três decisões — país, estado, cidade — são a mesma
                operação: abrir e clicar. As 5.571 cidades vêm do IBGE, então
                a lista é completa sem ninguém manter array à mão; e ser lista
                fechada elimina de vez o erro de digitação chegando ao Places
                como cidade inexistente.
              */}
              <select
                id="leads-cidade"
                value={selectedCidade}
                onChange={(e) => setSelectedCidade(e.target.value)}
                style={{ width: '100%', padding: '11px 12px', border: '0.5px solid var(--sobre-20)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--fg-white)', fontWeight: '500', borderRadius: '4px' }}
              >
                {cidadesDoEstado.map(nome => (
                  <option key={nome} value={nome}>{nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="leads-nicho" className="mono-label" style={{ display: 'block', marginBottom: '6px', fontSize: '9px' }}>Nicho para Varredura (Selecione na Lista)</label>
              <select 
                id="leads-nicho"
                value={selectedNichoPreset} 
                onChange={handleNichoDropdownChange}
                style={{ width: '100%', padding: '11px 14px', border: '0.5px solid var(--sobre-20)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--fg-white)', fontWeight: '500', borderRadius: '4px' }}
              >
                {/*
                  <optgroup> em vez de lista corrida: o título do grupo diz
                  POR QUE aquele conjunto de negócios paga por um site. Numa
                  lista plana de 25 opções, essa informação não caberia em
                  lugar nenhum — e é ela que define o argumento da ligação.
                */}
                {GRUPOS_DE_NICHOS.map(({ grupo, opcoes }) => (
                  <optgroup key={grupo} label={grupo}>
                    {opcoes.map(opt => (
                      <option key={opt.label} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <button onClick={handleRunScan} className="btn-primary" style={{ height: '44px', justifyContent: 'center', fontSize: '12px', borderRadius: '4px' }}>
              {isScanning ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
              {isScanning ? 'Varrendo...' : 'Varrer agora'}
            </button>

          </div>

          {/* Interactive City Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <span className="mono-label" style={{ fontSize: '9px', color: 'var(--fg-muted)' }}>Cidades Rápidas:</span>
            {/*
              Só as cidades do estado escolhido. Com a lista nacional inteira,
              31 chips numa linha viram ruído — o atalho deixaria de ser atalho.
              Qualquer outra cidade do estado sai do <select> acima, que tem
              todas; estes chips são o caminho de um clique para as praças
              onde já houve operação.
            */}
            {CIDADES_SUGERIDAS.filter(c => c.estado === selectedEstado).map(c => {
              const isSelected = selectedCidade.toLowerCase() === c.nome.toLowerCase();
              return (
                <button
                  key={c.nome}
                  onClick={() => handleSelectCityChip(c)}
                  style={{
                    padding: '4px 10px',
                    border: isSelected ? '0.5px solid var(--accent-indigo)' : '0.5px solid var(--hairline-color)',
                    background: isSelected ? 'var(--accent-indigo)' : 'var(--bg-card)',
                    color: isSelected ? '#ffffff' : 'var(--fg-white)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  {c.nome}, {c.estado}
                </button>
              );
            })}
          </div>

          {/* Interactive Niche Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <span className="mono-label" style={{ fontSize: '9px', color: 'var(--fg-muted)' }}>Ativar / Desativar Filtro:</span>
            {NICHOS_SUGERIDOS.map(nicho => {
              const isSelected = nichosListActive.includes(nicho.toLowerCase());
              return (
                <button
                  key={nicho}
                  onClick={() => toggleNichoChip(nicho)}
                  style={{
                    padding: '4px 10px',
                    border: isSelected ? '0.5px solid var(--accent-indigo)' : '0.5px solid var(--hairline-color)',
                    background: isSelected ? 'var(--estado-sucesso-suave)' : 'var(--bg-card)',
                    color: isSelected ? 'var(--accent-indigo-claro)' : 'var(--fg-muted)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    borderRadius: '4px'
                  }}
                >
                  {isSelected ? <Check size={11} color="var(--accent-indigo)" /> : <Plus size={11} />}
                  {nicho}
                </button>
              );
            })}
          </div>
          {/* SSE Live Log Terminal */}
          <div ref={logBoxRef} style={{
            background: 'var(--bg-poco)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '4px',
            padding: '12px',
            height: '140px',
            overflowY: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--accent-indigo-suave)',
            lineHeight: '1.6',
            boxShadow: 'inset 0 0 12px rgba(0,0,0,0.8)',
            marginBottom: '16px'
          }}>
            <div style={{ color: 'var(--accent-indigo)', marginBottom: '8px', fontSize: '10px' }}>
              &gt; OSINT SSE_LINK ESTABLISHED. WAITING FOR SCANS...
            </div>
            {logStream.map((log, idx) => (
              <div key={idx} style={{ 
                wordBreak: 'break-all', 
                color: log.includes('ERRO') || log.includes('CRITICAL') ? 'var(--estado-erro)' : 
                       log.includes('WARNING') ? 'var(--estado-alerta)' : 'var(--accent-indigo)' 
              }}>
                <span style={{ color: 'var(--accent-indigo-forte)' }}>[{new Date().toLocaleTimeString()}]</span> {log}
              </div>
            ))}
          </div>

          {/* Summary Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '0.5px solid var(--hairline-color)', fontSize: '12px', color: 'var(--fg-muted)', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Search size={14} color="var(--accent-indigo)" />
              <span>
                Configurado para <strong style={{ color: 'var(--fg-white)' }}>{nichosListActive.length} nichos ativos</strong> em {selectedCidade}, {selectedEstado}.
                {nichosIgnorados.length > 0 && (
                  <>
                    {' '}
                    <strong
                      style={{ color: 'var(--alerta)' }}
                      title={`O limite é ${LIMITE_NICHOS_POR_VARREDURA} nichos por varredura, para conter o custo por chamada no Google Places. Rode uma segunda varredura para cobrir o resto.`}
                    >
                      {nichosIgnorados.length} fora do limite ({nichosIgnorados.join(', ')})
                    </strong>
                  </>
                )}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontWeight: '700', color: 'var(--fg-white)' }}>
                {/* Contado dos dados reais. Antes era "22" fixo no código,
                    que mentia para o operador em toda varredura.

                    Duas contas separadas, porque são duas conversas de venda
                    diferentes: quem não tem nada, e quem tem só Instagram ou
                    um site velho sem HTTPS. Somar os dois num "sem site" só
                    inflava o número e escondia qual abordagem usar. */}
                <span style={{ color: 'var(--accent-indigo)' }}>
                  {displayLeads.filter(l => l.status_site === 'sem_site').length} Sem site
                </span>
                {' · '}
                <span
                  style={{ color: 'var(--alerta)' }}
                  title="Negócios com só Instagram/Facebook, ou com site antigo sem HTTPS. Têm presença, mas fraca — e por isso continuam sendo oportunidade."
                >
                  {displayLeads.filter(l => l.status_site === 'so_rede_social' || l.status_site === 'site_inseguro').length} Presença fraca
                </span>
                {' · '}{displayLeads.length} Encontrados
              </div>
            </div>
          </div>

        </div>

        {/* Grid Action Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--fg-muted)', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={selectedLeadIds.length === displayLeads.length && displayLeads.length > 0} 
              onChange={toggleSelectAll} 
            />
            Selecionar todos ({selectedLeadIds.length} selecionados)
          </label>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleExportCSV} className="btn-secondary" style={{ fontSize: '11px', padding: '8px 16px', borderRadius: '4px' }}>
              <Download size={14} /> Exportar CSV
            </button>

            <button 
              onClick={() => {
                const targets = selectedLeadIds.length > 0 ? selectedLeadIds : [displayLeads[0]?.id];
                targets.forEach(id => id && onSendToCRM(id));
              }}
              className="btn-primary" 
              style={{ fontSize: '11px', padding: '8px 20px', borderRadius: '4px' }}
            >
              <Send size={14} /> Enviar para CRM
            </button>
          </div>
        </div>

        {/* Lead Cards Grid - Redesenhado no estilo fiel da UseLeadSite */}
        <div data-testid="leads-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {displayLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              selecionado={selectedLeadIds.includes(lead.id)}
              onAlternarSelecao={toggleSelectLead}
              onEnviarCRM={onSendToCRM}
              onGerarSite={onGenerateSite}
            />
          ))}
        </div>

      </div>

      {/* OSINT Deep Audit Modal */}
      {activeLeadForModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '0.5px solid var(--sobre-20)',
            maxWidth: '560px',
            width: '100%',
            padding: '28px',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="mono-label">OSINT_RADAR // {activeLeadForModal.nome}</span>
              <button onClick={() => setActiveLeadForModal(null)} style={{ background: 'none', border: 'none', color: 'var(--fg-white)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>

            <h3 className="font-headline" style={{ fontSize: '22px', color: 'var(--fg-white)', marginBottom: '16px' }}>
              Relatório de Oportunidade OSINT
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--bg-card)', padding: '14px', border: '0.5px solid var(--hairline-color)', borderRadius: '4px' }}>
                <div style={{ fontSize: '10px', color: 'var(--fg-muted)' }}>STATUS DO DOMÍNIO</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: activeLeadForModal.status_site === 'tem_site' ? 'var(--estado-sucesso)' : 'var(--estado-erro)', marginTop: '4px' }}>
                  {activeLeadForModal.status_site === 'tem_site' ? 'Domínio Ativo' : 'Sem Domínio Registrado'}
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '14px', border: '0.5px solid var(--sobre-10)', borderRadius: '4px' }}>
                <div style={{ fontSize: '10px', color: 'var(--fg-muted)' }}>SCORE DE OPORTUNIDADE</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--accent-indigo)', marginTop: '4px' }}>
                  {activeLeadForModal.score} / 100
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '16px', border: '0.5px solid var(--sobre-10)', marginBottom: '20px', fontSize: '12.5px', color: 'var(--fg-soft)', lineHeight: 1.6, borderRadius: '4px' }}>
              <strong style={{ color: 'var(--fg-white)' }}>💡 Diagnóstico do Agente:</strong> {activeLeadForModal.orientacao}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { onSendToCRM(activeLeadForModal.id); setActiveLeadForModal(null); }} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', borderRadius: '4px' }}>
                <Send size={13} /> Enviar p/ CRM
              </button>
              <button onClick={() => { onGenerateSite(activeLeadForModal); setActiveLeadForModal(null); }} className="btn-primary" style={{ flex: 1, justifyContent: 'center', borderRadius: '4px' }}>
                <Sparkles size={13} /> Criar Site Agora
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
