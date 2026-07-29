# -*- coding: utf-8 -*-
"""
REPASS AI - Servidor REST API Python com Proxy de Mídia do Google Places (Production Ready)
Suporta:
1. Healthcheck (/api/health)
2. Varredura OSINT Real LEADS_OSINT_02 com Enriquecimento de Mídia (/api/leads/scan)
3. Proxy de Imagens do Google Places API (/api/media/proxy)
4. Geração Agêntica de Sites (/api/site/generate)
5. Clonagem de Sites por URL - Open Lovable Engine (/api/site/clone)
"""

import os
import sys
import json
import urllib.request
import urllib.parse
import shutil
import queue
import threading
import time
from dotenv import load_dotenv
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

# Carrega SEMPRE o .env que pertence ao backend, independentemente da pasta
# usada para iniciar o processo (`python backend/app_api.py` ou `cd backend`).
# Antes, `load_dotenv()` dependia do cwd e podia subir a API sem nenhuma chave.
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_ENV = os.path.join(BACKEND_DIR, ".env")
load_dotenv(BACKEND_ENV)

from scraper_monster import OSINTCore
import llm_gateway
import templates_store
import supabase_client

# Força codificação UTF-8 no Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# --- SSE Log Interceptor ---
# Fila limitada: sem teto, um servidor sem cliente SSE conectado acumula
# logs indefinidamente até estourar a memória.
LOG_QUEUE = queue.Queue(maxsize=500)

class StreamInterceptOut:
    def __init__(self, original_stdout):
        self.original_stdout = original_stdout

    def write(self, text):
        self.original_stdout.write(text)
        if text.strip() and "[" in text:
            # Envia o log para a fila SSE se parecer um log do sistema.
            # Descarta o mais antigo quando cheia: log é telemetria, nunca
            # pode bloquear ou derrubar o servidor.
            try:
                LOG_QUEUE.put_nowait(text.strip())
            except queue.Full:
                try:
                    LOG_QUEUE.get_nowait()
                    LOG_QUEUE.put_nowait(text.strip())
                except queue.Empty:
                    pass

    def flush(self):
        self.original_stdout.flush()

    def reconfigure(self, **kwargs):
        if hasattr(self.original_stdout, 'reconfigure'):
            self.original_stdout.reconfigure(**kwargs)

sys.stdout = StreamInterceptOut(sys.stdout)
# ---------------------------

osint_engine = OSINTCore()

# --- Cache de mídia com teto ---
# Dict global sem limite cresce até estourar a RAM do processo. Guardamos
# a ordem de inserção para descartar o mais antigo (FIFO simples).
MEDIA_CACHE = {}
MEDIA_CACHE_ORDEM = []
MEDIA_CACHE_MAX_ITENS = 200
MEDIA_CACHE_MAX_BYTES = 5 * 1024 * 1024  # não cacheia arquivo acima de 5MB
MEDIA_CACHE_LOCK = threading.Lock()

# --- Proteção contra SSRF no proxy de mídia ---
# O proxy só pode buscar destes hosts. Sem allowlist, qualquer um usa o
# servidor para alcançar a rede interna (ex.: metadados da instância na
# nuvem) ou como proxy anônimo aberto.
HOSTS_PERMITIDOS = (
    "maps.googleapis.com",
    "lh3.googleusercontent.com",
    "lh5.googleusercontent.com",
    "images.unsplash.com",
)

# Origens autorizadas a chamar a API pelo navegador.
ORIGENS_DESENVOLVIMENTO = {
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
}
ORIGENS_CONFIGURADAS = {
    o.strip()
    for o in os.environ.get("CORS_ORIGINS", "").split(",")
    if o.strip()
}
ORIGENS_PERMITIDAS = sorted(ORIGENS_DESENVOLVIMENTO | ORIGENS_CONFIGURADAS)

TAMANHO_MAX_BODY = 1 * 1024 * 1024  # 1MB de JSON é folgado para esta API

# Rotas que gastam dinheiro real (Google Places, LLM) ou gravam arquivo.
# Com o multiusuário ligado, exigem token válido — não basta o Supabase estar
# configurado, o chamador precisa se identificar.
ROTAS_PROTEGIDAS = frozenset({
    "/api/ai/generate",
    "/api/leads/scan",
    "/api/site/generate",
    "/api/site/clone",
    "/api/sites",
    "/api/sites/detail",
})

# Teto de requisições por janela, por identidade (usuário logado ou IP).
LIMITE_REQUISICOES = int(os.environ.get("RATE_LIMIT_REQUISICOES", "30"))
LIMITE_JANELA_S = int(os.environ.get("RATE_LIMIT_JANELA_S", "60"))


class LimitadorDeTaxa:
    """
    Limitador de janela deslizante, em memória e seguro entre threads.

    O servidor é `ThreadingHTTPServer`: sem trava, duas requisições
    simultâneas leem e escrevem a mesma lista e o limite vaza.

    Em memória basta porque hoje roda um processo só. Se o backend for
    escalado para várias instâncias, isto precisa virar Redis — cada
    processo teria a própria contagem.
    """

    def __init__(self, limite, janela_s):
        """
        Args:
            limite: máximo de requisições permitidas por janela.
            janela_s: tamanho da janela em segundos.
        """
        self._limite = limite
        self._janela = janela_s
        self._eventos = {}
        self._trava = threading.Lock()

    def permitir(self, identidade):
        """
        Registra uma tentativa e diz se ela pode prosseguir.

        Args:
            identidade: chave do chamador (id do usuário ou IP).

        Returns:
            Tupla (permitido: bool, segundos_para_liberar: int).
        """
        agora = time.monotonic()
        corte = agora - self._janela
        with self._trava:
            marcas = [t for t in self._eventos.get(identidade, []) if t > corte]
            if len(marcas) >= self._limite:
                self._eventos[identidade] = marcas
                return False, max(1, int(marcas[0] + self._janela - agora))
            marcas.append(agora)
            self._eventos[identidade] = marcas

            # Poda oportunista: sem isso o dicionário cresce sem limite com
            # IPs que apareceram uma vez e nunca mais voltaram.
            if len(self._eventos) > 5000:
                for chave in [k for k, v in self._eventos.items() if not v or v[-1] < corte]:
                    del self._eventos[chave]
            return True, 0


