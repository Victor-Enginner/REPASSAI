# -*- coding: utf-8 -*-
import unittest
import json
import urllib.request
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

class TestRepassApi(unittest.TestCase):
    def setUp(self):
        self.base_url = "http://localhost:8000"

    def test_health_check(self):
        try:
            req = urllib.request.Request(f"{self.base_url}/api/health")
            with urllib.request.urlopen(req) as response:
                self.assertEqual(response.status, 200)
                data = json.loads(response.read().decode('utf-8'))
                self.assertEqual(data["status"], "ok")
        except urllib.error.URLError:
            self.skipTest("Servidor API offline, pulando teste de integracao HTTP.")

    def test_osint_core_scan_structure(self):
        from scraper_monster import OSINTCore
        core = OSINTCore()
        results = core.executar_varredura("SP", "Franca", nichos="barbearia, hamburgueria", max_results=5)
        self.assertIsInstance(results, list)
        self.assertGreater(len(results), 0)
        self.assertIn("lead_id", results[0])
        self.assertIn("osint_score", results[0])
        self.assertIn("metrics_snapshot", results[0])

    def test_site_cloner_engine(self):
        try:
            payload = json.dumps({"url": "https://systemista.lovable.app/"}).encode('utf-8')
            req = urllib.request.Request(
                f"{self.base_url}/api/site/clone",
                data=payload,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req) as response:
                self.assertEqual(response.status, 200)
                data = json.loads(response.read().decode('utf-8'))
                self.assertEqual(data["status"], "success")
                self.assertIn("clonedSchema", data)
        except urllib.error.URLError:
            self.skipTest("Servidor API offline, pulando teste do site cloner.")

if __name__ == "__main__":
    unittest.main()
