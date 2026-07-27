# -*- coding: utf-8 -*-
"""
Testes do backend REPASS AI.

Além da estrutura da API, cobre as GARANTIAS DE INTEGRIDADE que impedem
o produto de apresentar dado inventado como resultado de varredura real,
e a proteção contra SSRF no proxy de mídia. Essas são regressões caras:
falharam uma vez e chegariam ao cliente final.
"""

import unittest
import json
import urllib.request
import urllib.error
import urllib.parse
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))


class TestIntegridadeDeDados(unittest.TestCase):
    """A varredura nunca pode fabricar dado de contato."""

    def setUp(self):
        from scraper_monster import OSINTCore
        self.core = OSINTCore()

    def test_varredura_retorna_leads_e_meta(self):
        leads, meta = self.core.executar_varredura(
            "SP", "Franca", nichos="barbearia, hamburgueria", max_results=5
        )
        self.assertIsInstance(leads, list)
        self.assertIsInstance(meta, dict)
        self.assertIn("modo", meta)
        self.assertIn(meta["modo"], ("real", "demo"))
        self.assertIn("dados_reais", meta)

    def test_modo_demo_nunca_inventa_contato(self):
        """
        Sem GOOGLE_PLACES_API_KEY, os leads são exemplos de layout e
        precisam vir sem telefone, sem WhatsApp e sem nota. Preencher
        esses campos faria o operador abordar um terceiro qualquer.
        """
        import places_engine
        if places_engine.places_configurado():
            self.skipTest("Chave configurada: modo real, este teste não se aplica.")

        leads, meta = self.core.executar_varredura(
            "SP", "Franca", nichos="barbearia", max_results=5
        )
        self.assertEqual(meta["modo"], "demo")
        self.assertFalse(meta["dados_reais"])
        self.assertGreater(len(leads), 0)

        for lead in leads:
            self.assertTrue(lead["is_demo"], f"{lead['nome']} deveria estar marcado como demo")
            self.assertIsNone(lead["telefone"], f"{lead['nome']} não pode ter telefone")
            self.assertIsNone(lead["whatsapp"], f"{lead['nome']} não pode ter link de WhatsApp")
            self.assertIsNone(lead["avaliacao"], f"{lead['nome']} não pode ter nota")

    def test_link_whatsapp_rejeita_telefone_invalido(self):
        """Só telefone com 10 (fixo) ou 11 (móvel) dígitos vira link."""
        from scraper_monster import LeadParser

        self.assertIsNone(LeadParser.gerar_link_whatsapp(None))
        self.assertIsNone(LeadParser.gerar_link_whatsapp(""))
        # 12 dígitos: era exatamente o formato que o gerador antigo produzia.
        self.assertIsNone(LeadParser.gerar_link_whatsapp("(16) 9 91073-4376"))
        self.assertIsNone(LeadParser.gerar_link_whatsapp("123"))

        self.assertEqual(
            LeadParser.gerar_link_whatsapp("(16) 99050-5914"),
            "https://wa.me/5516990505914",
        )
        self.assertEqual(
            LeadParser.gerar_link_whatsapp("(16) 3723-2723"),
            "https://wa.me/551637232723",
        )

    def test_score_usa_apenas_dados_reais(self):
        """O score vem dos campos do Places, sem componente aleatório."""
        import places_engine

        lugar = {"website": None, "rating": 4.8, "user_ratings_total": 10}
        s1, m1 = places_engine.score_oportunidade(lugar)
        s2, m2 = places_engine.score_oportunidade(lugar)
        self.assertEqual(s1, s2, "score precisa ser determinístico")
        self.assertEqual(m1, "sem_site")

        com_site = {"website": "https://exemplo.com.br", "rating": 4.6,
                    "user_ratings_total": 200}
        s3, _ = places_engine.score_oportunidade(com_site)
        self.assertLess(s3, s1, "quem não tem site deve pontuar mais")

    def test_mensagem_nao_promete_site_pronto(self):
        """
        A abordagem não pode afirmar que um site já existe nem embutir
        link — não há motor de deploy, o link seria morto.
        """
        import places_engine

        lugar = {"name": "Barbearia Teste", "rating": 4.7, "user_ratings_total": 12}
        msg = places_engine.gerar_mensagem(lugar, "sem_site", "Franca", "barbearia")

        self.assertNotIn("http", msg.lower())
        self.assertNotIn("sobresite", msg.lower())
        for promessa in ("montei", "criei", "fiz um site", "site pronto"):
            self.assertNotIn(promessa, msg.lower())
        self.assertIn("Barbearia Teste", msg)


