# -*- coding: utf-8 -*-
"""
REPASS AI - Motor Procedural de Templates (77lib.dev Engine)

Este módulo automatiza a mineração, download e síntese procedural de templates e componentes
da plataforma 77lib.dev (via Shadcn Registry API) e realiza a fusão RAG com os dados reais
do lead capturado via OSINT (Google Places).
"""

import os
import sys
import json
import re
import urllib.request
import urllib.parse

# Configurações de Caminho
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CATALOG_DIR = os.path.join(BASE_DIR, "data", "77lib_catalog")

os.makedirs(CATALOG_DIR, exist_ok=True)

TOKEN_PADRAO = "a2c2dd79e0d5477eaf1ffb3144e27baf"
URL_BASE_77LIB = "https://77lib.dev/r"

class Lib77Engine:
    def __init__(self, token=None):
        self.token = token or os.environ.get("LIB77_TOKEN", TOKEN_PADRAO)

    def baixar_template_registry(self, template_slug="aura-template-digital-creative-30"):
        """
        Baixa o manifesto JSON do template a partir do registry privado da 77lib.dev.
        Exemplo URL: https://77lib.dev/r/aura-template-digital-creative-30?token=...
        """
        url = f"{URL_BASE_77LIB}/{template_slug}?token={self.token}"
        req = urllib.request.Request(
            url, 
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) RepassAI/1.0"}
        )
        
        print(f"[Lib77Engine] Conectando ao Registry 77lib.dev: {template_slug}...")
        try:
            with urllib.request.urlopen(req, timeout=15) as res:
                content_type = res.headers.get('Content-Type', '')
                raw_data = res.read().decode('utf-8')
                
                try:
                    data = json.loads(raw_data)
                except json.JSONDecodeError:
                    data = {
                        "template_slug": template_slug,
                        "raw_content": raw_data,
                        "content_type": content_type
                    }
                
                # Salva localmente no banco de dados procedural
                file_path = os.path.join(CATALOG_DIR, f"{template_slug}.json")
                with open(file_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                
                print(f"[Lib77Engine] Template '{template_slug}' minerado e salvo com sucesso!")
                return data
        except Exception as e:
            print(f"[Lib77Engine] ERRO ao baixar template '{template_slug}': {e}")
            return None

    def gerar_site_injetado_osint(self, lead_data, template_slug="aura-template-digital-creative-30"):
        """
        Baixa o template cru da 77lib.dev e substitui procedura mente os textos, imagens,
        telefone e CTAs com os dados OSINT reais do lead.
        """
        data = self.baixar_template_registry(template_slug)
        if not data or "files" not in data or not data["files"]:
            raise ValueError(f"Não foi possível obter os arquivos do template {template_slug}")

        raw_html = data["files"][0]["content"]

        # Dados reais do Lead
        nome_empresa = lead_data.get("nome", "Sua Empresa")
        nicho = lead_data.get("categoria", "Serviços Especiais")
        cidade = lead_data.get("cidade", "Franca")
        estado = lead_data.get("estado", "SP")
        telefone = lead_data.get("telefone", "(16) 99999-9999")
        whatsapp_url = lead_data.get("whatsapp", f"https://wa.me/55{re.sub(r'\\D', '', telefone)}")

        media_enrichment = lead_data.get("mediaEnrichment", {})
        design_system = media_enrichment.get("designSystem", {})
        hero_bg = design_system.get("heroBackground", "https://images.unsplash.com/photo-1503951914875-452162b0f3f1")
        galeria = design_system.get("gallery", [])

        # Injeção Procedural
        html_injetado = raw_html
        
        # 1. Troca o título e marcas
        html_injetado = re.sub(r'<title>.*?</title>', f'<title>{nome_empresa} - {nicho} em {cidade}</title>', html_injetado)
        html_injetado = html_injetado.replace('Exo Ape', nome_empresa)
        
        # 2. Injeta a imagem Hero do Google Places
        if hero_bg:
            html_injetado = re.sub(
                r'https://a\.storyblok\.com/f/133769/1920x2716/5c24d6b467/exo-ape-hero-1\.jpg[^\"]*',
                hero_bg,
                html_injetado
            )
        
        # 3. Injeta a galeria de mídias reais
        if galeria:
            for idx, img_url in enumerate(galeria):
                html_injetado = re.sub(
                    r'https://a\.storyblok\.com/f/133769/[^\"]*\.(jpg|png|jpeg)[^\"]*',
                    img_url,
                    html_injetado,
                    count=1
                )

        # 4. Injeta os dados de contato reais e links de WhatsApp
        html_injetado = html_injetado.replace('hello@exoape.com', f'contato@{re.sub(r"[^a-zA-Z0-9]", "", nome_empresa.lower())}.com.br')
        html_injetado = html_injetado.replace('+31 772 086 200', telefone)
        html_injetado = re.sub(r'href="#"', f'href="{whatsapp_url}" target="_blank"', html_injetado)

        # Salva a página injetada gerada
        out_file = os.path.join(CATALOG_DIR, f"generated_{re.sub(r'[^a-zA-Z0-9]', '_', nome_empresa.lower())}.html")
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(html_injetado)

        print(f"[Lib77Engine] Site Procedural Gerado com Sucesso: {out_file}")

        return {
            "status": "success",
            "empresa": nome_empresa,
            "template": template_slug,
            "output_html_file": out_file,
            "whatsapp_link": whatsapp_url
        }

if __name__ == "__main__":
    engine = Lib77Engine()
    
    # Exemplo com o Lead Real que pegamos do Google Places no teste anterior!
    lead_real = {
        "nome": "Gran Roque Hamburgueria",
        "categoria": "Hamburgueria Gourmet",
        "cidade": "Franca",
        "estado": "SP",
        "telefone": "(16) 99328-3759",
        "whatsapp": "https://wa.me/5516993283759",
        "mediaEnrichment": {
            "designSystem": {
                "heroBackground": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
                "gallery": [
                    "https://images.unsplash.com/photo-1586190848861-99aa4a171e90",
                    "https://images.unsplash.com/photo-1550547660-d9450f859349"
                ]
            }
        }
    }
    
    res = engine.gerar_site_injetado_osint(lead_real, "aura-template-digital-creative-30")
    print(json.dumps(res, indent=2, ensure_ascii=False))
