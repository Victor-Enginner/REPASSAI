# -*- coding: utf-8 -*-
"""
REPASS AI - Minerador Avançado de Bibliotecas (OriginKit / 21st.dev Engine)

Este script raspa e cataloga automaticamente todos os componentes públicos da OriginKit
(Text, Button, Border, Image, Image Gallery, Cursor, Elements, Animations, Background),
salvando os arquivos JSX/TSX e metadados diretamente no banco de dados local do REPASS AI.
"""

import os
import sys
import json
import re
import urllib.request
import urllib.parse
from html.parser import HTMLParser

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ORIGINKIT_DIR = os.path.join(BASE_DIR, "data", "originkit_catalog")

os.makedirs(ORIGINKIT_DIR, exist_ok=True)

CATEGORIAS = [
    "text",
    "button",
    "border",
    "image",
    "image-gallery",
    "cursor",
    "elements",
    "animations",
    "background"
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
}

class OriginKitScraper:
    def __init__(self):
        self.base_url = "https://www.originkit.dev"
        self.api_url = "https://21st.dev"

    def minerar_categoria(self, categoria):
        """
        Busca todos os componentes de uma categoria específica (ex.: background, text, button).
        """
        cat_dir = os.path.join(ORIGINKIT_DIR, categoria)
        os.makedirs(cat_dir, exist_ok=True)

        url = f"{self.base_url}/components/{categoria}"
        print(f"[OriginKitScraper] Minerando Categoria: '{categoria}' ({url})...")

        req = urllib.request.Request(url, headers=HEADERS)
        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                html = response.read().decode("utf-8")
                
                # Extrai links de componentes via regex
                component_links = set(re.findall(r'href=["\'](/components/[^"\']+)["\']', html))
                print(f"[OriginKitScraper] {len(component_links)} componentes encontrados em '{categoria}'.")

                catalog_data = []

                for link in component_links:
                    comp_name = link.split("/")[-1]
                    comp_url = f"{self.base_url}{link}"
                    
                    print(f"  -> Minerando componente: {comp_name}...")
                    comp_code = self.baixar_codigo_componente(comp_url)

                    comp_item = {
                        "name": comp_name,
                        "category": categoria,
                        "url": comp_url,
                        "code": comp_code
                    }

                    # Salva código individual em arquivo JSX
                    if comp_code:
                        file_path = os.path.join(cat_dir, f"{comp_name}.jsx")
                        with open(file_path, "w", encoding="utf-8") as f:
                            f.write(comp_code)
                    
                    catalog_data.append(comp_item)

                # Salva manifesto da categoria
                manifest_path = os.path.join(cat_dir, "manifest.json")
                with open(manifest_path, "w", encoding="utf-8") as f:
                    json.dump(catalog_data, f, indent=2, ensure_ascii=False)

                return catalog_data
        except Exception as e:
            print(f"[OriginKitScraper] Erro ao minerar categoria '{categoria}': {e}")
            return []

    def baixar_codigo_componente(self, comp_url):
        """
        Acessa a página do componente e extrai o código-fonte React/Tailwind.
        """
        req = urllib.request.Request(comp_url, headers=HEADERS)
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                html = response.read().decode("utf-8")
                
                # Tenta extrair código-fonte de blocos <pre><code> ou scripts de estado
                code_match = re.search(r'<pre[^>]*><code[^>]*>(.*?)</code></pre>', html, re.DOTALL)
                if code_match:
                    clean_code = code_match.group(1)
                    # Decodifica entidades HTML básicas
                    clean_code = clean_code.replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&').replace('&quot;', '"')
                    return clean_code
                
                # Fallback: Procura por dados JSON embutidos (__NEXT_DATA__)
                next_data = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html, re.DOTALL)
                if next_data:
                    try:
                        data = json.loads(next_data.group(1))
                        # Procura recursivamente por strings de código
                        raw_str = json.dumps(data)
                        codes = re.findall(r'"code"\s*:\s*"([^"]+)"', raw_str)
                        if codes:
                            return codes[0].replace('\\n', '\n').replace('\\"', '"')
                    except Exception:
                        pass
                
                return html
        except Exception as e:
            print(f"  [Erro] Falha ao extrair código de {comp_url}: {e}")
            return ""

    def minerar_tudo(self):
        """
        Executa a mineração completa em todas as 9 categorias da OriginKit.
        """
        total_minerado = 0
        resumo = {}

        for cat in CATEGORIAS:
            itens = self.minerar_categoria(cat)
            count = len(itens)
            total_minerado += count
            resumo[cat] = count

        print("\n==========================================")
        print("   MINERAÇÃO ORIGINKIT CONCLUÍDACOM SUCESSO!")
        print("==========================================")
        print(json.dumps(resumo, indent=2))
        print(f"Total de Componentes Indexados: {total_minerado}")

if __name__ == "__main__":
    scraper = OriginKitScraper()
    scraper.minerar_tudo()
