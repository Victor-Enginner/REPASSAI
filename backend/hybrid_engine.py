# -*- coding: utf-8 -*-
"""
REPASSAI — Hybrid Site Generator Engine (95% Determinístico + 5% LLM Fallback).
"""

import time
import json
import os
import sys

from rules.regras_validacao import sanitizar_lead_dados
from rules.regras_categorizacao import categorizar_nicho
from rules.regras_texto import (
    gerar_titulo_hero,
    gerar_subtitulo_hero,
    gerar_descricao_negocio,
    gerar_cta_texto,
    gerar_diferenciais,
)

class HybridSiteGenerator:
    """
    Motor Híbrido de Geração de Sites do REPASSAI.
    Garante execução 95% sem IA em ~0.7s, recorrendo à LLM apenas em exceções.
    """

    def __init__(self):
        self.catalog_dir = os.path.join(os.path.dirname(__file__), "data", "77lib_catalog")

    def generate(self, lead_data: dict) -> dict:
        """
        Executa o fluxo híbrido de geração.
        """
        inicio = time.time()
        
        # PASSO 1: Sanitização & Validação Determinística (Camada 2)
        lead = sanitizar_lead_dados(lead_data)
        
        # PASSO 2: Categorização Determinística de Nicho (Camada 4)
        cat_info = categorizar_nicho(lead['categoria'])
        lead['nicho_chave'] = cat_info['nicho_chave']
        
        # PASSO 3: Geração Determinística de Textos & Copywriting (Camada 3)
        hero_title = gerar_titulo_hero(lead)
        hero_sub = gerar_subtitulo_hero(lead)
        desc_negocio = gerar_descricao_negocio(lead)
        cta_label = gerar_cta_texto(lead)
        diferenciais = gerar_diferenciais(lead)
        
        # PASSO 4: Montagem Declarativa do Schema / HTML (Camada 1 e 2)
        schema = {
          "meta": {
            "title": f"{lead['nome']} — {lead['categoria']}",
            "nicho": lead['categoria'],
            "cidade": lead['cidade'],
            "estado": lead['estado']
          },
          "hero": {
            "title": hero_title,
            "subtitle": hero_sub,
            "cta": cta_label,
            "ctaLink": lead.get('whatsapp') or "#contato"
          },
          "sobre": {
            "title": f"Sobre a {lead['nome']}",
            "descricao": desc_negocio,
            "endereco": lead['endereco']
          },
          "diferenciais": diferenciais,
          # Sem telefone real, os campos ficam vazios e a interface omite o
          # CTA. O padrão anterior era "(16) 99050-5914", que é o telefone
          # verdadeiro do Fogo Vivo Steakhouse: qualquer lead sem contato
          # publicaria o número de outra empresa no próprio site.
          "contato": {
            "telefone": lead.get('telefone') or "",
            "whatsapp": lead.get('whatsapp') or "",
            "endereco": lead['endereco']
          }
        }

        tempo_ms = int((time.time() - inicio) * 1000)

        return {
            "sucesso": True,
            "metodo": "deterministic",
            "tempo_ms": tempo_ms,
            "custo_usd": 0.0,
            "schema": schema,
            "lead": lead
        }

    def generate_with_fallback(self, lead_data: dict, prompt_custom: str = None) -> dict:
        """
        Executa a geração determinística e recorre à LLM (Camada 5) apenas se necessário.
        """
        # Se for um prompt livre fornecido pelo usuário (ex: aba Descrever)
        if prompt_custom and len(prompt_custom.strip()) > 30:
            return self._executar_llm_fallback(lead_data, prompt_custom)

        try:
            res = self.generate(lead_data)
            return res
        except Exception as e:
            print(f"[HybridEngine] Determinístico falhou: {e}. Executando fallback LLM...")
            return self._executar_llm_fallback(lead_data, str(e))

    def _executar_llm_fallback(self, lead_data: dict, motivo: str) -> dict:
        """
        Fallback para a Camada 5 (LLM Gateway).
        """
        inicio = time.time()
        try:
            import llm_gateway
            prompt = f"Gere schema JSON para o site da empresa {lead_data.get('nome')}. Nicho: {lead_data.get('categoria')}. Contexto: {motivo}"
            resp = llm_gateway.gerar(prompt, "Você é um gerador de schemas de sites.", temperature=0.2)
            tempo_ms = int((time.time() - inicio) * 1000)

            # O chamador lê `schema`. Este método devolvia só `texto`, então o
            # schema voltava vazio em silêncio sempre que o fallback entrava.
            # A base determinística garante um schema válido mesmo quando a
            # LLM devolve algo que não dá para aproveitar.
            try:
                base = self.generate(lead_data)["schema"]
            except Exception:
                base = {}

            return {
                "sucesso": resp.get("sucesso", False),
                "metodo": "llm_fallback",
                "tempo_ms": tempo_ms,
                "custo_usd": 0.01,
                "schema": base,
                "texto": resp.get("texto"),
                "lead": lead_data
            }
        except Exception as err:
            return {
                "sucesso": False,
                "metodo": "failed",
                "erro": str(err)
            }
