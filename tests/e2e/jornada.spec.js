import { expect, test } from '@playwright/test';

/**
 * Coletor de falhas. Tudo que um usuário sofreria calado — erro de console,
 * violação de CSP, requisição derrubada, 5xx da API — vira falha de teste.
 *
 * O bug que originou esta suíte era exatamente calado: a CSP bloqueava
 * `localhost:8000`, `obterConfig()` engolia o erro num catch e a tela seguia
 * "normal", só que sem backend.
 */
function vigiar(page) {
  const problemas = [];
  // "Da casa" = servido pelo próprio REPASS (qualquer porta do localhost).
  const daCasa = (url) => {
    try { return ['127.0.0.1', 'localhost'].includes(new URL(url).hostname); } catch { return false; }
  };
  const deTerceiro = (url) => Boolean(url) && !daCasa(url);

  // Conteúdo de template/site gerado roda em iframe e traz seus próprios
  // scripts, imagens e CDNs (link morto, hotlink bloqueado, CSP do preview
  // barrando `blob:` do GLTFLoader...). Isso é conteúdo do template, não do
  // REPASS. O erro de origem "da casa" fora do preview continua reprovando.
  const ehConteudoDePreview = (loc) => {
    const url = loc?.url || '';
    return deTerceiro(url) || /\/api\/(templates\/preview|site\/preview_html)/.test(url);
  };

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    if (ehConteudoDePreview(msg.location())) return;
    problemas.push(`console: ${msg.text()}`);
  });
  page.on('pageerror', (erro) => problemas.push(`pageerror: ${erro.message}`));
  page.on('requestfailed', (req) => {
    const url = req.url();
    // O fluxo SSE é fechado de propósito quando a view desmonta.
    if (url.includes('/api/logs/stream')) return;
    // ERR_ABORTED é o navegador cancelando um download que perdeu o destino
    // (ex.: preview de template em iframe que desmontou ao trocar de aba).
    // Não é falha de rede — as CDNs externas dos templates geram centenas.
    if (req.failure()?.errorText === 'net::ERR_ABORTED') return;
    // Recurso de terceiro carregado dentro de um iframe de preview: conteúdo
    // do template (ex.: Unsplash bloqueado por ORB). Já as chamadas do próprio
    // app, ou de qualquer recurso da mesma origem, continuam valendo.
    if (deTerceiro(url) && req.frame() !== page.mainFrame()) return;
    problemas.push(`requisição falhou: ${req.method()} ${url} — ${req.failure()?.errorText}`);
  });
  page.on('response', (res) => {
    const url = res.url();
    if (url.includes('/api/') && res.status() >= 500) {
      problemas.push(`API ${res.status()}: ${res.request().method()} ${url}`);
    }
  });

  return problemas;
}

/** Toda chamada de API tem de sair pela origem do painel (proxy), nunca direto na 8000. */
function chamadasForaDaOrigem(page) {
  const fora = [];
  page.on('request', (req) => {
    const url = new URL(req.url());
    if (url.pathname.startsWith('/api/') && url.port === '8000') fora.push(req.url());
  });
  return fora;
}

async function abrirPainelEmModoDemo(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'ACESSAR PAINEL', exact: true }).click();
  await page.getByRole('button', { name: 'Entrar Modo Demo →', exact: true }).click();
}

test.describe('Backend pelo proxy', () => {
  test('/api/health responde 200 pela origem do painel', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
  });

  test('/api/auth/status devolve a configuração de auth', async ({ request }) => {
    const res = await request.get('/api/auth/status');
    expect(res.status()).toBe(200);
    const corpo = await res.json();
    expect(corpo).toHaveProperty('modo');
    expect(corpo).toHaveProperty('auth_ativo');
  });

  test('banco (Supabase) está acessível: /api/sites responde 200', async ({ request }) => {
    // Em single_user/dev o backend usa REPASS_DEV_USER_ID. 503 aqui = o
    // Supabase configurado no backend/.env não responde (DNS, projeto
    // pausado/apagado, chave inválida). Sites, leads e funil dependem disso.
    const res = await request.get('/api/sites');
    expect(res.status(), await res.text()).toBe(200);
  });

  test('/api/templates lista templates', async ({ request }) => {
    const res = await request.get('/api/templates');
    expect(res.status()).toBe(200);
  });
});