class TestConfiguracaoDeMotores(unittest.TestCase):
    """Contratos que impedem o ambiente de parecer configurado sem estar."""

    def test_r2_aceita_nomes_existentes_sem_expor_segredos(self):
        import os
        from unittest import mock
        from r2_storage_engine import R2StorageEngine

        env = {
            "R2_ACCOUNT_ID": "conta-teste",
            "R2_ACCESS_KEY_ID": "acesso-teste",
            "R2_SECRET_ACCESS_KEY": "segredo-teste",
            "R2_BUCKET_NAME": "bucket-teste",
            "R2_PUBLIC_BASE_URL": "",
            "CLOUDFLARE_R2_ACCOUNT_ID": "",
            "CLOUDFLARE_R2_ACCESS_KEY": "",
            "CLOUDFLARE_R2_SECRET_KEY": "",
        }
        with mock.patch.dict(os.environ, env, clear=False):
            r2 = R2StorageEngine()

        self.assertTrue(r2.configurado())
        self.assertEqual(r2.bucket_name, "bucket-teste")
        self.assertFalse(r2.public_base_url)

    def test_rodizio_llm_persiste_entre_requisicoes(self):
        import llm_gateway

        primeira = llm_gateway.provedores_ativos()
        segunda = llm_gateway.provedores_ativos()
        self.assertIs(
            primeira, segunda,
            "recriar provedores apaga a quarentena das chaves após HTTP 429",
        )

    def test_supabase_aceita_chaves_novas(self):
        import os
        from unittest import mock
        import supabase_client

        env = {
            "SUPABASE_URL": "https://projeto.supabase.co",
            "SUPABASE_PUBLISHABLE_KEY": "sb_publishable_teste",
            "SUPABASE_SECRET_KEY": "sb_secret_teste",
            "SUPABASE_ANON_KEY": "",
            "SUPABASE_SERVICE_ROLE_KEY": "",
        }
        with mock.patch.dict(os.environ, env, clear=False):
            self.assertEqual(
                supabase_client.anon_key(), "sb_publishable_teste"
            )
            self.assertEqual(
                supabase_client.service_key(), "sb_secret_teste"
            )
            self.assertTrue(supabase_client.auth_configurado())
            headers = supabase_client._headers_servico()
            self.assertEqual(headers["apikey"], "sb_secret_teste")
            self.assertNotIn(
                "Authorization", headers,
                "sb_secret não é JWT e não pode ser enviada como Bearer",
            )

    def test_supabase_service_role_legada_mantem_bearer(self):
        import os
        from unittest import mock
        import supabase_client

        env = {
            "SUPABASE_SECRET_KEY": "",
            "SUPABASE_SERVICE_ROLE_KEY": "jwt-service-role-teste",
        }
        with mock.patch.dict(os.environ, env, clear=False):
            headers = supabase_client._headers_servico()
            self.assertEqual(headers["apikey"], "jwt-service-role-teste")
            self.assertEqual(
                headers["Authorization"], "Bearer jwt-service-role-teste"
            )


class TestProtecaoSSRF(unittest.TestCase):
    """O proxy de mídia não pode virar proxy aberto para a rede interna."""

    def test_allowlist_de_hosts(self):
        import app_api

        permitidos = [
            "https://maps.googleapis.com/maps/api/place/photo?x=1",
            "https://images.unsplash.com/photo-123",
        ]
        bloqueados = [
            "http://169.254.169.254/latest/meta-data/",  # metadados de nuvem
            "http://localhost:8000/api/health",
            "https://127.0.0.1/admin",
            "http://192.168.0.1/",
            "https://evil.com/x",
            "https://maps.googleapis.com.evil.com/x",     # spoof por sufixo
            "file:///etc/passwd",
        ]

        for url in permitidos:
            self.assertTrue(app_api.host_permitido(url), f"deveria permitir: {url}")
        for url in bloqueados:
            self.assertFalse(app_api.host_permitido(url), f"deveria bloquear: {url}")


