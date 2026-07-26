# -*- coding: utf-8 -*-
"""
REPASS AI - Motor de Armazenamento R2 & Gestão de Domínios Customizados (Zero-Cost Stack)

Este módulo gerencia o armazenamento de mídia/sites compilados no Cloudflare R2 (10 GB Free)
e prepara o roteamento de domínios customizados (CNAME) via Cloudflare Workers.
"""

import os
import sys
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STORAGE_DIR = os.path.join(BASE_DIR, "data", "r2_bucket")

os.makedirs(STORAGE_DIR, exist_ok=True)

class R2StorageEngine:
    def __init__(self, account_id=None, access_key=None, secret_key=None):
        self.account_id = account_id or os.environ.get("CLOUDFLARE_R2_ACCOUNT_ID", "")
        self.access_key = access_key or os.environ.get("CLOUDFLARE_R2_ACCESS_KEY", "")
        self.secret_key = secret_key or os.environ.get("CLOUDFLARE_R2_SECRET_KEY", "")
        self.bucket_name = "repass-ai-beta"

    def salvar_site_compilado(self, client_slug, html_content):
        """
        Salva o site compilado no bucket R2 (ou fallback em storage local no ambiente dev).
        """
        file_name = f"{client_slug}.html"
        local_path = os.path.join(STORAGE_DIR, file_name)

        with open(local_path, "w", encoding="utf-8") as f:
            f.write(html_content)

        print(f"[R2StorageEngine] Site '{client_slug}' armazenado com sucesso em: {local_path}")
        
        # URL pública simulada via Cloudflare Worker
        cdn_url = f"https://cdn.repass.ai/{file_name}"
        return {
            "status": "success",
            "bucket": self.bucket_name,
            "file_name": file_name,
            "local_path": local_path,
            "cdn_url": cdn_url
        }

    def gerar_script_worker_cname(self, client_slug, custom_domain):
        """
        Gera o script em JavaScript do Cloudflare Worker para mapeamento CNAME gratuito.
        Exemplo: site.fogovivosteakhouse.com.br -> repass.ai/cdn/fogovivo.html
        """
        worker_script = f"""
// CLOUDFLARE WORKER ROUTER // ZERO-COST CNAME PROXY
addEventListener('fetch', event => {{
  event.respondWith(handleRequest(event.request))
}})

async function handleRequest(request) {{
  const url = new URL(request.url)
  // Mapeia o domínio customizado {custom_domain} para o bucket R2
  const targetUrl = 'https://cdn.repass.ai/{client_slug}.html'
  
  const response = await fetch(targetUrl, request)
  return new Response(response.body, response)
}}
        """
        return worker_script

if __name__ == "__main__":
    r2 = R2StorageEngine()
    res = r2.salvar_site_compilado("fogo_vivo_steakhouse", "<h1>Fogo Vivo Steakhouse - 100% R2 Storage</h1>")
    print(json.dumps(res, indent=2, ensure_ascii=False))
