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

        if self.path == "/api/ai/generate":
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

    def handle_scan(self, body):
        estado = body.get("estado", "SP")
        cidade = body.get("cidade", "Franca")
        bairro = body.get("bairro", "")
        nichos = body.get("nichos", "salão de unhas, barbearia, hamburgueria, academia")
        max_results = body.get("max_results", 40)

        # --- Autenticação e cota (só quando o multiusuário está ligado) ---
        usuario = None
        if supabase_client.auth_configurado():
            usuario = self._usuario_atual()
            if not usuario:
                self._json(401, {
                    "status": "error",
                    "erro": "Não autenticado. Faça login para varrer leads.",
                    "leads": [], "total": 0,
                })
                return

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
            print(f"[Gateway] Falha na varredura: {e}")
            self.send_response(502)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(
                {"status": "error", "erro": str(e), "leads": [], "total": 0},
                ensure_ascii=False
            ).encode('utf-8'))
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
        """Compila o site real com o motor Lib77Engine e devolve o HTML5 procedural + URL para iframe."""
        from lib77_engine import Lib77Engine
        from r2_storage_engine import R2StorageEngine
        lead_data = body.get("lead") or body
        lead_name = lead_data.get("nome", "Empresa Exemplo")
        categoria = lead_data.get("categoria", "Geral")

        lib77 = Lib77Engine()
        sintese = lib77.gerar_site_injetado_osint(lead_data, "aura-template-digital-creative-30")
        
        output_file = os.path.basename(sintese.get("output_html_file", "generated_site.html"))
        html_content = sintese.get("html_content", "")
        slug = lead_name.lower().replace(" ", "_")
        storage_result = R2StorageEngine().salvar_site_compilado(slug, html_content)

        schema = {
          "projectId": f"site_{slug}",
          "version": 1,
          "theme": "77lib_procedural",
          "meta": {"title": f"{lead_name} — Site Oficial", "nicho": categoria},
          "htmlContent": html_content,
          "outputFileName": output_file,
          "previewUrl": f"/api/site/preview_html?file={output_file}",
          "deployment": {
              "enviado_r2": storage_result["enviado_r2"],
              "publicado": storage_result["publicado"],
              "url_publica": storage_result["cdn_url"],
              "motivo": storage_result["motivo"],
          },
        }

        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps({
            "status": "success",
            "schema": schema,
            "storage": schema["deployment"],
        }, ensure_ascii=False).encode('utf-8'))

    def handle_site_clone(self, body):
        url = body.get("url", "")
        print(f"[Open Lovable Cloner] Clonando estrutura do site: '{url}'...")

        parsed_name = "SITE CLONADO"
        if "http" in url:
            domain = url.split("//")[-1].split("/")[0].replace("www.", "").split(".")[0]
            parsed_name = domain.upper()

        cloned_schema = {
          "projectId": f"clone_{parsed_name.lower()}",
          "version": 1,
          "theme": "systemista_glitch",
          "clonedFrom": url,
          "systemista": {
            "brandName": parsed_name,
            "brandTagline": f"Reconstruído via Open Lovable Engine de {url}",
            "heroH1Lines": ["VERSÃO", "CLONADA DE", "ALTA", "PERFORMANCE."],
            "heroSideCopy": f"Estrutura reconstruída automaticamente a partir de {url} em componentes React limpos com Tailwind CSS.",
            "stats": [["100%", "Fidelidade"], ["React 19", "Stack"], ["Tailwind", "Design"], ["0.5px", "Hairline"]],
            "services": [
              {"tag": "01 / CLONADO", "title": "Estrutura de Layout Extraída", "desc": "Design limpo gerado a partir do código do site concorrente.", "stack": ["Scraped", "Firecrawl", "React"]},
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
    run_server()
