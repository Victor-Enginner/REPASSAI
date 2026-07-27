# -*- coding: utf-8 -*-
"""
REPASS AI - Gateway de LLM com Rotação de Chaves (100% modelos gratuitos).

Todas as chaves ficam AQUI, no servidor. O frontend chama /api/ai/generate
e recebe só o texto — nunca vê provedor, modelo ou chave. Isso resolve três
problemas de uma vez:

  1. Segurança: chave de API nunca chega ao navegador do cliente.
  2. Segredo comercial: o cliente não descobre qual modelo você usa.
  3. Rate limit: podemos rotacionar entre várias chaves e provedores sem
     que o frontend saiba que isso está acontecendo.

ROTAÇÃO
-------
Cada provedor aceita VÁRIAS chaves separadas por vírgula no .env. O gateway
usa round-robin entre elas e, ao receber 429 (rate limit), marca aquela
chave como em descanso e passa para a próxima automaticamente.

CONFIGURAÇÃO
------------
Ver backend/.env.example. Nenhuma chave é obrigatória individualmente, mas
pelo menos uma precisa existir para a geração por IA funcionar.
"""

import os
import json
import time
import threading
import urllib.error
import urllib.request

# Janela de descanso após um 429, por chave. A maioria dos limites free é
# por minuto, então 60s devolve a chave ao rodízio no próximo ciclo.
DESCANSO_APOS_429 = 60

TIMEOUT_PADRAO = 45


def _chaves(nome_var):
    """
    Lê uma variável de ambiente que pode conter várias chaves.

    Formato aceito: "chave1,chave2,chave3". Espaços são ignorados.
    """
    bruto = os.environ.get(nome_var, "") or ""
    return [k.strip() for k in bruto.split(",") if k.strip()]


class RotacaoDeChaves:
    """Round-robin de chaves com quarentena para as que bateram no limite."""

    def __init__(self, chaves):
        self.chaves = list(chaves)
        self._indice = 0
        self._descanso = {}  # chave -> timestamp em que volta a valer
        self._lock = threading.Lock()

    def disponivel(self):
        """True se há pelo menos uma chave fora de quarentena."""
        agora = time.time()
        return any(self._descanso.get(k, 0) <= agora for k in self.chaves)

    def proxima(self):
        """Devolve a próxima chave utilizável, ou None se todas descansando."""
        with self._lock:
            agora = time.time()
            for _ in range(len(self.chaves)):
                chave = self.chaves[self._indice % len(self.chaves)]
                self._indice += 1
                if self._descanso.get(chave, 0) <= agora:
                    return chave
            return None

    def marcar_limite(self, chave):
        """Coloca a chave em quarentena após um 429."""
        with self._lock:
            self._descanso[chave] = time.time() + DESCANSO_APOS_429


class Provedor:
    """
    Um provedor de LLM gratuito.

    `formato` define o corpo da requisição:
      - "openai": OpenRouter, Groq (e qualquer compatível)
      - "gemini": Google AI Studio (API nativa)
      - "ollama": instância local
    """

    def __init__(self, id_, nome, url, modelo, chaves, formato, prioridade):
        self.id = id_
        self.nome = nome
        self.url = url
        self.modelo = modelo
        self.rotacao = RotacaoDeChaves(chaves)
        self.formato = formato
        self.prioridade = prioridade

    def habilitado(self):
        # Ollama roda local e não precisa de chave.
        if self.formato == "ollama":
            return bool(self.url)
        return bool(self.rotacao.chaves)