test.describe('Jornada do usuário', () => {
  test('landing carrega sem erro nenhum', async ({ page }) => {
    const problemas = vigiar(page);
    const fora = chamadasForaDaOrigem(page);

    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.getByRole('button', { name: 'ACESSAR PAINEL', exact: true })).toBeVisible();

    expect(fora, 'API chamada direto na :8000 (a CSP bloqueia)').toEqual([]);
    expect(problemas).toEqual([]);
  });

  test('"Acessar painel" mostra o login e consulta o auth pela mesma origem', async ({ page }) => {
    const problemas = vigiar(page);
    const fora = chamadasForaDaOrigem(page);

    // A espera nasce ANTES da navegação: o app consulta o auth logo ao
    // carregar, e registrar depois do goto perdia a resposta quando ela vinha
    // rápido (falhava de vez em quando, sem que o app tivesse defeito).
    const authStatus = page.waitForResponse((r) => r.url().includes('/api/auth/status'));
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'ACESSAR PAINEL', exact: true }).click();

    expect((await authStatus).status()).toBe(200);
    await expect(page.getByRole('button', { name: 'CRIAR CONTA', exact: true })).toBeVisible();
    await expect(page.getByLabel('E-MAIL')).toBeVisible();

    expect(fora, 'API chamada direto na :8000 (a CSP bloqueia)').toEqual([]);
    expect(problemas).toEqual([]);
  });

  test('login com credenciais erradas mostra erro claro, não quebra', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'ACESSAR PAINEL', exact: true }).click();
    await page.getByLabel('E-MAIL').fill('ninguem@exemplo.com');
    await page.getByLabel('Senha', { exact: true }).fill('senha-errada-123');
    await page.getByRole('button', { name: 'ENTRAR', exact: true }).last().click();

    // Não pode entrar, nem cair em tela branca.
    await expect(page.getByText('ESTA ABA FALHOU')).toHaveCount(0);
    await expect(page.getByLabel('E-MAIL')).toBeVisible();
  });

  test('Modo Demo abre o painel', async ({ page }) => {
    const problemas = vigiar(page);
    await abrirPainelEmModoDemo(page);

    await expect(page.getByLabel('Navegação principal')).toBeVisible();
    expect(problemas).toEqual([]);
  });

  test('nenhuma aba do menu quebra', async ({ page }) => {
    const problemas = vigiar(page);
    await abrirPainelEmModoDemo(page);
    const menu = page.getByLabel('Navegação principal');
    await expect(menu).toBeVisible();

    const abas = [
      'Painel', 'Scanner de Leads', 'Funil de Vendas', 'Abordagem 1-a-1',
      'Motor Neural', 'Agenda', 'Meus Sites', 'Faturamento',
      'Indicações', 'Loja de Templates', 'Criar Site',
    ];

    const quebradas = [];
    for (const nome of abas) {
      await menu.getByRole('button', { name: new RegExp(nome) }).first().click();
      await page.waitForTimeout(700);
      if (await page.getByText('ESTA ABA FALHOU').count()) quebradas.push(nome);
    }

    expect(quebradas, 'abas que caíram no ViewErrorBoundary').toEqual([]);
    expect(problemas).toEqual([]);
  });

  test('Loja de Templates carrega a lista e abre um preview', async ({ page }) => {
    const problemas = vigiar(page);
    await abrirPainelEmModoDemo(page);

    await page.getByLabel('Navegação principal')
      .getByRole('button', { name: /Loja de Templates/ }).first().click();

    const lista = await page.waitForResponse((r) => r.url().includes('/api/templates') && !r.url().includes('/preview'));
    expect(lista.status()).toBe(200);
    await expect(page.locator('iframe').first()).toBeVisible();

    expect(problemas).toEqual([]);
  });

  test('Scanner de Leads exibe os controles de busca', async ({ page }) => {
    const problemas = vigiar(page);
    await abrirPainelEmModoDemo(page);

    await page.getByLabel('Navegação principal')
      .getByRole('button', { name: /Scanner de Leads/ }).first().click();

    await expect(page.getByTestId('leads-controls')).toBeVisible();
    await expect(page.getByLabel('País', { exact: true })).toHaveCount(1);
    await expect(page.getByLabel('Estado', { exact: true })).toHaveCount(1);
    await expect(page.getByLabel(/^Cidade/)).toHaveCount(1);

    expect(problemas).toEqual([]);
  });
});

