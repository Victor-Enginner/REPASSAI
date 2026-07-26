# -*- coding: utf-8 -*-
"""
REPASS AI - Integração com BaseHub Headless CMS (Zero-Cost Stack)
Documentação oficial: https://docs.basehub.com/api-reference

Este motor gerencia o versionamento de schemas de IA, conteúdos RAG e tabelas de leads
no BaseHub Headless CMS via GraphQL API.
"""

import os
import sys
import json
import urllib.request
import urllib.parse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from dotenv import load_dotenv
load_dotenv(os.path.join(BASE_DIR, ".env"))

BASEHUB_ENDPOINT = "https://api.basehub.com/graphql"

class BaseHubEngine:
    def __init__(self, token=None):
        self.token = token or os.environ.get("BASEHUB_TOKEN", "").strip()

    def esta_configurado(self):
        return bool(self.token)

    def executar_query_graphql(self, query, variables=None):
        """Executa uma query ou mutação na API GraphQL do BaseHub."""
        if not self.esta_configurado():
            print("[BaseHubEngine] Token do BaseHub não configurado no .env (BASEHUB_TOKEN). Usando cache local.")
            return {"data": None, "status": "simulated"}

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}"
        }

        payload = {"query": query, "variables": variables or {}}
        data_bytes = json.dumps(payload).encode("utf-8")

        req = urllib.request.Request(BASEHUB_ENDPOINT, data=data_bytes, headers=headers, method="POST")

        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                res_json = json.loads(resp.read().decode("utf-8"))
                return res_json
        except Exception as e:
            print(f"[BaseHubEngine] Erro na requisição BaseHub: {e}")
            return {"error": str(e), "status": "failed"}

    def versionar_lead_schema(self, lead_data, generated_schema):
        """
        Salva e versiona os dados do lead e o schema gerado pela IA no BaseHub.
        """
        query = """
        mutation VersionarLead($slug: String!, $nome: String!, $categoria: String!, $schemaJson: String!) {
          saveLeadSchema(slug: $slug, nome: $nome, categoria: $categoria, schemaJson: $schemaJson) {
            id
            slug
            updatedAt
          }
        }
        """
        slug = lead_data.get("place_id") or lead_data.get("id") or "lead_demo"
        variables = {
            "slug": slug,
            "nome": lead_data.get("nome", "Empresa Exemplo"),
            "categoria": lead_data.get("categoria", "Geral"),
            "schemaJson": json.dumps(generated_schema, ensure_ascii=False)
        }

        print(f"[BaseHubEngine] Versionando schema do lead '{lead_data.get('nome')}' no BaseHub CMS...")
        resultado = self.executar_query_graphql(query, variables)
        return resultado

if __name__ == "__main__":
    hub = BaseHubEngine()
    test_lead = {"id": "lead_test_001", "nome": "Fogo Vivo Steakhouse", "categoria": "Restaurante"}
    test_schema = {"theme": "77lib_3d", "copy": "Experiência Gastronômica Real"}
    res = hub.versionar_lead_schema(test_lead, test_schema)
    print(json.dumps(res, indent=2, ensure_ascii=False))
