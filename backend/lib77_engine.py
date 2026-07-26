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
        Baixa o template cru da 77lib.dev e substitui proceduralmente os textos, imagens,
        telefone e CTAs com os dados OSINT reais do lead, traduzindo totalmente para Português BR.
        """
        data = self.baixar_template_registry(template_slug)
        if not data or "files" not in data or not data["files"]:
            raise ValueError(f"Não foi possível obter os arquivos do template {template_slug}")

        raw_html = data["files"][0]["content"]

        # Dados reais do Lead OSINT
        nome_empresa = lead_data.get("nome", "Sua Empresa")
        nicho = lead_data.get("categoria", "Gastronomia & Experiência")
        cidade = lead_data.get("cidade", "Franca")
        estado = lead_data.get("estado", "SP")
        endereco = lead_data.get("endereco", f"{cidade}, {estado}")
        telefone = lead_data.get("telefone", "(16) 99999-9999")
        whatsapp_url = lead_data.get("whatsapp", f"https://wa.me/55{re.sub(r'\\D', '', telefone)}")
        avaliacao = lead_data.get("avaliacao", 4.8)
        reviews = lead_data.get("reviewsCount", 500)

        media_enrichment = lead_data.get("mediaEnrichment", {})
        design_system = media_enrichment.get("designSystem", {})
        hero_bg = design_system.get("heroBackground", "https://images.unsplash.com/photo-1544025162-d76694265947")
        galeria = design_system.get("gallery", [])

        # Injeção Procedural RAG Completa (Sem Francês, Sem Sobreposição)
        html_injetado = raw_html
        
        # 1. SEO & Título da Aba
        html_injetado = re.sub(r'<title>.*?</title>', f'<title>{nome_empresa} | {nicho} em {cidade} - {estado}</title>', html_injetado)
        
        # 2. Marca Header & Footer
        html_injetado = html_injetado.replace('Exo Ape', nome_empresa)

        # 3. Título Hero Gigante em Português
        palavras_nome = nome_empresa.split()
        l1 = palavras_nome[0] if len(palavras_nome) > 0 else "Alta"
        l2 = palavras_nome[1] if len(palavras_nome) > 1 else "Qualidade"
        l3 = " ".join(palavras_nome[2:]) if len(palavras_nome) > 2 else nicho.title()

        hero_h1_sub = f'<span class="block">{l1}</span><span class="block ml-[10vw]">{l2}</span><span class="block">{l3}</span>'
        html_injetado = re.sub(
            r'<h1[^>]*>.*?<span class="block">Digital</span>.*?<span class="block ml-\[10vw\]">Design</span>.*?<span class="block">Expérience</span>.*?</h1>',
            f'<h1 class="text-[14vw] lg:text-[11vw] leading-[0.85] tracking-tighter flex flex-col">{hero_h1_sub}</h1>',
            html_injetado,
            flags=re.DOTALL
        )

        # 4. Tradução dos Textos de Apresentação Hero
        p_hero_1 = f"O melhor em {nicho} em {cidade} - {estado}. Experiência gastronômica e atendimento VIP com nota {avaliacao} no Google ({reviews} avaliações)."
        html_injetado = re.sub(
            r'Studio de design numérique en partenariat avec des marques.*?</p>',
            f'{p_hero_1}</p>',
            html_injetado,
            flags=re.DOTALL
        )

        p_hero_2 = f"Conheça nosso espaço e cardápio exclusivo. Atendimento rápido e reservas diretas no WhatsApp de {cidade}."
        html_injetado = re.sub(
            r'Nous aidons les entreprises axées sur l\'expérience à prospérer.*?</p>',
            f'{p_hero_2}</p>',
            html_injetado,
            flags=re.DOTALL
        )

        # 5. Tradução dos Títulos de Seção
        html_injetado = html_injetado.replace('Réalisations', 'Destaques & Cardápio')
        html_injetado = html_injetado.replace('Projets en vedette', 'Nossas Especialidades')
        html_injetado = html_injetado.replace('Voir la Vidéo', 'Experiência Ao Vivo')
        html_injetado = html_injetado.replace('Travail en mouvement', 'Assista ao Vídeo')
        html_injetado = html_injetado.replace('Faire Passer le Mot', 'Avaliações do Google')
        html_injetado = html_injetado.replace('Dans les médias', 'O Que Dizem os Clientes')
        html_injetado = html_injetado.replace('Notre Histoire', 'Nossa História')
        html_injetado = html_injetado.replace('Le Studio', 'Fazer Pedido')
        html_injetado = html_injetado.replace('Actualités', 'Novidades')
        html_injetado = html_injetado.replace('Studio', 'Sobre Nós')
        html_injetado = html_injetado.replace('Parcourir tous les projets', 'Ver Cardápio Completo')

        # 6. Injeta a imagem Hero do Google Places
        if hero_bg:
            html_injetado = re.sub(
                r'https://a\.storyblok\.com/f/133769/1920x2716/5c24d6b467/exo-ape-hero-1\.jpg[^\"]*',
                hero_bg,
                html_injetado
            )
        
        # 7. Injeta a galeria de mídias reais
        if galeria:
            for idx, img_url in enumerate(galeria):
                html_injetado = re.sub(
                    r'https://a\.storyblok\.com/f/133769/[^\"]*\.(jpg|png|jpeg)[^\"]*',
                    img_url,
                    html_injetado,
                    count=1
                )

        # 8. Contato Real, Endereço e WhatsApp
        nome_slug = re.sub(r'[^a-zA-Z0-9]', '_', nome_empresa.lower())
        html_injetado = html_injetado.replace('hello@exoape.com', f'contato@{nome_slug}.com.br')
        html_injetado = html_injetado.replace('+31 772 086 200', telefone)
        html_injetado = html_injetado.replace('Willem II Singel 8', endereco)
        html_injetado = html_injetado.replace('6041 HS, Roermond', f'{cidade} - {estado}')
        html_injetado = html_injetado.replace('Pays-Bas', 'Brasil')

        # 9. Converte todos os links CTAs para o WhatsApp real
        html_injetado = re.sub(r'href="#"', f'href="{whatsapp_url}" target="_blank"', html_injetado)

        # Salva o arquivo gerado
        out_file = os.path.join(CATALOG_DIR, f"generated_{nome_slug}.html")
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(html_injetado)

        print(f"[Lib77Engine] Site Procedural Gerado (100% Português BR): {out_file}")

        return {
            "status": "success",
            "empresa": nome_empresa,
            "template": template_slug,
            "output_html_file": out_file,
            "whatsapp_link": whatsapp_url
        }

if __name__ == "__main__":
    engine = Lib77Engine()
    
    # Teste com o exemplo do usuário: Fogo Vivo Steakhouse
    lead_fogo_vivo = {
        "nome": "Fogo Vivo Steakhouse",
        "categoria": "Restaurante & Churrascaria",
        "cidade": "Franca",
        "estado": "SP",
        "endereco": "Anexo ao posto Mario Roberto - Av. Alonso Y Alonso, 940 - Jardim Veneza",
        "telefone": "(16) 99050-5914",
        "whatsapp": "https://wa.me/5516990505914",
        "avaliacao": 4.8,
        "reviewsCount": 1177,
        "mediaEnrichment": {
            "designSystem": {
                "heroBackground": "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80",
                "gallery": [
                    "https://images.unsplash.com/photo-1558030006-450675393462?w=800&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80"
                ]
            }
        }
    }
    
    res = engine.gerar_site_injetado_osint(lead_fogo_vivo, "aura-template-digital-creative-30")
    print(json.dumps(res, indent=2, ensure_ascii=False))