class TestPreviewHtml(unittest.TestCase):
    """
    O endpoint que serve o HTML do editor não pode virar leitor de arquivos.

    O parâmetro `file` vem do cliente. Sem sanear, `os.path.join` com
    "../../.env" escapa da pasta — e no Windows um caminho absoluto faz o
    join descartar o diretório base. Qualquer um dos dois entregaria o .env
    com todas as chaves de API.
    """

    BASE = "http://localhost:8000"

    PAYLOADS = [
        "../../.env",
        "../../../backend/.env",
        "..\\..\\.env",
        "C:\\Windows\\win.ini",
        "/etc/passwd",
        "../../.env%00.html",
    ]

    # Se qualquer um destes aparecer na resposta, vazou segredo.
    MARCADORES_DE_SEGREDO = ("GROQ_API_KEYS", "sk-or-v1", "AIza", "CLOUDFLARE_R2_SECRET")

    def _buscar(self, arquivo):
        url = f"{self.BASE}/api/site/preview_html?file={urllib.parse.quote(arquivo, safe='')}"
        try:
            with urllib.request.urlopen(urllib.request.Request(url), timeout=8) as res:
                return res.read().decode("utf-8", errors="replace")
        except urllib.error.HTTPError as e:
            return e.read().decode("utf-8", errors="replace")
        except (urllib.error.URLError, OSError):
            self.skipTest("Servidor API offline, pulando teste de integração.")

    def test_nao_vaza_arquivo_fora_do_catalogo(self):
        for payload in self.PAYLOADS:
            corpo = self._buscar(payload)
            for marcador in self.MARCADORES_DE_SEGREDO:
                self.assertNotIn(
                    marcador, corpo,
                    f"path traversal vazou segredo com payload: {payload}"
                )

    def test_serve_arquivo_legitimo(self):
        """Um .html real do catálogo continua sendo servido normalmente."""
        import os
        catalogo = os.path.join(os.path.dirname(__file__), "data", "77lib_catalog")
        if not os.path.isdir(catalogo):
            self.skipTest("catálogo 77lib ainda não gerado")

        htmls = [f for f in os.listdir(catalogo) if f.endswith(".html")]
        if not htmls:
            self.skipTest("nenhum HTML compilado no catálogo")

        corpo = self._buscar(htmls[0])
        self.assertGreater(len(corpo), 0, "endpoint devolveu vazio para arquivo válido")


class TestApiHttp(unittest.TestCase):
    """Testes de integração — pulados se o servidor não estiver no ar."""

    def setUp(self):
        self.base_url = "http://localhost:8000"

    def _get(self, path):
        try:
            req = urllib.request.Request(f"{self.base_url}{path}")
            with urllib.request.urlopen(req, timeout=5) as response:
                return response.status, json.loads(response.read().decode('utf-8'))
        except (urllib.error.URLError, OSError):
            self.skipTest("Servidor API offline, pulando teste de integração.")

    def test_health_check(self):
        status, data = self._get("/api/health")
        self.assertEqual(status, 200)
        self.assertEqual(data["status"], "ok")

    def test_scan_expoe_modo_no_meta(self):
        payload = json.dumps({
            "cidade": "Franca", "estado": "SP",
            "nichos": "barbearia", "max_results": 2
        }).encode('utf-8')
        try:
            req = urllib.request.Request(
                f"{self.base_url}/api/leads/scan",
                data=payload,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=30) as response:
                self.assertEqual(response.status, 200)
                data = json.loads(response.read().decode('utf-8'))
        except (urllib.error.URLError, OSError):
            self.skipTest("Servidor API offline, pulando teste de integração.")

        self.assertIn("meta", data)
        self.assertIn(data["meta"]["modo"], ("real", "demo"))
        # A UI depende de is_demo para bloquear disparo comercial.
        for lead in data["leads"]:
            self.assertIn("is_demo", lead)

    def test_proxy_bloqueia_host_interno(self):
        alvo = "http://169.254.169.254/latest/meta-data/"
        url = f"{self.base_url}/api/media/proxy?ref={urllib.parse.quote(alvo, safe='')}"
        try:
            urllib.request.urlopen(urllib.request.Request(url), timeout=5)
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 403, "proxy deve recusar host não autorizado")
            return
        except (urllib.error.URLError, OSError):
            self.skipTest("Servidor API offline, pulando teste de integração.")
        self.fail("proxy aceitou host interno — SSRF aberto")


if __name__ == "__main__":
    import urllib.parse  # usado no teste de proxy
    unittest.main(verbosity=2)
