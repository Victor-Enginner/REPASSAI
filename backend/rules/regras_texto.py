# -*- coding: utf-8 -*-
"""
REPASSAI — Regras Determinísticas de Copywriting e Geração de Texto (Camada 3).
"""

def gerar_titulo_hero(lead: dict) -> str:
    nome = lead.get('nome', 'Seu Negócio')
    nicho = lead.get('nicho_chave', 'geral')
    
    if nicho == 'gastronomia':
        return f"Experiência Gastronômica Inesquecível na {nome}"
    elif nicho == 'estetica_masculina':
        return f"Estilo, Tradição e Respeito ao Seu Visual na {nome}"
    elif nicho == 'estetica_feminina':
        return f"Realce Sua Beleza Natural e Autoestima na {nome}"
    elif nicho == 'saude':
        return f"Atendimento Humanizado e Saúde em Primeiro Lugar na {nome}"
    elif nicho == 'fitness':
        return f"Transforme Seu Corpo e Energia na {nome}"
    elif nicho == 'pet':
        return f"Carinho, Segurança e Cuidado Completo para o Seu Pet na {nome}"
    elif nicho == 'profissional':
        return f"Soluções Jurídicas e Estratégicas com Excelência na {nome}"
    elif nicho == 'automotivo':
        return f"Manutenção Automotiva de Confiança e Alta Precisão na {nome}"
    
    return f"Bem-vindo à {nome} — Excelência e Qualidade em {lead.get('cidade', 'Sua Região')}"

def gerar_subtitulo_hero(lead: dict) -> str:
    cidade = lead.get('cidade', 'sua cidade')
    avaliacao = lead.get('avaliacao')
    reviews = lead.get('reviewsCount', 0)
    
    if avaliacao and reviews:
        return f"Referência em atendimento no coração de {cidade}. Avaliação {avaliacao}★ no Google ({reviews} clientes satisfeitos)."
    return f"Especialistas comprometidos com a melhor experiência para você em {cidade}."

def gerar_descricao_negocio(lead: dict) -> str:
    nome = lead.get('nome', 'Nossa empresa')
    categoria = lead.get('categoria', 'negócio')
    cidade = lead.get('cidade', 'sua cidade')
    
    return (
        f"A {nome} é destaque no segmento de {categoria} em {cidade}. "
        f"Oferecemos infraestrutura moderna, profissionais qualificados e um compromisso inabalável com a satisfação de nossos clientes."
    )

def gerar_cta_texto(lead: dict) -> str:
    nicho = lead.get('nicho_chave', 'geral')
    if nicho in ('gastronomia', 'estetica_masculina', 'estetica_feminina', 'saude'):
        return "Agende Seu Horário no WhatsApp"
    elif nicho == 'fitness':
        return "Garanta Sua Aula Experimental"
    elif nicho == 'pet':
        return "Fale Conosco pelo WhatsApp"
    return "Entrar em Contato Agora"

def gerar_diferenciais(lead: dict) -> list[dict]:
    return [
        {
            "titulo": "Atendimento VIP",
            "descricao": "Equipe altamente treinada para proporcionar a melhor experiência do início ao fim."
        },
        {
            "titulo": "Localização Privilegiada",
            "descricao": f"Fácil acesso no endereço {lead.get('endereco', 'central')} com todo conforto."
        },
        {
            "titulo": "Garantia de Qualidade",
            "descricao": "Processos alinhados aos mais altos padrões para entregar resultados impecáveis."
        }
    ]
