# -*- coding: utf-8 -*-
"""
REPASS AI - Runner Unificado de Produção (Beta Live Pipeline)

Este script executa a pipeline completa do REPASS AI em 1 clique:
1. Varredura OSINT no Google Places (dados reais + 10 fotos reais do Google Business).
2. Download de Templates da 77lib.dev / OriginKit.
3. Síntese RAG de Copy em Português BR.
4. Armazenamento no Cloudflare R2 (10GB Free Tier).
5. Geração de Script do Cloudflare Worker para CNAME do cliente.
"""

import os
import sys
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from dotenv import load_dotenv
load_dotenv(os.path.join(BASE_DIR, ".env"))

import places_engine
from scraper_monster import OSINTCore
from lib77_engine import Lib77Engine
from r2_storage_engine import R2StorageEngine

def executar_pipeline_completa_beta(cidade="Franca", estado="SP", nicho="hamburgueria", max_leads=2):
    print("\n========================================================")
    print(" 🚀 REPASS AI // EXECUÇÃO DA PIPELINE BETA EM 1 CLIQUE")
    print("========================================================\n")

    # Step 1: Varredura OSINT + Fotos Reais do Google Business
    print("[1/5] Executando varredura OSINT no Google Places...")
    core = OSINTCore()
    leads, meta = core.executar_varredura(estado=estado, cidade=cidade, nichos=nicho, max_results=max_leads)
    
    print(f"  -> Leads encontrados: {len(leads)} | Modo: {meta.get('modo')}")
    if not leads:
        print("  [Erro] Nenhum lead encontrado.")
        return

    lead_target = leads[0]
    print(f"  -> Lead selecionado: {lead_target.get('nome')} | Telefone: {lead_target.get('telefone')}")

    # Step 2: Download & Síntese Procedural do Template 77lib
    print("\n[2/5] Baixando template 77lib e executando tradução RAG em Português...")
    lib77 = Lib77Engine()
    sintese = lib77.gerar_site_injetado_osint(lead_target, "aura-template-digital-creative-30")
    
    html_file = sintese.get("output_html_file")
    print(f"  -> Site HTML gerado em: {html_file}")

    # Step 3: Leitura do HTML e Armazenamento no Cloudflare R2
    print("\n[3/5] Processando upload para o Cloudflare R2 Bucket (Storage 10GB Free)...")
    with open(html_file, "r", encoding="utf-8") as f:
        html_content = f.read()

    r2 = R2StorageEngine()
    client_slug = os.path.basename(html_file).replace("generated_", "").replace(".html", "")
    res_r2 = r2.salvar_site_compilado(client_slug, html_content)
    
    print(f"  -> Armazenado no R2: {res_r2.get('file_name')} | CDN URL: {res_r2.get('cdn_url')}")

    # Step 4: Geração do Script do Cloudflare Worker para CNAME Grátis
    print("\n[4/5] Gerando roteador de CNAME do Cloudflare Worker para o cliente...")
    domain_slug = f"site.{client_slug.replace('_', '')}.com.br"
    worker_code = r2.gerar_script_worker_cname(client_slug, domain_slug)
    
    worker_file = os.path.join(BASE_DIR, "data", "r2_bucket", f"worker_{client_slug}.js")
    with open(worker_file, "w", encoding="utf-8") as f:
        f.write(worker_code)

    print(f"  -> Script Worker CNAME gerado para '{domain_slug}': {worker_file}")

    # Step 5: Relatório Final
    print("\n========================================================")
    print(" ✅ PIPELINE BETA CONCLUÍDA COM SUCESSO!")
    print("========================================================")
    print(json.dumps({
        "empresa": lead_target.get("nome"),
        "telefone_whatsapp": lead_target.get("telefone"),
        "localizacao": lead_target.get("endereco"),
        "site_html_local": html_file,
        "cdn_url_r2": res_r2.get("cdn_url"),
        "cname_custom_domain": domain_slug
    }, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    executar_pipeline_completa_beta("Franca", "SP", "hamburgueria", max_leads=2)
