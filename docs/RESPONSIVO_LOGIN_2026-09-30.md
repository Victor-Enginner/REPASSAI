# Correções responsivas e login

Deploy Netlify confirmado: 6abd071083be5e7682d32640.

Mudanças: hero em grade 2×2 no celular; ícones Google/Microsoft coloridos e GitHub monocromático; dock oculto na landing/login; usuário confirmado por /api/auth/status abre o dashboard após recarregar, sem retornar automaticamente à landing.

Teste reproduzível: `node scripts/verificar-responsivo-login.mjs`. AUDIT_URL permite testar o endereço publicado.
Resoluções: 320×700, 390×844, 768×1024, 1024×768, 1360×768 e 1920×1080.
Capturas: test-results/responsivo-login.

Os testes interceptam a API para validar layout e restauração da interface com sessão simulada. Não comprovam persistência real dos cookies nem funcionamento do banco. Teste humano necessário: login real, F5, permanecer no painel, logout.
Escopo desta rodada: landing e login. Não é aprovação de todas as abas autenticadas, de todos os aparelhos ou de Safari/WebKit.