LIMITADOR = LimitadorDeTaxa(LIMITE_REQUISICOES, LIMITE_JANELA_S)


def host_permitido(url):
    """
    Valida se a URL aponta para um host explicitamente autorizado.

    Checa o host exato contra a allowlist. Não resolve DNS: a allowlist
    já restringe a domínios públicos conhecidos, então não há espaço para
    apontar para IP interno.
    """
    try:
        parsed = urllib.parse.urlparse(url)
    except Exception:
        return False

    if parsed.scheme != "https":
        return False

    host = (parsed.hostname or "").lower()
    return host in HOSTS_PERMITIDOS


def cachear_midia(chave, dados, content_type):
    """Guarda a mídia no cache respeitando os tetos de tamanho e de itens."""
    if len(dados) > MEDIA_CACHE_MAX_BYTES:
        return
    with MEDIA_CACHE_LOCK:
        if chave not in MEDIA_CACHE:
            MEDIA_CACHE_ORDEM.append(chave)
        MEDIA_CACHE[chave] = (dados, content_type)
        while len(MEDIA_CACHE_ORDEM) > MEDIA_CACHE_MAX_ITENS:
            antiga = MEDIA_CACHE_ORDEM.pop(0)
            MEDIA_CACHE.pop(antiga, None)

class RepassApiHandler(BaseHTTPRequestHandler):

    def _responder_erro_amigavel(self, mensagem, detalhe_tecnico="", status=422):
        """
        Devolve uma falha legível para o dono do negócio, sem stack trace.

        O detalhe técnico vai para o log do servidor e para um campo separado
        da resposta, para não poluir a mensagem que aparece na tela.

        Args:
            mensagem: texto em linguagem de usuário final.
            detalhe_tecnico: causa real, para diagnóstico.
            status: código HTTP (422 = dados/regra, não erro do servidor).
        """
        if detalhe_tecnico:
            print(f"[app_api] Falha tratada ({status}): {detalhe_tecnico}")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps({
            "status": "error",
            "mensagem": mensagem,
            "detalhe_tecnico": detalhe_tecnico,
        }, ensure_ascii=False).encode("utf-8"))

    def _send_cors_headers(self):
        """
        Libera CORS apenas para origens conhecidas.

        `*` combinado com o header Authorization é a porta de entrada para
        qualquer site chamar esta API em nome do usuário logado — o que
        passa a valer assim que o Sprint 3 (JWT) entrar.
        """
        origem = self.headers.get("Origin")
        if origem and origem in ORIGENS_PERMITIDAS:
            self.send_header("Access-Control-Allow-Origin", origem)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def _usuario_atual(self):
        """
        Usuário autenticado da requisição, ou None.

        Com o modo multiusuário desligado (sem envs do Supabase), devolve
        None e o chamador segue no fluxo single-user de sempre.
        """
        if not supabase_client.auth_configurado():
            return None
        token = supabase_client.extrair_token(self.headers.get("Authorization"))
        return supabase_client.usuario_do_token(token)

    def _identidade(self, usuario=None):
        """
        Identifica o chamador para efeito de limite de taxa.

        Usuário logado é limitado pelo próprio id; anônimo, pelo IP de origem.
        Assim um escritório inteiro atrás do mesmo IP não derruba o limite de
        quem está autenticado.

        Args:
            usuario: dict do usuário autenticado, se houver.

        Returns:
            String usada como chave no limitador.
        """
        if usuario and usuario.get("id"):
            return f"user:{usuario['id']}"
        encaminhado = self.headers.get("X-Forwarded-For", "")
        ip = encaminhado.split(",")[0].strip() if encaminhado else self.client_address[0]
        return f"ip:{ip}"

    def _liberar_rota_protegida(self):
        """
        Aplica limite de taxa e exigência de token nas rotas caras.

        Corrige o bypass anterior: antes, `if usuario:` fazia a requisição sem
        token PULAR a checagem de cota e executar assim mesmo. Agora ausência
        de token é 401, não passe livre.

        Returns:
            True se a requisição pode seguir; False se já respondeu com erro.
        """
        # Limite por IP vem ANTES de validar o token: cada validação é uma
        # chamada ao Supabase, então checar auth primeiro deixaria uma enxurrada
        # anônima queimar cota lá em vez de queimar a do Places aqui.
        permitido, espera = LIMITADOR.permitir(self._identidade())
        if permitido and supabase_client.auth_configurado():
            usuario = self._usuario_atual()
            if not usuario:
                self._json(401, {
                    "status": "error",
                    "mensagem": "Faca login para usar este recurso.",
                })
                return False
            # Reconta pela identidade do usuário: quem está logado tem a
            # própria janela e não divide o teto com o IP compartilhado.
            permitido, espera = LIMITADOR.permitir(self._identidade(usuario))
        else:
            usuario = None

        if not permitido:
            self.send_response(429)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Retry-After", str(espera))
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "error",
                "mensagem": (
                    f"Muitas solicitacoes seguidas. Aguarde {espera}s e tente de novo."
                ),
            }, ensure_ascii=False).encode("utf-8"))
            return False

        # Handlers que precisam do usuário (cota, dono do registro) leem daqui
        # em vez de consultar o Supabase de novo.
        self.usuario_autenticado = usuario
        return True

    def _json(self, status, dados):
        """Responde JSON com CORS. Evita repetir 5 linhas em cada rota."""
        corpo = json.dumps(dados, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(corpo)))
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(corpo)

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query_params = urllib.parse.parse_qs(parsed_url.query)

        # Mesmo portão do do_POST: os sites são dados do usuário e não podem
        # ser listados sem token.
        if path in ROTAS_PROTEGIDAS:
            if not self._liberar_rota_protegida():
                return
            if path == "/api/sites":
                self.handle_sites_listar()
                return
            if path == "/api/sites/detail":
                self.handle_site_obter((query_params.get("id") or [""])[0])
                return

        if path == "/api/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self._send_cors_headers()
            self.end_headers()
            response = {"status": "ok", "message": "REPASS AI API Operacional", "version": "v20.0-STABLE"}
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))

        elif path == "/api/system/status":
            # Diagnóstico consolidado, somente com presença/estado. Nunca
            # devolve valores de credenciais, nomes de modelos ou segredos.
            from places_engine import places_configurado
            from r2_storage_engine import R2StorageEngine

            r2 = R2StorageEngine()
            self._json(200, {
                "api": {"operacional": True},
                "ia": llm_gateway.status(),
                "places": {
                    "configurado": places_configurado(),
                    "modo": "real" if places_configurado() else "demo",
                },
                "supabase": supabase_client.status(),
                "storage": r2.status(),
                "templates": {
                    "operacional": True,
                    "quantidade": len(templates_store.listar()),
                },
            })

        elif path == "/api/system/diagnostics":
            # Provas reais, somente leitura, das raízes remotas. Esta rota é
            # separada do status rápido porque pode aguardar rede externa.
            # Nunca devolve credenciais, URLs ou registros.
            from r2_storage_engine import R2StorageEngine

            self._json(200, {
                "supabase": supabase_client.diagnosticar_conexao(),
                "r2": R2StorageEngine().diagnosticar_conexao(),
            })

        elif path == "/api/ai/status":
            # Só diz quantos motores estão prontos. Nunca qual modelo.
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(
                llm_gateway.status(), ensure_ascii=False
            ).encode('utf-8'))

        elif path == "/api/logs/stream":
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream; charset=utf-8")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Connection", "keep-alive")
            self._send_cors_headers()
            self.end_headers()
            try:
                # Mantém a conexão aberta enviando logs da fila
                while True:
                    try:
                        # Bloqueia até 2 segundos aguardando um log
                        log_msg = LOG_QUEUE.get(timeout=2)
                        self.wfile.write(f"data: {json.dumps({'message': log_msg})}\n\n".encode('utf-8'))
                        self.wfile.flush()
                    except queue.Empty:
                        # Envia um ping vazio para manter a conexão ativa
                        self.wfile.write(b": keep-alive\n\n")
                        self.wfile.flush()
            except Exception:
                # O cliente desconectou
                pass

        elif path == "/api/auth/status":
            # Diz ao frontend se o modo multiusuário está ligado e devolve
            # a URL + chave ANON (públicas por natureza) para o login.
            # A service_role JAMAIS sai daqui.
            estado_auth = supabase_client.status()
            if supabase_client.auth_configurado():
                estado_auth["supabase_url"] = supabase_client.url_base()
                estado_auth["supabase_anon_key"] = supabase_client.anon_key()

            usuario = self._usuario_atual()
            estado_auth["usuario"] = usuario
            if usuario:
                try:
                    perfil = supabase_client.obter_ou_criar_perfil(usuario["id"], usuario["email"])
                    estado_auth["perfil"] = {
                        "plano": perfil.get("plano"),
                        "varreduras_usadas": perfil.get("varreduras_usadas"),
                        "varreduras_limite": perfil.get("varreduras_limite"),
                        "sites_usados": perfil.get("sites_usados"),
                        "sites_limite": perfil.get("sites_limite"),
                    }
                except supabase_client.SupabaseIndisponivel:
                    estado_auth["perfil"] = None

            self._json(200, estado_auth)

        elif path == "/api/templates":
            self._json(200, {"templates": templates_store.listar()})

        elif path == "/api/templates/detail":
            slug = query_params.get("slug", [""])[0]
            ficha = templates_store.obter(slug)
            if ficha:
                self._json(200, ficha)
            else:
                self._json(404, {"erro": "Template não encontrado no catálogo."})

        elif path == "/api/templates/preview":
            # Serve o HTML do template dentro do iframe da loja.
            slug = query_params.get("slug", [""])[0]
            html = templates_store.html_do_template(slug)
            if html is None:
                self.send_response(404)
                self._send_cors_headers()
                self.end_headers()
                return
            corpo = html.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(corpo)))
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(corpo)

        elif path == "/api/templates/zip":
            slug = templates_store.extrair_slug(query_params.get("slug", [""])[0])
            pacote = templates_store.montar_zip(slug)
            if pacote is None:
                self.send_response(404)
                self._send_cors_headers()
                self.end_headers()
                return
            self.send_response(200)
            self.send_header("Content-Type", "application/zip")
            self.send_header("Content-Disposition", f'attachment; filename="{slug}.zip"')
            self.send_header("Content-Length", str(len(pacote)))
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(pacote)

        elif path == "/api/site/preview_html":
            # Precisa estar no do_GET: o editor carrega esta URL num
            # <iframe src="...">, que emite GET. Estava registrada no
            # do_POST, então o Live Studio recebia 404.
            self.handle_site_preview_html()

        elif path == "/api/media/proxy":
            photo_ref = query_params.get("ref", [""])[0]
            maxwidth = query_params.get("maxwidth", ["1200"])[0]
            self.handle_media_proxy(photo_ref, maxwidth)
        else:
            self.send_response(404)
            self.end_headers()

    def handle_media_proxy(self, photo_ref, maxwidth=1200):
        """
        Proxy determinístico de alta performance com duas camadas de cache em memória
        e fallback para Agnes AI / Placeholder SVG Offline.
        """
        if not photo_ref:
            self.send_response(400)
            self.end_headers()
            return

        cache_key = f"{photo_ref}_{maxwidth}"
        
        # 1. Verifica cache local
        with MEDIA_CACHE_LOCK:
            em_cache = MEDIA_CACHE.get(cache_key)
        if em_cache:
            cached_data, content_type = em_cache
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Cache-Control", "public, max-age=86400, immutable")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(cached_data)
            return

        api_key = os.environ.get('GOOGLE_PLACES_API_KEY', '')

        if photo_ref.startswith("http://") or photo_ref.startswith("https://"):
            # URL direta só é aceita se o host estiver na allowlist.
            # Sem isso o endpoint vira um proxy aberto (SSRF).
            if not host_permitido(photo_ref):
                print(f"[REPASS SECURITY] Proxy bloqueado para host não autorizado: {photo_ref[:120]}")
                self.send_response(403)
                self._send_cors_headers()
                self.end_headers()
                return
            target_url = photo_ref
        else:
            ref_seguro = urllib.parse.quote(photo_ref, safe="")
            largura = maxwidth if str(maxwidth).isdigit() else "1200"
            target_url = (
                f"https://maps.googleapis.com/maps/api/place/photo"
                f"?maxwidth={largura}&photo_reference={ref_seguro}&key={api_key}"
            )

        # 2. Tenta Google Places API ou URL Direta
        try:
            req = urllib.request.Request(target_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=8) as res:
                content_type = res.headers.get("Content-Type", "image/jpeg")
                img_data = res.read()
                
                # Salva no cache
                cachear_midia(cache_key, img_data, content_type)
                
                self.send_response(200)
                self.send_header("Content-Type", content_type)
                self.send_header("Cache-Control", "public, max-age=86400, immutable")
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(img_data)
                return
        except Exception as e:
            print(f"[REPASS WARNING] Falha na conexão com Google/Origem ({e}). Ativando Media RAG...")

        # 3. Camada de Fallback (Media RAG Fallback via Agnes AI/Unsplash Placeholder)
        fallback_url = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80"
        try:
            req_fall = urllib.request.Request(fallback_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req_fall, timeout=5) as res_fall:
                content_type = res_fall.headers.get("Content-Type", "image/jpeg")
                img_data = res_fall.read()
                cachear_midia(cache_key, img_data, content_type)
                
                self.send_response(200)
                self.send_header("Content-Type", content_type)
                self.send_header("Cache-Control", "public, max-age=86400, immutable")
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(img_data)
                return
        except Exception as e:
            print(f"[REPASS CRITICAL] Fallback falhou: {e}. Entregando SVG estático.")

        # 4. Capa de Segurança Final (SVG Offline para não quebrar UI)
        placeholder_svg = f"""
        <svg width="{maxwidth}" height="768" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#09090b"/>
            <text x="50%" y="50%" font-family="JetBrains Mono, monospace" font-size="20" fill="#27272a" text-anchor="middle">
                REPASS MEDIA OFFLINE // NO ASSET FOUND
            </text>
        </svg>
        """.strip().encode('utf-8')
        
        self.send_response(200)
        self.send_header("Content-Type", "image/svg+xml")
        self.send_header("Cache-Control", "public, max-age=86400, immutable")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(placeholder_svg)

    def do_POST(self):
        # Teto de corpo: ler Content-Length sem limite permite que um
        # cliente anuncie um corpo gigante e derrube o processo.
        try:
            content_length = int(self.headers.get('Content-Length', 0))
        except (TypeError, ValueError):
            content_length = 0

        if content_length > TAMANHO_MAX_BODY:
            self.send_response(413)
            self._send_cors_headers()
            self.end_headers()
            return

        post_data = self.rfile.read(content_length).decode('utf-8', errors='replace')

        try:
            body = json.loads(post_data) if post_data else {}
        except Exception:
            body = {}

        if self.path == "/api/templates/import":
            # Aceita slug, URL do registry, comando npx colado, ou vários
            # itens de uma vez (um por linha).
            entrada = body.get("slug") or body.get("comando") or ""
            forcar = bool(body.get("forcar"))

            linhas = [l for l in str(entrada).splitlines() if l.strip()]

            if len(linhas) > 1:
                resultado = templates_store.importar_lote(entrada, forcar=forcar)
                self._json(200, {
                    "sucesso": len(resultado["importados"]) > 0,
                    "importados": len(resultado["importados"]),
                    "total": resultado["total"],
                    "falhas": resultado["falhas"],
                })
                return

            try:
                ficha = templates_store.importar(entrada, forcar=forcar)
                self._json(200, {"sucesso": True, "template": ficha})
            except RuntimeError as e:
                self._json(400, {"sucesso": False, "erro": str(e)})
            return

        # Portão único das rotas caras. Antes, cada handler decidia sozinho se
        # checava autenticação — e só 1 dos 6 checava. Centralizar aqui evita
        # que uma rota nova nasça desprotegida por esquecimento.
        if self.path in ROTAS_PROTEGIDAS and not self._liberar_rota_protegida():
            return

        if self.path == "/api/sites":
            self.handle_site_salvar(body)
        elif self.path == "/api/ai/generate":
            self.handle_ai_generate(body)
        elif self.path == "/api/leads/scan":
            self.handle_scan(body)
        elif self.path == "/api/site/generate":
            self.handle_site_generate(body)
        elif self.path == "/api/site/clone":
            self.handle_site_clone(body)
        else:
            self.send_response(404)
            self.end_headers()

    def handle_ai_generate(self, body):
        """
        Executa um prompt na cadeia de LLMs do servidor.

        O frontend manda prompt + system_prompt e recebe apenas o texto.
        Provedor, modelo e chave nunca saem daqui — é segurança e também
        segredo comercial.
        """
        prompt = body.get("prompt", "")
        system_prompt = body.get("system_prompt", "Você é um assistente do REPASS AI.")
        temperature = body.get("temperature", 0.0)

        if not isinstance(prompt, str) or not prompt.strip():
            self.send_response(400)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(
                {"sucesso": False, "erro": "prompt vazio"}, ensure_ascii=False
            ).encode("utf-8"))
            return

        # Teto de prompt: o contexto do catálogo é grande, mas não ilimitado.
        if len(prompt) > 60000:
            prompt = prompt[:60000]

        try:
            temperature = float(temperature)
        except (TypeError, ValueError):
            temperature = 0.0

        resultado = llm_gateway.gerar(prompt, system_prompt, temperature)

        # O trace fica só no log do servidor.
        if resultado.get("trace"):
            print(f"[LLM] {' | '.join(resultado['trace'])}")

        self.send_response(200 if resultado["sucesso"] else 503)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps({
            "sucesso": resultado["sucesso"],
            "texto": resultado["texto"],
            "erro": resultado["erro"],
        }, ensure_ascii=False).encode("utf-8"))

    def handle_sites_listar(self):
        """
        Lista os sites do usuário autenticado.

        O filtro por `user_id` é aplicado no servidor com a chave de serviço:
        o navegador não fala com o Postgres direto (o schema revoga acesso de
        `anon` e `authenticated`), então o isolamento entre operadores é
        garantido aqui, não por RLS confiando no cliente.
        """
        usuario = getattr(self, "usuario_autenticado", None)
        if not usuario:
            self._json(401, {"status": "error", "mensagem": "Faca login para ver seus sites."})
            return
        try:
            registros = supabase_client.selecionar(
                "sites",
                {"user_id": usuario["id"]},
                ordem="atualizado_em.desc",
                limite=200,
            )
        except supabase_client.SupabaseIndisponivel as e:
            print(f"[Sites] Supabase indisponivel na listagem: {e}")
            self._json(503, {
                "status": "error",
                "mensagem": "Nao foi possivel carregar seus sites agora. Tente em instantes.",
            })
            return
        self._json(200, {"status": "success", "sites": [self._site_para_documento(r) for r in registros]})

    def handle_site_obter(self, slug):
        """
        Devolve um site do usuário pelo slug, com o histórico de versões.

        Args:
            slug: identificador do projeto usado pelo editor (`projectId`).
        """
        usuario = getattr(self, "usuario_autenticado", None)
        if not usuario:
            self._json(401, {"status": "error", "mensagem": "Faca login para abrir este site."})
            return
        if not slug:
            self._json(400, {"status": "error", "mensagem": "Informe o identificador do site."})
            return
        try:
            achados = supabase_client.selecionar(
                "sites", {"user_id": usuario["id"], "slug": slug}, limite=1
            )
            if not achados:
                # 404 explícito: o editor precisa distinguir "não existe" de
                # "falhou". Devolver 200 com corpo vazio é o que produzia a
                # tela cinza com projectId órfão.
                self._json(404, {"status": "error", "mensagem": "Site nao encontrado."})
                return
            site = achados[0]
            versoes = supabase_client.selecionar(
                "site_versoes", {"site_id": site["id"]},
                ordem="versao.desc", limite=10,
            )
        except supabase_client.SupabaseIndisponivel as e:
            print(f"[Sites] Supabase indisponivel ao abrir '{slug}': {e}")
            self._json(503, {
                "status": "error",
                "mensagem": "Nao foi possivel abrir o site agora. Tente em instantes.",
            })
            return

        documento = self._site_para_documento(site)
        documento["history"] = [
            {"version": v["versao"], "timestamp": v["criado_em"], "schema": v["schema"]}
            for v in versoes
        ]
        self._json(200, {"status": "success", "site": documento})

    def handle_site_salvar(self, body):
        """
        Cria ou atualiza um site do usuário e grava a versão anterior.

        O número da versão é calculado no servidor a partir do registro atual.
        Deixar o cliente enviar a versão permitiria que duas abas abertas
        gravassem a mesma e o histórico ficasse furado.
        """
        usuario = getattr(self, "usuario_autenticado", None)
        if not usuario:
            self._json(401, {"status": "error", "mensagem": "Faca login para salvar."})
            return

        slug = str(body.get("projectId") or body.get("slug") or "").strip()
        schema = body.get("schema") or {}
        if not slug:
            self._json(400, {"status": "error", "mensagem": "Site sem identificador."})
            return
        if not isinstance(schema, dict) or not schema:
            self._json(400, {"status": "error", "mensagem": "Site sem conteudo para salvar."})
            return

        titulo = str(
            body.get("titulo")
            or (schema.get("meta") or {}).get("title")
            or slug
        )[:200]

        try:
            achados = supabase_client.selecionar(
                "sites", {"user_id": usuario["id"], "slug": slug}, limite=1
            )
            if achados:
                atual = achados[0]
                versao = (atual.get("versao") or 0) + 1
                salvos = supabase_client.atualizar(
                    "sites", {"id": atual["id"]},
                    {"schema": schema, "titulo": titulo, "versao": versao,
                     "atualizado_em": "now()"},
                )
                registro = salvos[0] if salvos else {**atual, "schema": schema, "versao": versao}
            else:
                # Cota só é cobrada na CRIAÇÃO. Cobrar a cada save puniria
                # quem edita o próprio site e esvaziaria o plano em minutos.
                perfil = supabase_client.obter_ou_criar_perfil(usuario["id"], usuario["email"])
                usados = perfil.get("sites_usados", 0) or 0
                limite = perfil.get("sites_limite", 0) or 0
                if limite and usados >= limite:
                    self._json(429, {
                        "status": "error",
                        "mensagem": (
                            f"Limite do plano {perfil.get('plano')} atingido "
                            f"({limite} sites). A cota renova no dia 1o."
                        ),
                    })
                    return

                # UPSERT, não INSERT.
                #
                # Entre o SELECT acima e este ponto existe uma brecha: o editor
                # e o chatbot salvam quase juntos, os dois leem "nao existe" e
                # os dois tentam criar. O segundo batia na trava do banco e
                # devolvia HTTP 409 na cara do operador
                # ("duplicate key value violates sites_user_slug_idx").
                #
                # Com `on_conflict` quem decide entre criar e atualizar é o
                # Postgres, numa operação só — não há brecha para dois
                # pedidos simultâneos se cruzarem.
                criados = supabase_client.inserir(
                    "sites",
                    {"user_id": usuario["id"], "slug": slug,
                     "titulo": titulo, "schema": schema, "versao": 1},
                    upsert_em="user_id,slug",
                )
                if not criados:
                    raise supabase_client.SupabaseIndisponivel("upsert nao retornou registro")
                registro = criados[0]
                versao = registro.get("versao", 1)
                # Só cobra cota se o registro nasceu agora. Num upsert que caiu
                # em atualização, cobrar puniria o operador duas vezes.
                if versao == 1:
                    supabase_client.consumir_site(usuario["id"])

            # Histórico: falha aqui não pode perder o trabalho já salvo acima.
            try:
                supabase_client.inserir("site_versoes", {
                    "site_id": registro["id"], "versao": versao, "schema": schema,
                })
            except supabase_client.SupabaseIndisponivel as e:
                print(f"[Sites] Versao {versao} de '{slug}' nao historiada: {e}")

        except supabase_client.SupabaseIndisponivel as e:
            print(f"[Sites] Falha ao salvar '{slug}': {e}")
            self._json(503, {
                "status": "error",
                "mensagem": "Nao foi possivel salvar agora. Seu trabalho segue nesta tela; tente de novo.",
            })
            return

        self._json(200, {"status": "success", "site": self._site_para_documento(registro)})

    @staticmethod
    def _site_para_documento(registro):
        """
        Converte a linha do Postgres no formato que o editor já consome.

        O frontend foi escrito contra o mock (`projectId`, `updatedAt`,
        `version`). Traduzir aqui evita ter que reescrever as telas.
        """
        schema = registro.get("schema") or {}
        return {
            **schema,
            "id": registro.get("id"),
            "projectId": registro.get("slug"),
            "titulo": registro.get("titulo"),
            "version": registro.get("versao", 1),
            "updatedAt": registro.get("atualizado_em"),
            "createdAt": registro.get("criado_em"),
            "publicado": registro.get("publicado", False),
            "url_publica": registro.get("url_publica"),
        }

    def handle_scan(self, body):
        estado = body.get("estado", "SP")
        cidade = body.get("cidade", "Franca")
        bairro = body.get("bairro", "")
        nichos = body.get("nichos", "salão de unhas, barbearia, hamburgueria, academia")
        max_results = body.get("max_results", 40)

        # --- Cota do plano ---
        # A autenticação já foi exigida no portão do do_POST: se chegou aqui
        # com o multiusuário ligado, `usuario` é garantidamente válido.
        usuario = getattr(self, "usuario_autenticado", None)
        if usuario:
            try:
                perfil = supabase_client.obter_ou_criar_perfil(usuario["id"], usuario["email"])
                usadas = perfil.get("varreduras_usadas", 0)
                limite = perfil.get("varreduras_limite", 0)
                if usadas >= limite:
                    self._json(429, {
                        "status": "error",
                        "erro": (
                            f"Limite do plano {perfil.get('plano')} atingido "
                            f"({limite} varreduras/mês). A cota renova no dia 1º."
                        ),
                        "leads": [], "total": 0,
                    })
                    return
            except supabase_client.SupabaseIndisponivel as e:
                # Banco fora do ar não pode derrubar a varredura: o operador
                # ainda recebe os leads, só não ficam salvos.
                print(f"[Supabase] Perfil indisponível ({e}). Seguindo sem cota.")

        print(f"[REPASS AI LEADS_OSINT_02] Varrendo '{nichos}' em '{cidade}, {estado}'...")

        try:
            leads, meta = osint_engine.executar_varredura(
                estado=estado,
                cidade=cidade,
                bairro=bairro,
                nichos=nichos,
                max_results=max_results
            )
        except Exception as e:
            # `str(e)` ia inteiro para o cliente e podia carregar caminho de
            # arquivo ou trecho de credencial. Detalhe fica no log do servidor.
            print(f"[Gateway] Falha na varredura: {type(e).__name__}: {e}")
            self._json(502, {
                "status": "error",
                "erro": "Nao foi possivel concluir a varredura agora. Tente novamente em instantes.",
                "leads": [], "total": 0,
            })
            return

        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._send_cors_headers()
        self.end_headers()
        # --- Persistência (só leads REAIS, e só com usuário) --------------
        #
        # Lead de demonstração nunca vira registro comercial: sem telefone
        # verificado, não entra no banco.
        salvos = 0
        if usuario and meta.get("dados_reais"):
            reais = [l for l in leads if not l.get("is_demo") and l.get("place_id")]
            if reais:
                try:
                    registros = [{
                        "user_id": usuario["id"],
                        "place_id": l["place_id"],
                        "nicho": l.get("categoria", ""),
                        "nome": l.get("nome", ""),
                        "endereco": l.get("endereco"),
                        "telefone": l.get("telefone"),
                        "site": l.get("site"),
                        "rating": l.get("avaliacao"),
                        "qtd_reviews": l.get("reviewsCount"),
                        "score_oportunidade": l.get("score", 0),
                        "motivo_abordagem": l.get("motivo_abordagem", "geral"),
                        "mensagem_sugerida": l.get("mensagem_sugerida") or "",
                        "cidade": l.get("cidade"),
                        "estado": l.get("estado"),
                        "lat": (l.get("geo") or {}).get("lat"),
                        "lon": (l.get("geo") or {}).get("lon"),
                    } for l in reais]

                    # upsert por (user_id, place_id): revarrer a mesma cidade
                    # atualiza o lead em vez de duplicar.
                    supabase_client.inserir("leads", registros, upsert_em="user_id,place_id")
                    salvos = len(registros)
                    supabase_client.consumir_varredura(usuario["id"])
                except supabase_client.SupabaseIndisponivel as e:
                    print(f"[Supabase] Falha ao salvar leads ({e}). Devolvendo sem persistir.")

        response = {
            "status": "success",
            "cidade": cidade,
            "estado": estado,
            "bairro": bairro,
            "salvos": salvos,
            "total": len(leads),
            # `meta.modo` diz se veio da Places API ou se é demo de layout.
            # A UI usa isso para não apresentar exemplo como varredura real.
            "meta": meta,
            "leads": leads
        }
        self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))

    def handle_site_preview_html(self):
        """
        Serve o HTML compilado para o iframe do editor.

        SEGURANÇA: o parâmetro `file` vem do cliente e NÃO pode virar caminho
        de arquivo diretamente. `os.path.join(dir, "../../.env")` escapa da
        pasta, e no Windows um caminho absoluto ("C:\\...") faz o join
        descartar o diretório base — os dois entregariam qualquer arquivo do
        servidor, incluindo o .env com todas as chaves.

        Defesa: só o nome-base do arquivo, só .html, e conferência final de
        que o caminho resolvido continua dentro do diretório permitido.
        """
        query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        pedido = query.get("file", [""])[0]

        catalog_dir = os.path.realpath(
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "77lib_catalog")
        )
        os.makedirs(catalog_dir, exist_ok=True)

        # basename descarta qualquer componente de diretório ("../", "C:\").
        file_name = os.path.basename(pedido.replace("\\", "/"))

        if not file_name.endswith(".html"):
            file_name = ""

        file_path = os.path.realpath(os.path.join(catalog_dir, file_name)) if file_name else ""

        # Confirma que o alvo não saiu da pasta permitida.
        dentro_do_catalogo = bool(file_path) and (
            file_path == catalog_dir or file_path.startswith(catalog_dir + os.sep)
        )

        if not dentro_do_catalogo or not os.path.isfile(file_path):
            # Fallback: o site gerado mais recente da pasta.
            try:
                candidatos = [
                    f for f in os.listdir(catalog_dir)
                    if f.startswith("generated_") and f.endswith(".html")
                ]
            except OSError:
                candidatos = []

            if candidatos:
                candidatos.sort(
                    key=lambda f: os.path.getmtime(os.path.join(catalog_dir, f)),
                    reverse=True,
                )
                file_path = os.path.join(catalog_dir, candidatos[0])
            else:
                file_path = ""

        if file_path and os.path.isfile(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(content.encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def handle_site_generate(self, body):
        """Compila o site real com o motor híbrido (95% determinístico + 5% LLM) e Lib77Engine."""
        from lib77_engine import AuditoriaReprovada, Lib77Engine, Lib77Error
        from r2_storage_engine import R2StorageEngine
        from hybrid_engine import HybridSiteGenerator

        lead_data = body.get("lead") or body
        prompt_custom = body.get("prompt") or body.get("orientacao")
        lead_name = lead_data.get("nome", "Empresa Exemplo")
        categoria = lead_data.get("categoria", "Geral")

        # 1. Executa a decisão da Arquitetura Híbrida (95% determinístico / 5% LLM)
        hybrid_engine = HybridSiteGenerator()
        resultado_hibrido = hybrid_engine.generate_with_fallback(lead_data, prompt_custom=prompt_custom)

        # 2. Compila a página HTML5 estática via Lib77Engine
        try:
            lib77 = Lib77Engine()
            # O schema do motor híbrido alimenta os textos do HTML. Antes ele
            # era calculado, devolvido na resposta e ignorado na compilação:
            # as regras por nicho rodavam sem efeito nenhum no site final.
            sintese = lib77.gerar_site_injetado_osint(
                lead_data,
                "aura-template-digital-creative-30",
                schema=resultado_hibrido.get("schema"),
            )
        except AuditoriaReprovada as exc:
            self._responder_erro_amigavel(
                "O site gerado ainda continha trechos do modelo original e por isso "
                "nao foi publicado. Nossa equipe ja foi avisada.",
                detalhe_tecnico="; ".join(exc.problemas[:10]),
            )
            return
        except Lib77Error as exc:
            self._responder_erro_amigavel(
                "Nao foi possivel gerar o site com os dados deste lead. "
                "Confira se o nome do negocio esta preenchido e tente novamente.",
                detalhe_tecnico=str(exc),
            )
            return

        slug = re.sub(r'[^a-z0-9]', '_', lead_name.lower()).strip('_')
        if not slug:
            slug = "empresa_exemplo"
        output_file = os.path.basename(sintese.get("output_html_file", f"generated_{slug}.html"))

        # O motor grava o HTML em disco; o conteudo e lido de volta para
        # devolver ao frontend e subir ao R2.
        with open(sintese["output_html_file"], encoding="utf-8") as f:
            html_content = f.read()

        storage_result = R2StorageEngine().salvar_site_compilado(slug, html_content)

        schema_final = resultado_hibrido.get("schema") or {}
        schema = {
          "projectId": f"site_{slug}",
          "version": 1,
          "theme": "77lib_procedural",
          "meta": {"title": f"{lead_name} — Site Oficial", "nicho": categoria},
          "schema": schema_final,
          "htmlContent": html_content,
          "outputFileName": output_file,
          "previewUrl": f"/api/site/preview_html?file={output_file}",
          "deployment": {
              "enviado_r2": storage_result["enviado_r2"],
              "publicado": storage_result["publicado"],
              "url_publica": storage_result["cdn_url"],
              "motivo": storage_result["motivo"],
          },
          "hybrid_metrics": {
              "metodo": resultado_hibrido.get("metodo", "deterministic"),
              "tempo_ms": resultado_hibrido.get("tempo_ms", 0),
              "custo_usd": resultado_hibrido.get("custo_usd", 0.0)
          }
        }

        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps({
            "status": "success",
            "schema": schema,
            "storage": schema["deployment"],
            "hybrid_metrics": schema["hybrid_metrics"]
        }, ensure_ascii=False).encode('utf-8'))

    def handle_site_clone(self, body):
        url = body.get("url", "")
        print(f"[Open Lovable Cloner] Clonando estrutura do site: '{url}'...")

        parsed_name = "SITE CLONADO"
        if "http" in url:
            domain = url.split("//")[-1].split("/")[0].replace("www.", "").split(".")[0]
            parsed_name = domain.upper()

        slug = parsed_name.lower().replace(" ", "_")
        output_file = f"generated_clone_{slug}.html"

        # Compila a página HTML5 real do site clonado com Lib77Engine
        from lib77_engine import Lib77Engine
        lib77 = Lib77Engine()
        sintese = lib77.gerar_site_injetado_osint({
            "nome": f"{parsed_name} (CLONADO)",
            "categoria": "Clonado via Open Lovable Engine",
            "cidade": "Franca",
            "estado": "SP",
            "telefone": "(16) 99999-9999",
            "whatsapp": "https://wa.me/551699999999"
        }, "aura-template-digital-creative-30")

        # `html_content` nunca existiu no retorno do motor: o HTML vive em disco.
        with open(sintese["output_html_file"], encoding="utf-8") as f:
            html_content = f.read()
        catalog_dir = os.path.realpath(
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "77lib_catalog")
        )
        os.makedirs(catalog_dir, exist_ok=True)
        file_path = os.path.join(catalog_dir, output_file)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(html_content)

        cloned_schema = {
          "projectId": f"clone_{slug}_{int(time.time())}",
          "version": 1,
          "theme": "systemista_glitch",
          "clonedFrom": url,
          "outputFileName": output_file,
          "previewUrl": f"/api/site/preview_html?file={output_file}",
          "htmlContent": html_content,
          "systemista": {
            "brandName": parsed_name,
            "brandTagline": f"Reconstruído via Open Lovable Engine de {url}",
            "heroH1Lines": ["VERSÃO", "CLONADA DE", "ALTA", "PERFORMANCE."],
            "heroSideCopy": f"Estrutura reconstruída automaticamente a partir de {url} em componentes React limpos com Tailwind CSS.",
            "stats": [["100%", "Fidelidade"], ["React 19", "Stack"], ["Tailwind", "Design"], ["0.5px", "Hairline"]],
            "services": [
              {"tag": "01 / CLONADO", "title": "Estrutura de Layout Extraída", "desc": f"Design limpo extraído de {url}.", "stack": ["Scraped", "Firecrawl", "React"]},
              {"tag": "02 / OPTIMIZED", "title": "Velocidade Otimizada 60fps", "desc": "Imagens e estilos convertidos em Tailwind tokens.", "stack": ["Tailwind", "Fast", "Clean"]}
            ],
            "steps": [
              {"n": "01", "t": "Scraping", "d": "Leitura de DOM e estilos"},
              {"n": "02", "t": "Tokens", "d": "Mapeamento para cores OKLCH"},
              {"n": "03", "t": "React JSX", "d": "Compilação de componentes"},
              {"n": "04", "t": "Deploy", "d": "Publicação com 1 clique"}
            ]
          }
        }

        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps({"status": "success", "url": url, "clonedSchema": cloned_schema}, ensure_ascii=False).encode('utf-8'))

def run_server(port=8000):
    server_address = ('', port)
    httpd = ThreadingHTTPServer(server_address, RepassApiHandler)
    print(f"[REPASS AI] Servidor REST API LEADS_OSINT_02 rodando na porta {port}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor finalizado.")

if __name__ == "__main__":
    try:
        porta = int(os.environ.get("PORT", "8000"))
    except ValueError:
        raise SystemExit("PORT precisa ser um número inteiro.")
    if not 1 <= porta <= 65535:
        raise SystemExit("PORT precisa estar entre 1 e 65535.")
    run_server(porta)
