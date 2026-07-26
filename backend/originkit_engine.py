# -*- coding: utf-8 -*-
"""
REPASS AI - Motor Avançado de Bibliotecas (OriginKit / 21st.dev Registry Engine)

Este script automatiza o download, mineração e catalogação de todas as 9 categorias
de componentes da OriginKit / 21st.dev (Text, Button, Border, Image, Image Gallery,
Cursor, Elements, Animations, Background) via Shadcn Registry CLI & API.
"""

import os
import sys
import json
import subprocess
import re
import urllib.request

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CATALOG_DIR = os.path.join(BASE_DIR, "data", "originkit_catalog")

os.makedirs(CATALOG_DIR, exist_ok=True)

CATEGORIAS = {
    "Text": 24,
    "Button": 5,
    "Border": 1,
    "Image": 12,
    "Image Gallery": 21,
    "Cursor": 7,
    "Elements": 16,
    "Animations": 6,
    "Background": 18
}

class OriginKitEngine:
    def __init__(self, token=None):
        self.token = token or os.environ.get("ORIGINKIT_TOKEN", "")

    def baixar_componente_shadcn(self, registry_url, categoria="Elements"):
        """
        Baixa um componente da OriginKit / 21st.dev usando a CLI oficial do Shadcn
        ou via requisição HTTP direta com o token de autenticação.
        """
        if self.token and "token=" not in registry_url:
            separator = "&" if "?" in registry_url else "?"
            registry_url = f"{registry_url}{separator}token={self.token}"

        cat_clean = re.sub(r'[^a-zA-Z0-9]', '_', categoria.lower())
        cat_dir = os.path.join(CATALOG_DIR, cat_clean)
        os.makedirs(cat_dir, exist_ok=True)

        print(f"[OriginKitEngine] Baixando componente de {registry_url}...")

        # 1. Tenta baixar via Shadcn CLI
        cmd = f'npx -y shadcn@latest add "{registry_url}" --yes'
        try:
            res = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=BASE_DIR)
            if res.returncode == 0:
                print(f"[OriginKitEngine] Componente instalado via Shadcn CLI com sucesso!")
                return {"status": "success", "method": "shadcn_cli", "url": registry_url}
        except Exception as e:
            print(f"[OriginKitEngine] Aviso no Shadcn CLI: {e}")

        # 2. Fallback via HTTP Direct JSON Registry
        try:
            req = urllib.request.Request(
                registry_url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) RepassAI/1.0",
                    "Accept": "application/json"
                }
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                
                comp_name = data.get("name", "componente_custom")
                file_path = os.path.join(cat_dir, f"{comp_name}.json")
                with open(file_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)

                print(f"[OriginKitEngine] Componente '{comp_name}' minerado via JSON e salvo em {file_path}")
                return {"status": "success", "method": "json_registry", "file": file_path}
        except Exception as err:
            print(f"[OriginKitEngine] Falha ao baixar via HTTP: {err}")
            return {"status": "error", "error": str(err), "url": registry_url}

    def catalogar_lote_componentes(self, lista_urls):
        """
        Recebe uma lista de URLs/Registry Slugs da OriginKit e faz o download em massa.
        """
        resultados = []
        for item in lista_urls:
            url = item.get("url") if isinstance(item, dict) else item
            cat = item.get("category", "General") if isinstance(item, dict) else "General"
            res = self.baixar_componente_shadcn(url, cat)
            resultados.append(res)
        return resultados

if __name__ == "__main__":
    engine = OriginKitEngine()
    
    # Exemplo de teste com o componente de Background do print do usuário (Flow Field Background)
    url_exemplo = "https://21st.dev/r/easemize/flow-field-background"
    print(f"\n--- TESTANDO ENGINE ORIGINKIT // 21ST.DEV ---")
    res = engine.baixar_componente_shadcn(url_exemplo, "Background")
    print(json.dumps(res, indent=2, ensure_ascii=False))
