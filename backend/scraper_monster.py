# -*- coding: utf-8 -*-
"""
REPASS AI - MÓDULO LEADS_OSINT_02.

Varredura de leads locais com dados REAIS da Google Places API e pipeline
de enriquecimento de mídia (fotos do Google Business com fallback).

GARANTIA DE INTEGRIDADE DE DADOS
--------------------------------
Este módulo não fabrica dado de contato em nenhuma hipótese.
Telefone, site, nota e quantidade de avaliações vêm exclusivamente da
Places API. Quando um campo não existe, ele vai como `None` e a UI mostra
ausência.

Sem `GOOGLE_PLACES_API_KEY` configurada, a varredura entra em MODO DEMO:
devolve exemplos de layout com `is_demo: True` e `telefone: None`. Leads
de demo são bloqueados para disparo comercial no frontend.
"""

import os
import sys
import json
import time
import re
import urllib.parse
import urllib.request

import places_engine
from places_engine import PlacesIndisponivel

# Força codificação UTF-8 no Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


def base_publica():
    """
    URL pública do backend, usada para montar links do proxy de mídia.

    Precisa ser configurável: gravar `http://localhost:8000` dentro do
    lead quebra todas as imagens assim que o app sai da máquina do dev.
    """
    return os.environ.get("PUBLIC_BASE_URL", "http://localhost:8000").rstrip("/")


class GooglePlacesMediaEnricher:
    """Enriquecimento de mídia via Google Places com fallback por nicho."""

    NICHO_FALLBACK_IMAGES = {
        'barbearia': [
            'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&auto=format&fit=crop&q=80'
        ],
        'hamburgueria': [
            'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800&auto=format&fit=crop&q=80'
        ],
        'restaurante': [
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80'
        ],
        'salão de unhas': [
            'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80'
        ],
        'estética facial': [
            'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1512290900673-7002fe5cd6a7?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80'
        ],
        'padrao': [
            'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80'
        ]
    }

    def _fallback(self, company_name, city, nicho_clean, motivo):
        """Monta o pacote de mídia de fallback por nicho."""
        lista = self.NICHO_FALLBACK_IMAGES.get(
            nicho_clean, self.NICHO_FALLBACK_IMAGES['padrao']
        )
        return {
            "companyName": company_name,
            "location": city,
            "isRealMedia": False,
            "motivo": motivo,
            "designSystem": {
                "theme": "dark_modern",
                "heroBackground": lista[0],
                "gallery": lista[1:]
            }
        }

    def obter_midias_empresa(self, company_name, city, nicho="barbearia", place_id=None, photos_data=None):
        """
        Busca fotos reais do perfil Google Business.
        Reaproveita o array `photos_data` já vindo do Place Details para economia de API.
        """
        nicho_clean = (nicho or 'padrao').lower().strip()

        if photos_data and len(photos_data) > 0:
            base = base_publica()
            proxy_photos = [
                f"{base}/api/media/proxy?ref={urllib.parse.quote(p.get('photo_reference', ''))}"
                for p in photos_data[:10]
            ]
            return {
                "companyName": company_name,
                "location": city,
                "isRealMedia": True,
                "motivo": "google_business_real",
                "designSystem": {
                    "theme": "google_business_real",
                    "heroBackground": proxy_photos[0],
                    "gallery": proxy_photos[1:] if len(proxy_photos) > 1 else [proxy_photos[0]]
                }
            }

        if not places_engine.places_configurado():
            return self._fallback(
                company_name, city, nicho_clean, "sem_api_key"
            )

        try:
            if not place_id:
                return self._fallback(
                    company_name, city, nicho_clean, "sem_place_id"
                )

            url = (
                f"{places_engine.PLACES_BASE}/details/json?place_id={place_id}"
                f"&fields=photos&language=pt-BR&key={places_engine.api_key()}"
            )
            data = places_engine._get_json(url, timeout=8)
            photos = data.get('result', {}).get('photos', [])
            if not photos:
                return self._fallback(
                    company_name, city, nicho_clean, "perfil_sem_fotos"
                )

            base = base_publica()
            proxy_photos = [
                f"{base}/api/media/proxy?ref={urllib.parse.quote(p.get('photo_reference', ''))}"
                for p in photos[:10]
            ]
            return {
                "companyName": company_name,
                "location": city,
                "isRealMedia": True,
                "motivo": "google_business",
                "designSystem": {
                    "theme": "google_business_real",
                    "heroBackground": proxy_photos[0],
                    "gallery": proxy_photos[1:] if len(proxy_photos) > 1 else [proxy_photos[0]]
                }
            }
        except Exception as e:
            return self._fallback(
                company_name, city, nicho_clean, f"erro_api_{e}"
            )