def carregar_provedores():
    """
    Monta a cadeia de provedores a partir do .env, em ordem de prioridade.

    Modelos padrão são todos gratuitos e verificados. Cada um pode ser
    trocado por variável de ambiente sem mexer no código — útil porque a
    lista de modelos free do OpenRouter muda com frequência.
    """
    provedores = [
        Provedor(
            "groq",
            "Groq",
            "https://api.groq.com/openai/v1/chat/completions",
            os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile"),
            _chaves("GROQ_API_KEYS"),
            "openai",
            1,  # menor latência do mercado (LPU) e cota diária alta
        ),
        Provedor(
            "gemini",
            "Google AI Studio",
            "https://generativelanguage.googleapis.com/v1beta/models/"
            + os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
            + ":generateContent",
            os.environ.get("GEMINI_MODEL", "gemini-2.0-flash"),
            _chaves("GOOGLE_AI_API_KEYS"),
            "gemini",
            2,  # 1.500 req/dia grátis na chave nativa
        ),
        Provedor(
            "openrouter",
            "OpenRouter",
            "https://openrouter.ai/api/v1/chat/completions",
            # Verificado contra /api/v1/models: modelos :free entram e saem
            # da lista com frequência. Este respondeu OK e tem 262K de
            # contexto, o que comporta o catálogo de componentes inteiro.
            os.environ.get("OPENROUTER_MODEL", "nvidia/nemotron-3-super-120b-a12b:free"),
            _chaves("OPENROUTER_API_KEYS"),
            "openai",
            3,
        ),
        Provedor(
            "ollama",
            "Ollama Local",
            os.environ.get("OLLAMA_URL", "http://localhost:11434/api/generate"),
            os.environ.get("OLLAMA_MODEL", "qwen2.5-coder"),
            [],
            "ollama",
            4,  # rede de segurança: custo zero, sem limite, sem internet
        ),
    ]

    ativos = [p for p in provedores if p.habilitado()]
    ativos.sort(key=lambda p: p.prioridade)
    return ativos


def _montar_corpo(provedor, prompt, system_prompt, temperature):
    """Monta o payload no formato que o provedor espera."""
    if provedor.formato == "gemini":
        return {
            "contents": [{"parts": [{"text": f"{system_prompt}\n\n{prompt}"}]}],
            "generationConfig": {"temperature": temperature},
        }

    if provedor.formato == "ollama":
        return {
            "model": provedor.modelo,
            "prompt": f"{system_prompt}\n\n{prompt}",
            "stream": False,
            "options": {"temperature": temperature},
        }

    return {
        "model": provedor.modelo,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
        "temperature": temperature,
    }


def _extrair_texto(provedor, dados):
    """Extrai o texto da resposta conforme o formato do provedor."""
    if provedor.formato == "gemini":
        candidatos = dados.get("candidates") or []
        if not candidatos:
            return ""
        partes = (candidatos[0].get("content") or {}).get("parts") or []
        return partes[0].get("text", "") if partes else ""

    if provedor.formato == "ollama":
        return dados.get("response", "")

    escolhas = dados.get("choices") or []
    if not escolhas:
        return ""
    return (escolhas[0].get("message") or {}).get("content", "")


def _chamar(provedor, chave, prompt, system_prompt, temperature):
    """
    Faz uma chamada HTTP ao provedor.

    Levanta urllib.error.HTTPError em erro de status, para o chamador poder
    distinguir 429 (rotacionar chave) de outros erros (trocar de provedor).
    """
    url = provedor.url
    # User-Agent explícito: o padrão do urllib ("Python-urllib/3.x") é
    # bloqueado pelo Cloudflare de alguns provedores, o que aparecia como
    # HTTP 403 / erro 1010 mesmo com a chave correta.
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "REPASS-AI/1.0",
    }

    if provedor.formato == "gemini":
        url = f"{provedor.url}?key={chave}"
    elif provedor.formato == "openai":
        headers["Authorization"] = f"Bearer {chave}"
        if provedor.id == "openrouter":
            # O OpenRouter pede identificação do app nos modelos gratuitos.
            headers["HTTP-Referer"] = os.environ.get("PUBLIC_BASE_URL", "http://localhost:8000")
            headers["X-Title"] = "REPASS AI"

    corpo = json.dumps(_montar_corpo(provedor, prompt, system_prompt, temperature)).encode("utf-8")
    req = urllib.request.Request(url, data=corpo, headers=headers, method="POST")

    with urllib.request.urlopen(req, timeout=TIMEOUT_PADRAO) as res:
        return json.loads(res.read().decode("utf-8"))


