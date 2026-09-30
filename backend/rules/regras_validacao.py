# -*- coding: utf-8 -*-
"""
REPASSAI — Regras Determinísticas de Validação e Sanitização de Dados (Camada 2).
"""

import re

def sanitizar_telefone(telefone: str | None) -> str | None:
    """
    Sanitiza telefone para formato brasileiro (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.
    Retorna None se inválido ou fictício.
    """
    if not telefone:
        return None
    digitos = re.sub(r'\D', '', str(telefone))
    if digitos.startswith('55') and len(digitos) in (12, 13):
        digitos = digitos[2:]
    if len(digitos) == 11:
        return f"({digitos[:2]}) {digitos[2]} {digitos[3:7]}-{digitos[7:]}"
    elif len(digitos) == 10:
        return f"({digitos[:2]}) {digitos[2:6]}-{digitos[6:]}"
    return None

def gerar_whatsapp_url(telefone: str | None) -> str | None:
    """
    Gera link limpo do WhatsApp wa.me/55... apenas para telefones válidos com DDD.
    """
    if not telefone:
        return None
    digitos = re.sub(r'\D', '', str(telefone))
    if digitos.startswith('55') and len(digitos) in (12, 13):
        digitos = digitos[2:]
    if len(digitos) in (10, 11):
        return f"https://wa.me/55{digitos}"
    return None

def sanitizar_lead_dados(lead_raw: dict) -> dict:
    """
    Sanitiza e aplica fallbacks determinísticos a um objeto de lead.
    """
    nome = str(lead_raw.get('nome') or lead_raw.get('title') or 'Seu Negócio').strip()
    cidade = str(lead_raw.get('cidade') or 'sua região').strip()
    estado = str(lead_raw.get('estado') or 'SP').strip()
    categoria = str(lead_raw.get('categoria') or lead_raw.get('nicho') or 'Geral').strip()
    endereco = str(lead_raw.get('endereco') or lead_raw.get('address') or f"Centro, {cidade} - {estado}").strip()
    
    telefone_bruto = lead_raw.get('telefone') or lead_raw.get('phone')
    telefone_sanitizado = sanitizar_telefone(telefone_bruto)
    whatsapp_url = lead_raw.get('whatsapp') or gerar_whatsapp_url(telefone_sanitizado)

    avaliacao = lead_raw.get('avaliacao') or lead_raw.get('rating')
    try:
        avaliacao_num = float(avaliacao) if avaliacao is not None else None
    except (ValueError, TypeError):
        avaliacao_num = None

    reviews_count = lead_raw.get('reviewsCount') or lead_raw.get('user_ratings_total') or 0

    return {
        "id": lead_raw.get('id') or f"lead_{hash(nome) & 0xffffff}",
        "nome": nome.title(),
        "cidade": cidade.title(),
        "estado": estado.upper(),
        "categoria": categoria.title(),
        "endereco": endereco,
        "telefone": telefone_sanitizado,
        "whatsapp": whatsapp_url,
        "avaliacao": avaliacao_num,
        "reviewsCount": reviews_count,
        "is_demo": bool(lead_raw.get('is_demo', False)),
        "status_site": lead_raw.get('status_site', 'sem_site')
    }
