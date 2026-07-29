# -*- coding: utf-8 -*-
"""
REPASSAI — Regras Determinísticas de Categorização de Nicho (Camada 4).
"""

MAPA_NICHOS = {
    # Alimentação & Gastronomia
    "restaurante": "gastronomia",
    "pizzaria": "gastronomia",
    "hamburgueria": "gastronomia",
    "lanchonete": "gastronomia",
    "padaria": "gastronomia",
    "cafeteria": "gastronomia",
    "steakhouse": "gastronomia",
    "bar": "gastronomia",

    # Beleza & Estética
    "barbearia": "estetica_masculina",
    "salão de unhas": "estetica_feminina",
    "salão de beleza": "estetica_feminina",
    "estética": "estetica_feminina",
    "estetica": "estetica_feminina",
    "spa": "estetica_feminina",

    # Saúde & Bem-estar
    "odontológico": "saude",
    "odontologico": "saude",
    "odontologia": "saude",
    "dentista": "saude",
    "clínica": "saude",
    "clinica": "saude",
    "medicina": "saude",
    "fisioterapia": "saude",
    "academia": "fitness",
    "crossfit": "fitness",

    # Serviços Profissionais
    "advocacia": "profissional",
    "advogado": "profissional",
    "contabilidade": "profissional",
    "imobiliária": "imob",
    "imobiliaria": "imob",
    "corretor": "imob",

    # Serviços Gerais & Pet
    "petshop": "pet",
    "veterinária": "pet",
    "veterinaria": "pet",
    "oficina": "automotivo",
    "auto center": "automotivo",
}

def categorizar_nicho(categoria_raw: str) -> dict:
    """
    Categoriza deterministicamente a string de entrada para uma chave de nicho padronizada.
    Retorna objeto com chave_nicho, template_sugerido e status de confiança.
    """
    texto = (categoria_raw or "").lower().strip()
    
    # Ordena os termos por tamanho decrescente para que termos mais específicos (ex: barbearia) venham antes de termos curtos (ex: bar)
    termos_ordenados = sorted(MAPA_NICHOS.keys(), key=len, reverse=True)

    for termo in termos_ordenados:
        if termo in texto:
            return {
                "nicho_chave": MAPA_NICHOS[termo],
                "categoria_normalizada": termo.title(),
                "confianca": 1.0,
                "metodo": "regra_exata"
            }
            
    return {
        "nicho_chave": "geral",
        "categoria_normalizada": texto.title() if texto else "Geral",
        "confianca": 0.5,
        "metodo": "fallback_geral"
    }
