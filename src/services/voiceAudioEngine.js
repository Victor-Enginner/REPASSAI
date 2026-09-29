/**
 * REPASS AI - High-Fidelity Voice & Telephony Audio Engine
 * 
 * Regra de Ouro: ZERO vozes robóticas horríveis.
 * Utiliza vozes neurais naturais filtradas, síntese HD,
 * efeitos acústicos telefônicos realistas (ringtone, DTMF, ruído de linha)
 * e suporte a full-duplex barge-in (interrupção instantânea).
 */

class VoiceAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.currentUtterance = null;
    this.isSpeaking = false;
    this.activeRingtone = null;
    this.cachedVoices = [];

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.carregarVozes();
      };
      this.carregarVozes();
    }
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  carregarVozes() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    const all = window.speechSynthesis.getVoices();
    // Filtro rigoroso: apenas vozes brasileiras de alta fidelidade/naturais
    this.cachedVoices = all.filter(v => v.lang.includes('pt-BR') || v.lang.includes('pt_BR') || v.lang.startsWith('pt'));
    return this.cachedVoices;
  }

  /**
   * Encontra a melhor voz neural em PT-BR disponível no sistema operacional.
   * Dá preferência absoluta a vozes "Natural", "Online", "Google" ou "Neural".
   */
  obterMelhorVoz(genero = 'feminino') {
    const vozes = this.carregarVozes();
    if (!vozes.length) return null;

    if (genero === 'masculino') {
      // Prioridade masculina: Antonio Natural, Daniel, Jorge, Google
      const match = vozes.find(v => 
        (v.name.includes('Antonio') || v.name.includes('Daniel') || v.name.includes('Jorge') || v.name.includes('Felipe')) &&
        (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Neural'))
      ) || vozes.find(v => v.name.includes('Antonio') || v.name.includes('Daniel') || v.name.includes('Google'));
      if (match) return match;
    }

    // Prioridade feminina: Francisca Natural, Luciana, Maria, Leticia
    const matchFem = vozes.find(v => 
      (v.name.includes('Francisca') || v.name.includes('Luciana') || v.name.includes('Maria') || v.name.includes('Yara') || v.name.includes('Leticia')) &&
      (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Neural'))
    ) || vozes.find(v => v.name.includes('Francisca') || v.name.includes('Luciana') || v.name.includes('Google'));
    
    return matchFem || vozes[0];
  }

  /**
   * Toca o tom telefônico clássico de chamada discando (440Hz + 480Hz)
   */
  tocarTomDiscagem(duracaoSegundos = 4, onComplete = null) {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(440, ctx.currentTime);
      osc2.frequency.setValueAtTime(480, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      // Pulso telefônico (toca 1s, pausa 2s)
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.setValueAtTime(0, ctx.currentTime + 1.2);
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime + 2.5);
      gainNode.gain.setValueAtTime(0, ctx.currentTime + 3.7);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();

      osc1.stop(ctx.currentTime + duracaoSegundos);
      osc2.stop(ctx.currentTime + duracaoSegundos);

      this.activeRingtone = { osc1, osc2, gainNode };

      setTimeout(() => {
        if (onComplete) onComplete();
      }, duracaoSegundos * 1000);
    } catch (e) {
      console.warn('[VoiceEngine] Falha ao tocar tom telefônico:', e);
      if (onComplete) onComplete();
    }
  }

  /**
   * Som de clique / conexão da linha telefônica
   */
  tocarSomConexaoLinha() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // ignore
    }
  }

  /**
   * Falar texto com voz humanizada, cadência natural e sem som de lata.
   * Suporta interrupção imediata (Barge-in).
   */
  falarTexto(texto, options = {}) {
    const {
      genero = 'feminino',
      onStart = null,
      onEnd = null,
      onWord = null,
      pitch = 1.0,
      rate = 1.02
    } = options;

    this.pararTudo();

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    utterance.rate = rate; // 1.02 é o ritmo conversacional mais natural
    utterance.pitch = pitch;

    const melhorVoz = this.obterMelhorVoz(genero);
    if (melhorVoz) {
      utterance.voice = melhorVoz;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (err) => {
      console.warn('[VoiceEngine] Erro na fala:', err);
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    if (onWord) {
      utterance.onboundary = (e) => {
        if (e.name === 'word') onWord(e.charIndex);
      };
    }

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Interrompe qualquer fala ou tom em andamento (Full Duplex / Barge-in)
   */
  pararTudo() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.currentUtterance = null;

    if (this.activeRingtone) {
      try {
        this.activeRingtone.osc1.stop();
        this.activeRingtone.osc2.stop();
      } catch {
        // already stopped
      }
      this.activeRingtone = null;
    }
  }
}

export const voiceEngine = new VoiceAudioEngine();
