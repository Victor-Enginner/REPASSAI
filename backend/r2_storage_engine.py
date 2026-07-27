# -*- coding: utf-8 -*-
"""
REPASS AI - Motor de Armazenamento R2 & Gestão de Domínios Customizados (Zero-Cost Stack)

Este módulo gerencia o armazenamento de mídia/sites compilados no Cloudflare R2 (10 GB Free)
e prepara o roteamento de domínios customizados (CNAME) via Cloudflare Workers.
"""

import os
import sys
import json
import re
import time
import urllib.parse
import urllib.request

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STORAGE_DIR = os.path.join(BASE_DIR, "data", "r2_bucket")

os.makedirs(STORAGE_DIR, exist_ok=True)

class R2StorageEngine:
    def __init__(self, account_id=None, access_key=None, secret_key=None):
        # Aceita os nomes documentados e os nomes legados já presentes no
        # ambiente do projeto. Assim nenhuma credencial precisa ser copiada
        # ou exposta só para migrar a configuração.
        self.account_id = account_id or self._env(
            "CLOUDFLARE_R2_ACCOUNT_ID", "R2_ACCOUNT_ID"
        )
        self.access_key = access_key or self._env(
            "CLOUDFLARE_R2_ACCESS_KEY", "R2_ACCESS_KEY_ID"
        )
        self.secret_key = secret_key or self._env(
            "CLOUDFLARE_R2_SECRET_KEY", "R2_SECRET_ACCESS_KEY"
        )
        self.bucket_name = self._env("CLOUDFLARE_R2_BUCKET", "R2_BUCKET_NAME") or "repass-ai-beta"
        self.public_base_url = self._env(
            "CLOUDFLARE_R2_PUBLIC_BASE_URL", "R2_PUBLIC_BASE_URL"
        ).rstrip("/")

    @staticmethod
    def _env(*nomes):
        for nome in nomes:
            valor = os.environ.get(nome, "").strip()
            if valor:
                return valor
        return ""

    def configurado(self):
        """True se há credenciais R2 completas para upload real."""
        return bool(
            self.account_id
            and self.access_key
            and self.secret_key
            and self.bucket_name
        )

    def status(self):
        """Estado público do storage, sem revelar credenciais."""
        try:
            import boto3  # noqa: F401
            cliente_disponivel = True
        except ImportError:
            cliente_disponivel = False
        return {
            "local_operacional": os.path.isdir(STORAGE_DIR),
            "r2_configurado": self.configurado(),
            "cliente_s3_disponivel": cliente_disponivel,
            "publicacao_configurada": bool(self.public_base_url),
        }

    def _cliente_s3(self):
        """Cria o cliente S3-compatible sem expor nenhum dado de acesso."""
        try:
            import boto3
        except ImportError as exc:
            raise RuntimeError(
                "Cliente S3 indisponível. Instale as dependências do backend."
            ) from exc

        endpoint = f"https://{self.account_id}.r2.cloudflarestorage.com"
        return boto3.client(
            "s3",
            endpoint_url=endpoint,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name="auto",
        )

    def diagnosticar_conexao(self):
        """
        Prova acesso ao bucket e, quando possível, à publicação pública.

        A operação lista no máximo cinco chaves e baixa no máximo um HTML.
        Nenhum nome de bucket, objeto, domínio ou segredo sai na resposta.
        """
        inicio = time.perf_counter()
        if not self.configurado():
            return {
                "r2_conectado": False,
                "publicacao_conectada": False,
                "latencia_ms": None,
                "erro": "nao_configurado",
            }
        try:
            candidatos = [
                nome
                for nome in os.listdir(STORAGE_DIR)
                if nome.lower().endswith(".html")
            ]
            preferido = "fogo-vivo-steakhouse.html"
            html = (
                preferido
                if preferido in candidatos
                else candidatos[0]
                if candidatos
                else None
            )
            if html:
                self._cliente_s3().head_object(
                    Bucket=self.bucket_name,
                    Key=html,
                )
            publicacao = None
            if self.public_base_url and html:
                url = f"{self.public_base_url}/{urllib.parse.quote(html)}"
                req = urllib.request.Request(
                    url,
                    headers={"User-Agent": "REPASS-AI-Diagnostic/1.0"},
                )
                with urllib.request.urlopen(req, timeout=10) as remoto:
                    amostra = remoto.read(512).lower()
                    publicacao = remoto.status == 200 and b"<html" in amostra
            return {
                "r2_conectado": True,
                "publicacao_conectada": publicacao,
                "objetos_detectados": 1 if html else 0,
                "latencia_ms": round((time.perf_counter() - inicio) * 1000),
                "erro": None,
            }
        except Exception as exc:
            return {
                "r2_conectado": False,
                "publicacao_conectada": False,
                "objetos_detectados": 0,
                "latencia_ms": round((time.perf_counter() - inicio) * 1000),
                "erro": type(exc).__name__,
            }

    @staticmethod
    def _slug_seguro(valor):
        limpo = re.sub(r"[^a-z0-9_-]+", "-", str(valor).lower()).strip("-")
        return limpo[:100] or "site"

    def _upload_r2(self, file_name, html_content):
        """Envia o HTML ao R2 pela API S3-compatible."""
        cliente = self._cliente_s3()
        cliente.put_object(
            Bucket=self.bucket_name,
            Key=file_name,
            Body=html_content.encode("utf-8"),
            ContentType="text/html; charset=utf-8",
            CacheControl="public, max-age=300",
        )

    def salvar_site_compilado(self, client_slug, html_content):
        """
        Grava o site compilado.

        A cópia local é sempre gravada primeiro. Quando as credenciais e o
        cliente S3 estão disponíveis, o mesmo HTML é enviado ao Cloudflare R2.
        A falha remota nunca apaga nem invalida a cópia local.

        `publicado` só fica True quando o upload termina E existe uma base URL
        pública configurada. Upload privado no bucket não é publicação.

        Returns:
            dict com status, caminho local, `publicado` (bool) e `cdn_url`
            (str|None). `cdn_url` só deixa de ser None quando houver upload
            real e um domínio efetivamente servindo os arquivos.
        """
        client_slug = self._slug_seguro(client_slug)
        file_name = f"{client_slug}.html"
        local_path = os.path.join(STORAGE_DIR, file_name)

        with open(local_path, "w", encoding="utf-8") as f:
            f.write(html_content)

        enviado_r2 = False
        erro_r2 = None
        if self.configurado():
            try:
                self._upload_r2(file_name, html_content)
                enviado_r2 = True
                print(f"[R2StorageEngine] '{file_name}' enviado ao R2.")
            except Exception as exc:
                erro_r2 = f"{type(exc).__name__}: {exc}"
                print(
                    f"[R2StorageEngine] Upload R2 falhou; cópia local preservada "
                    f"({type(exc).__name__})."
                )
        else:
            print(f"[R2StorageEngine] Site '{client_slug}' salvo localmente em: {local_path}")

        cdn_url = (
            f"{self.public_base_url}/{file_name}"
            if enviado_r2 and self.public_base_url
            else None
        )
        return {
            "status": "success",
            "bucket": self.bucket_name,
            "file_name": file_name,
            "local_path": local_path,
            "enviado_r2": enviado_r2,
            "publicado": bool(cdn_url),
            "cdn_url": cdn_url,
            "motivo": (
                None
                if cdn_url
                else "dominio_publico_nao_configurado"
                if enviado_r2
                else "upload_r2_falhou"
                if erro_r2
                else "r2_nao_configurado"
            ),
            "erro_r2": erro_r2,
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
