/**
 * Script anti-flash de tema.
 *
 * Roda de forma síncrona no <head>, antes do primeiro pixel, para que a
 * página já pinte no tema certo. Arquivo externo (e não inline) porque a
 * CSP do index.html usa `script-src 'self'`.
 *
 * O padrão 'light' precisa bater com TEMA_PADRAO em src/theme/tokens.js.
 * Se divergir, o HTML pinta num tema e o React troca no primeiro render —
 * que é justamente o flash que este arquivo evita.
 */
(function () {
  var PADRAO = 'light';
  var VALIDOS = ['light', 'dark'];
  var tema = PADRAO;

  try {
    var salvo = localStorage.getItem('repass_theme');
    if (VALIDOS.indexOf(salvo) !== -1) tema = salvo;
  } catch (_) {
    // Storage bloqueado: segue no padrão da marca.
  }

  var raiz = document.documentElement;
  raiz.setAttribute('data-theme', tema);
  raiz.classList.toggle('dark', tema === 'dark');

  // Cor de partida enquanto o CSS não chegou. Vai no <html> (e não no
  // <body> via atributo style) porque ali ela é sobrescrita normalmente
  // pela folha, sem disputa de especificidade.
  raiz.style.backgroundColor = tema === 'dark' ? '#0b0c10' : '#f5f4f0';
})();