test.describe('Tela de login: parede de glifos (WebGL)', () => {
  for (const movimento of ['no-preference', 'reduce']) {
    test.describe(`movimento do sistema: ${movimento}`, () => {
      // `test.use({ reducedMotion })` NÃO é aplicado por este executor:
      // dentro do teste `matchMedia` continuava dizendo "sem preferência" e a
      // variante "reduce" rodava no modo normal, passando por engano. A
      // emulação vai por `emulateMedia`, e a checagem abaixo grita se ela
      // não pegar, para o teste nunca mais validar o modo errado.
      test.beforeEach(async ({ page }) => {
        await page.emulateMedia({ reducedMotion: movimento });
        const aplicado = await page.evaluate(
          () => matchMedia('(prefers-reduced-motion: reduce)').matches,
        );
        expect(aplicado, `emulação de movimento "${movimento}" não foi aplicada`).toBe(movimento === 'reduce');
      });

      test('desenha o fundo no tamanho do painel, sem erro, e sobrevive a sair e voltar', async ({ page }) => {
        const problemas = vigiar(page);
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        // Duas idas ao login: a segunda prova que a limpeza do contexto WebGL
        // não deixa o canvas seguinte com um contexto morto (foi o bug que o
        // StrictMode do React expôs: "shader info log: null").
        for (let volta = 1; volta <= 2; volta += 1) {
          await page.getByRole('button', { name: 'ACESSAR PAINEL', exact: true }).click();
          const canvas = page.locator('.login-painel canvas');
          await expect(canvas).toHaveCount(1);

          // 300x150 é o tamanho padrão de um canvas que nunca foi desenhado.
          await expect.poll(
            () => canvas.evaluate((c) => c.width),
            { message: `canvas nunca foi dimensionado (volta ${volta})` },
          ).toBeGreaterThan(300);

          if (volta === 1) await page.getByText('← Voltar ao site').click();
        }

        expect(problemas).toEqual([]);
      });

      if (movimento === 'reduce') {
        test('menos movimento: não anima sozinho e volta a dormir depois do mouse', async ({ page }) => {
          await page.goto('/', { waitUntil: 'domcontentloaded' });
          await page.getByRole('button', { name: 'ACESSAR PAINEL', exact: true }).click();
          await expect(page.locator('.login-painel canvas')).toHaveCount(1);
          await page.waitForTimeout(1200);

          const painel = page.locator('.login-painel');
          const a = await painel.screenshot();
          await page.waitForTimeout(900);
          expect((await painel.screenshot()).equals(a), 'animou sozinho apesar de "menos movimento"').toBe(true);

          for (let i = 0; i <= 20; i += 1) {
            await page.mouse.move(80 + i * 12, 300);
            await page.waitForTimeout(25);
          }
          await page.mouse.move(1200, 500); // sai do painel
          await page.waitForTimeout(2500); // rastro apaga
          const b = await painel.screenshot();
          await page.waitForTimeout(900);
          expect((await painel.screenshot()).equals(b), 'o laço não voltou a dormir').toBe(true);
        });
      }

      test('a lanterna acende os glifos quando o mouse passa pelo painel', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await page.getByRole('button', { name: 'ACESSAR PAINEL', exact: true }).click();
        await expect(page.locator('.login-painel canvas')).toHaveCount(1);
        await page.waitForTimeout(1200);

        const painel = page.locator('.login-painel');
        const antes = await painel.screenshot();

        for (let i = 0; i <= 30; i += 1) {
          await page.mouse.move(80 + i * 12, 300 + Math.sin(i / 3) * 100);
          await page.waitForTimeout(25);
        }
        const durante = await painel.screenshot();

        // Foi o bug que eu introduzi: com "menos movimento" o efeito virava
        // uma imagem parada e o mouse não fazia nada.
        expect(durante.equals(antes), 'o mouse não mudou o desenho do painel').toBe(false);
      });
    });
  }
});
