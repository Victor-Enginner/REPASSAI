import { expect, test } from '@playwright/test';

const leadsReais = [
  {
    id: 'places-hot-long',
    nome: 'Instituto de Estética Avançada e Bem-Estar Integrado Nome Propositalmente Muito Longo',
    categoria: 'Estética facial',
    cidade: 'Franca',
    estado: 'SP',
    telefone: '(16) 99999-0001',
    status_site: 'sem_site',
    score: 92,
    temperatura: 'Quente',
    avaliacao: 4.8,
    reviewsCount: 27,
    endereco: 'Avenida Doutor Ismael Alonso y Alonso, 3456, Edifício Empresarial Torre Norte, Jardim das Acácias, Franca - SP',
    orientacao: 'Boa reputação e ausência de site próprio.',
    is_demo: false,
    status_crm: 'Base',
  },
  {
    id: 'places-no-phone',
    nome: 'Café Sem Telefone',
    categoria: 'Cafeteria',
    cidade: 'Franca',
    estado: 'SP',
    telefone: null,
    status_site: 'sem_site',
    score: 76,
    temperatura: 'Morno',
    avaliacao: 4.2,
    reviewsCount: 8,
    endereco: 'Rua Central, 10 - Franca, SP',
    is_demo: false,
    status_crm: 'Base',
  },
  {
    id: 'places-no-rating',
    nome: 'Oficina Sem Avaliação',
    categoria: 'Oficina mecânica',
    cidade: 'Franca',
    estado: 'SP',
    telefone: '(16) 3333-2222',
    status_site: 'tem_site',
    score: 64,
    temperatura: 'Morno',
    avaliacao: null,
    reviewsCount: null,
    endereco: 'Rua das Oficinas, 50 - Franca, SP',
    is_demo: false,
    status_crm: 'Base',
  },
  {
    id: 'places-low-score',
    nome: 'Pet Shop Score Baixo',
    categoria: 'Pet shop',
    cidade: 'Franca',
    estado: 'SP',
    telefone: '(16) 3222-1111',
    status_site: 'tem_site',
    score: 37,
    temperatura: 'Morno',
    avaliacao: 3.9,
    reviewsCount: 142,
    endereco: 'Rua Curta, 7 - Franca, SP',
    is_demo: false,
    status_crm: 'Base',
  },
];

async function abrirLeadsComRespostaReal(page) {
  await page.route('**/api/logs/stream', (route) => route.abort());
  await page.route('**/api/leads/scan', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      leads: leadsReais,
      meta: { fonte: 'google_places', is_demo: false },
    }),
  }));

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'ACESSAR PAINEL', exact: true }).click();
  await page.getByRole('button', { name: 'Entrar Modo Demo →', exact: true }).click();
  await page.getByRole('button', { name: 'Scanner de Leads OSINT 02', exact: true }).click();
  await page.getByRole('button', { name: /VARRER AGORA/i }).click();
  await expect(page.locator('article[aria-label^="Lead:"]')).toHaveCount(leadsReais.length);
}

test.describe('Leads — contrato de dados reais', () => {
  test.skip(({ isMobile }) => isMobile, 'Fluxo funcional coberto no desktop; o mobile já possui proteção visual.');

  test('renderiza casos-limite e habilita ações de leads reais', async ({ page }) => {
    await abrirLeadsComRespostaReal(page);

    const quente = page.getByRole('article', { name: `Lead: ${leadsReais[0].nome}` });
    await expect(quente.locator('.lead-quente')).toBeVisible();
    await expect(quente.getByText('92', { exact: true })).toBeVisible();
    await expect(quente.getByRole('button', { name: 'Criar site', exact: true })).toBeEnabled();
    await expect(quente.getByRole('button', { name: 'Enviar para CRM', exact: true })).toBeEnabled();

    const semTelefone = page.getByRole('article', { name: 'Lead: Café Sem Telefone' });
    await expect(semTelefone.getByText('Sem telefone no perfil do Google')).toBeVisible();

    const semAvaliacao = page.getByRole('article', { name: 'Lead: Oficina Sem Avaliação' });
    await expect(semAvaliacao.locator('svg.lucide-star')).toHaveCount(0);
    await expect(page.getByText(leadsReais[0].endereco, { exact: true })).toBeVisible();
    await expect(page.getByText('37', { exact: true })).toBeVisible();
  });

  test('seleção individual, selecionar todos e envio ao funil', async ({ page }) => {
    await abrirLeadsComRespostaReal(page);

    const individual = page.getByRole('checkbox', { name: `Selecionar ${leadsReais[0].nome}` });
    await individual.check();
    await expect(page.getByText('Selecionar todos (1 selecionados)', { exact: true })).toBeVisible();
    await individual.uncheck();

    const selecionarTodos = page.locator('label')
      .filter({ hasText: 'Selecionar todos' })
      .getByRole('checkbox');
    await selecionarTodos.check();
    await expect(page.getByText(`Selecionar todos (${leadsReais.length} selecionados)`, { exact: true })).toBeVisible();
    await selecionarTodos.uncheck();

    const primeiro = page.getByRole('article', { name: `Lead: ${leadsReais[0].nome}` });
    await primeiro.getByRole('button', { name: 'Enviar para CRM', exact: true }).click();
    await expect(primeiro).toHaveCount(0);

    await page.getByRole('button', { name: /Funil de Vendas/i }).click();
    await expect(page.getByText(leadsReais[0].nome, { exact: true })).toBeVisible();
  });

  test('troca de aba não perde a varredura', async ({ page }) => {
    await abrirLeadsComRespostaReal(page);
    await page.getByRole('button', { name: /Funil de Vendas/i }).click();
    await page.getByRole('button', { name: 'Scanner de Leads OSINT 02', exact: true }).click();
    await expect(page.locator('article[aria-label^="Lead:"]')).toHaveCount(leadsReais.length);
  });
});
