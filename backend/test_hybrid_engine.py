# -*- coding: utf-8 -*-
"""
Testes unitários do REPASSAI Hybrid Engine (95% Determinístico).
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from rules.regras_validacao import sanitizar_telefone, gerar_whatsapp_url, sanitizar_lead_dados
from rules.regras_categorizacao import categorizar_nicho
from rules.regras_texto import gerar_titulo_hero, gerar_cta_texto
from hybrid_engine import HybridSiteGenerator

class TestHybridEngine(unittest.TestCase):

    def test_sanitizacao_telefone_br(self):
        self.assertEqual(sanitizar_telefone("16990505914"), "(16) 9 9050-5914")
        self.assertEqual(sanitizar_telefone("5516990505914"), "(16) 9 9050-5914")
        self.assertEqual(sanitizar_telefone("1637232723"), "(16) 3723-2723")
        self.assertIsNone(sanitizar_telefone("invalid"))

    def test_geracao_whatsapp_url(self):
        self.assertEqual(gerar_whatsapp_url("(16) 99050-5914"), "https://wa.me/5516990505914")
        self.assertIsNone(gerar_whatsapp_url(None))

    def test_categorizacao_nicho(self):
        res1 = categorizar_nicho("Pizzaria Artesanal")
        self.assertEqual(res1["nicho_chave"], "gastronomia")

        res2 = categorizar_nicho("Barbearia Vintage")
        self.assertEqual(res2["nicho_chave"], "estetica_masculina")

        res3 = categorizar_nicho("Consultório Odontológico")
        self.assertEqual(res3["nicho_chave"], "saude")

    def test_geracao_site_determinística(self):
        generator = HybridSiteGenerator()
        lead_sample = {
            "nome": "Fogo Vivo Steakhouse",
            "categoria": "Restaurante",
            "cidade": "Franca",
            "estado": "SP",
            "telefone": "(16) 99050-5914",
            "avaliacao": 4.9,
            "reviewsCount": 850
        }
        
        resultado = generator.generate(lead_sample)
        
        self.assertTrue(resultado["sucesso"])
        self.assertEqual(resultado["metodo"], "deterministic")
        self.assertEqual(resultado["custo_usd"], 0.0)
        self.assertLess(resultado["tempo_ms"], 500, "Compilação determinística deve levar menos de 500ms")
        
        schema = resultado["schema"]
        self.assertIn("Fogo Vivo Steakhouse", schema["meta"]["title"])
        self.assertIn("https://wa.me/5516990505914", schema["hero"]["ctaLink"])

if __name__ == '__main__':
    unittest.main()