class NicheFilter:
    """Normaliza e limita a lista de nichos ativos por varredura."""

    MAX_NICHOS = 6
    MAX_CHARS = 80

    def processar_nichos(self, nichos_raw):
        """Aceita string separada por vírgula ou lista. Deduplica e limita."""
        if isinstance(nichos_raw, str):
            lista = [n.strip().lower() for n in nichos_raw.split(',')]
        else:
            lista = [str(n).strip().lower() for n in (nichos_raw or [])]

        vistos = []
        for n in lista:
            if n and len(n) <= self.MAX_CHARS and n not in vistos:
                vistos.append(n)
        return vistos[:self.MAX_NICHOS]


class LeadParser:
    """Normalização de dados de contato REAIS. Nunca gera dado."""

    @staticmethod
    def gerar_link_whatsapp(telefone_raw):
        """
        Converte um telefone real em link wa.me.

        Retorna None se o telefone não existir ou não tiver quantidade de
        dígitos compatível com número brasileiro (10 = fixo, 11 = móvel).
        Melhor não oferecer botão do que oferecer um link quebrado.
        """
        if not telefone_raw:
            return None

        digitos = re.sub(r'\D', '', telefone_raw)
        if digitos.startswith('55'):
            digitos = digitos[2:]
        if len(digitos) not in (10, 11):
            return None
        return f"https://wa.me/55{digitos}"


class KPIEngine:
    """Calcula métricas de funil (conversão, abordagem, agendamento, perda)."""

    @staticmethod
    def calcular_kpis(total_leads, abordados=0, agendados=0, follow_up=0,
                      perdidos=0, convertidos=0):
        """Retorna as taxas do funil em porcentagem, protegido contra /0."""
        if total_leads <= 0:
            return {
                "conversion_rate": 0.0, "approach_rate": 0.0,
                "booking_rate": 0.0, "followup_rate": 0.0, "loss_rate": 0.0
            }

        def pct(num, den):
            return round((num / den) * 100, 1) if den > 0 else 0.0

        return {
            "conversion_rate": pct(convertidos, total_leads),
            "approach_rate": pct(abordados, total_leads),
            "booking_rate": pct(agendados, abordados),
            "followup_rate": pct(follow_up, abordados),
            "loss_rate": pct(perdidos, abordados),
        }


# Exemplos de layout do MODO DEMO. Nomes genéricos e sem telefone, de
# propósito: servem para conferir a UI, não para prospectar.
DEMO_POR_NICHO = {
    'salão de unhas': ['Studio Bella Nails', 'Esmalteria VIP'],
    'barbearia': ['Imperial Cut Barbers', 'Dom Barba'],
    'hamburgueria': ['Kraft Burger Artesanal', 'Smash & Co.'],
    'estética facial': ['Clínica Glow Estética', 'DermoSkin Studio'],
    'pet shop': ['Pet Care & Cia', 'AuAu Banho e Tosa'],
    'academia': ['FitLife Academia', 'CrossBox Training'],
    'odontologia': ['Odonto VIP Riso', 'Oral Care'],
    'oficina mecânica': ['Auto Center Precision', 'Mecânica MotorTech'],
    'pizzaria': ['Pizzaria Bella Napoli', 'Forno & Lenha'],
    'imobiliária': ['Imobiliária Prime', 'Corretora Solidez'],
}


