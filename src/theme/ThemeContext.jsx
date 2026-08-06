/**
 * REPASS AI — CONTEXTO DE TEMA
 *
 * Alterna entre 'light' (padrão da marca) e 'dark', persiste a escolha
 * e aplica `data-theme` no <html>.
 *
 * O padrão precisa ser o MESMO de `public/theme-init.js`, que roda antes
 * do bundle. Divergência entre os dois produz exatamente o flash que o
 * script anti-flash existe para evitar: o HTML pinta com um tema e o
 * React troca para o outro no primeiro render.
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { designTokens, TEMAS, TEMA_PADRAO, CHAVE_TEMA } from './tokens';

const ThemeContext = createContext({
  theme: TEMA_PADRAO,
  setTheme: () => {},
  toggleTheme: () => {},
  tokens: designTokens,
});

/** Lê o tema salvo, validando contra a lista conhecida. Um valor
 *  inesperado no storage (versão antiga, edição manual) não pode
 *  virar um `data-theme` sem CSS correspondente. */
function lerTemaSalvo() {
  try {
    const salvo = localStorage.getItem(CHAVE_TEMA);
    return TEMAS.includes(salvo) ? salvo : TEMA_PADRAO;
  } catch {
    // Storage bloqueado (modo privado, política corporativa).
    return TEMA_PADRAO;
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(lerTemaSalvo);

  const valor = useMemo(() => {
    const setTheme = (novoTema) => {
      if (!TEMAS.includes(novoTema)) return;
      setThemeState(novoTema);
      try {
        localStorage.setItem(CHAVE_TEMA, novoTema);
      } catch {
        // Sem persistência: o tema vale para esta sessão.
      }
    };

    return {
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === 'light' ? 'dark' : 'light'),
      tokens: designTokens,
    };
  }, [theme]);

  useEffect(() => {
    const raiz = document.documentElement;
    raiz.setAttribute('data-theme', theme);
    // A classe `dark` acompanha o atributo: utilitários de terceiros
    // (Tailwind, bibliotecas de gráfico) leem a classe, não o atributo.
    raiz.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return <ThemeContext.Provider value={valor}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
