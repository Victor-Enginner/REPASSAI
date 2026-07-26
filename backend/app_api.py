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

# Carrega as variáveis do .env para o os.environ
load_dotenv()

from scraper_monster import OSINTCore
import llm_gateway

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
ORIGENS_PERMITIDAS = [
    o.strip() for o in os.environ.get(
        # Porta 3000 é a do vite.config.js deste projeto; 4173 é o preview.
        "CORS_ORIGINS", "http://localhost:3000,http://localhost:4173"
    ).split(",") if o.strip()
]

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

        if self.path.startswith("/api/site/preview_html"):
            self.handle_site_preview_html()
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

    def handle_scan(self, body):
        estado = body.get("estado", "SP")
        cidade = body.get("cidade", "Franca")
        bairro = body.get("bairro", "")
        nichos = body.get("nichos", "salão de unhas, barbearia, hamburgueria, academia")
        max_results = body.get("max_results", 40)

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
        response = {
            "status": "success",
            "cidade": cidade,
            "estado": estado,
            "bairro": bairro,
            "total": len(leads),
            # `meta.modo` diz se veio da Places API ou se é demo de layout.
            # A UI usa isso para não apresentar exemplo como varredura real.
            "meta": meta,
            "leads": leads
        }
        self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))

    def handle_site_preview_html(self):
        """Retorna o HTML compilado da 77lib diretamente para ser exibido dentro do iframe no editor."""
        query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        file_name = query.get("file", ["generated_fogo_vivo_steakhouse.html"])[0]

        catalog_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "77lib_catalog")
        file_path = os.path.join(catalog_dir, file_name)

        if not os.path.exists(file_path):
            # Procura qualquer arquivo gerado recente
            files = [f for f in os.listdir(catalog_dir) if f.startswith("generated_") and f.endswith(".html")]
            if files:
                file_path = os.path.join(catalog_dir, files[0])

        if os.path.exists(file_path):
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
        lead_data = body.get("lead") or body
        lead_name = lead_data.get("nome", "Empresa Exemplo")
        categoria = lead_data.get("categoria", "Geral")

        lib77 = Lib77Engine()
        sintese = lib77.gerar_site_injetado_osint(lead_data, "aura-template-digital-creative-30")
        
        output_file = os.path.basename(sintese.get("output_html_file", "generated_site.html"))
        html_content = sintese.get("html_content", "")

        schema = {
          "projectId": f"site_{lead_name.lower().replace(' ', '_')}",
          "version": 1,
          "theme": "77lib_procedural",
          "meta": {"title": f"{lead_name} — Site Oficial", "nicho": categoria},
          "htmlContent": html_content,
          "outputFileName": output_file,
          "previewUrl": f"/api/site/preview_html?file={output_file}"
        }

        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps({"status": "success", "schema": schema}, ensure_ascii=False).encode('utf-8'))

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