class OSINTCore:
    """Orquestrador do módulo LEADS_OSINT_02."""

    # A Places API pede espaçamento entre chamadas de Details.
    DELAY_ENTRE_DETALHES = 0.15

    def __init__(self):
        self.niche_filter = NicheFilter()
        self.media_enricher = GooglePlacesMediaEnricher()

    def _montar_lead(self, detalhes, nicho, cidade, estado, bairro, idx):
        """Constrói o objeto de lead a partir de detalhes REAIS do Places."""
        score, motivo = places_engine.score_oportunidade(detalhes)
        mensagem = places_engine.gerar_mensagem(detalhes, motivo, cidade, nicho)

        telefone = detalhes.get("formatted_phone_number")
        site = detalhes.get("website")
        whatsapp = LeadParser.gerar_link_whatsapp(telefone)

        media = self.media_enricher.obter_midias_empresa(
            detalhes.get("name", ""), cidade, nicho,
            place_id=detalhes.get("place_id"),
            photos_data=detalhes.get("photos")
        )

        geometry = (detalhes.get("geometry") or {}).get("location") or {}

        return {
            "id": detalhes.get("place_id"),
            "lead_id": detalhes.get("place_id"),
            "place_id": detalhes.get("place_id"),
            "is_demo": False,
            "nome": detalhes.get("name"),
            "categoria": nicho.title(),
            "cidade": cidade,
            "estado": estado,
            "bairro": bairro or "",
            "endereco": detalhes.get("formatted_address"),
            "telefone": telefone,
            "whatsapp": whatsapp,
            "site": site,
            "status_site": "sem_site" if not site else "tem_site",
            "score": score,
            "osint_score": score,
            "motivo_abordagem": motivo,
            "avaliacao": detalhes.get("rating"),
            "reviewsCount": detalhes.get("user_ratings_total"),
            "temperatura": "Quente" if score >= 70 else "Morno",
            "status_crm": "Base",
            "status_pipeline": "NOVO",
            "orientacao": places_engine.OPORTUNIDADE.get(motivo, ""),
            "mensagem_sugerida": mensagem,
            "mediaEnrichment": media,
            "geo": {
                "pais": "BR", "estado": estado, "cidade": cidade,
                "bairro": bairro or "",
                "lat": geometry.get("lat"), "lon": geometry.get("lng"),
            },
        }

    def _montar_demo(self, nome, nicho, cidade, estado, idx):
        """
        Lead de demonstração de layout.

        `telefone`/`whatsapp`/`avaliacao` ficam nulos de propósito: nunca
        apresentamos contato inventado como se fosse resultado de varredura.
        """
        media = self.media_enricher.obter_midias_empresa(nome, cidade, nicho)
        return {
            "id": f"DEMO_{estado}_{idx:03d}",
            "lead_id": f"DEMO_{estado}_{idx:03d}",
            "place_id": None,
            "is_demo": True,
            "nome": nome,
            "categoria": nicho.title(),
            "cidade": cidade,
            "estado": estado,
            "bairro": "",
            "endereco": None,
            "telefone": None,
            "whatsapp": None,
            "site": None,
            "status_site": "desconhecido",
            "score": 0,
            "osint_score": 0,
            "motivo_abordagem": "demo",
            "avaliacao": None,
            "reviewsCount": None,
            "temperatura": "Demo",
            "status_crm": "Base",
            "status_pipeline": "DEMO",
            "orientacao": "Exemplo de layout. Configure a GOOGLE_PLACES_API_KEY para varrer leads reais.",
            "mensagem_sugerida": None,
            "mediaEnrichment": media,
            "geo": {"pais": "BR", "estado": estado, "cidade": cidade,
                    "bairro": "", "lat": None, "lon": None},
        }

    def executar_varredura(self, estado="SP", cidade="Franca", bairro="",
                           nichos="barbearia, hamburgueria", max_results=40):
        """
        Executa a varredura e devolve (leads, meta).

        `meta` informa se o resultado é real ou demo e por quê, para a UI
        poder deixar isso explícito ao operador.
        """
        nichos_ativos = self.niche_filter.processar_nichos(nichos) or ['barbearia']
        local = f"{bairro}, {cidade}, {estado}" if bairro else f"{cidade}, {estado}"

        if not places_engine.places_configurado():
            print("[OSINTCore] Sem GOOGLE_PLACES_API_KEY. Entrando em MODO DEMO.")
            leads, idx = [], 1
            for nicho in nichos_ativos:
                for nome in DEMO_POR_NICHO.get(nicho, [f"{nicho.title()} Exemplo"]):
                    leads.append(self._montar_demo(nome, nicho, cidade, estado, idx))
                    idx += 1
            return leads[:max_results], {
                "modo": "demo",
                "motivo": "GOOGLE_PLACES_API_KEY não configurada em backend/.env",
                "dados_reais": False,
            }

        print(f"[OSINTCore] Varredura REAL em '{local}' | nichos: {nichos_ativos}")

        leads, erros = [], []
        por_nicho = max(1, max_results // len(nichos_ativos))
        vistos = set()

        for nicho in nichos_ativos:
            try:
                resultados = places_engine.buscar_nicho(nicho, local, por_nicho)
                print(f"[OSINTCore] '{nicho}': {len(resultados)} lugares encontrados.")
            except PlacesIndisponivel as e:
                erros.append(f"nicho '{nicho}': {e}")
                print(f"[OSINTCore] Falha ao buscar '{nicho}': {e}")
                continue

            for idx, r in enumerate(resultados, start=1):
                pid = r.get("place_id")
                if not pid or pid in vistos:
                    continue
                vistos.add(pid)
                try:
                    detalhes = places_engine.detalhes_do_lugar(pid)
                    if places_engine.negocio_encerrado(detalhes.get("business_status")):
                        continue
                    leads.append(self._montar_lead(
                        detalhes, nicho, cidade, estado, bairro, idx
                    ))
                    time.sleep(self.DELAY_ENTRE_DETALHES)
                except Exception as e:
                    erros.append(f"place_id {pid}: {e}")

        leads.sort(key=lambda x: x.get("score") or 0, reverse=True)
        print(f"[OSINTCore] Varredura concluída: {len(leads)} leads reais.")

        return leads[:max_results], {
            "modo": "real",
            "dados_reais": True,
            "erros": erros,
            "nichos_varridos": nichos_ativos,
        }


if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    core = OSINTCore()
    res, meta = core.executar_varredura(
        "SP", "Franca", nichos="barbearia, hamburgueria", max_results=6
    )
    print(json.dumps({"meta": meta, "leads": res}, indent=2, ensure_ascii=False))