def gerar(prompt, system_prompt="Você é um assistente do REPASS AI.", temperature=0.0):
    """
    Executa o prompt percorrendo provedores e chaves até obter resposta.

    Estratégia por provedor: tenta cada chave do rodízio. Em 429, coloca a
    chave em quarentena e tenta a próxima. Esgotadas as chaves, passa ao
    provedor seguinte.

    Returns:
        dict com:
          sucesso (bool), texto (str), erro (str|None), trace (list[str])

        O retorno NÃO inclui provedor nem modelo: essa informação fica no
        servidor de propósito. Use `trace` só em log interno.
    """
    provedores = carregar_provedores()
    trace = []

    if not provedores:
        return {
            "sucesso": False,
            "texto": "",
            "erro": "Nenhum provedor de IA configurado no servidor.",
            "trace": ["nenhum provedor habilitado — preencha as chaves em backend/.env"],
        }

    for provedor in provedores:
        # Ollama não usa chave: uma tentativa direta.
        tentativas = max(1, len(provedor.rotacao.chaves)) if provedor.formato != "ollama" else 1

        for _ in range(tentativas):
            chave = None
            if provedor.formato != "ollama":
                chave = provedor.rotacao.proxima()
                if chave is None:
                    trace.append(f"{provedor.id}: todas as chaves em descanso (429)")
                    break

            try:
                dados = _chamar(provedor, chave, prompt, system_prompt, temperature)
                texto = _extrair_texto(provedor, dados)

                if not texto or not texto.strip():
                    trace.append(f"{provedor.id}: resposta vazia")
                    continue

                trace.append(f"{provedor.id}: ok")
                return {"sucesso": True, "texto": texto, "erro": None, "trace": trace}

            except urllib.error.HTTPError as e:
                if e.code == 429:
                    trace.append(f"{provedor.id}: 429, rotacionando chave")
                    if chave:
                        provedor.rotacao.marcar_limite(chave)
                    continue
                detalhe = ""
                try:
                    detalhe = e.read().decode("utf-8")[:200]
                except Exception:
                    pass
                trace.append(f"{provedor.id}: HTTP {e.code} {detalhe}")
                break

            except Exception as e:
                trace.append(f"{provedor.id}: {type(e).__name__} {e}")
                break

    return {
        "sucesso": False,
        "texto": "",
        "erro": "Nenhum provedor de IA conseguiu responder no momento.",
        "trace": trace,
    }


def _ollama_no_ar(url, timeout=1.5):
    """
    Verifica se há um Ollama realmente atendendo.

    Ter a URL no .env não significa que o processo está rodando. Sem esta
    checagem o painel mostraria "operacional" enquanto toda geração falha.
    """
    try:
        base = url.split("/api/")[0]
        req = urllib.request.Request(f"{base}/api/tags", method="GET")
        with urllib.request.urlopen(req, timeout=timeout):
            return True
    except Exception:
        return False


def status():
    """
    Status da cadeia para o painel, SEM revelar modelos ou chaves.

    O painel mostra só quantos motores estão prontos. Qual modelo roda por
    trás é informação do servidor.
    """
    provedores = carregar_provedores()

    prontos = 0
    for p in provedores:
        if p.formato == "ollama":
            if _ollama_no_ar(p.url):
                prontos += 1
        elif p.rotacao.disponivel():
            prontos += 1

    total_chaves = sum(len(p.rotacao.chaves) for p in provedores)

    return {
        "motores_configurados": len(provedores),
        "motores_prontos": prontos,
        "chaves_em_rotacao": total_chaves,
        "operacional": prontos > 0,
    }
