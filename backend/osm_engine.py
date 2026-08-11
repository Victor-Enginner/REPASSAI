"""
REPASS AI — FONTE DE LEADS GRATUITA (OpenStreetMap / Overpass)

Descobre negócios locais sem chave de API, sem cadastro e sem cartão.

POR QUE ISTO EXISTE
-------------------
A Google Places cobra (~US$ 17 / 1.000 chamadas) e exige cartão cadastrado
até para usar a cota gratuita. O OpenStreetMap é um mapa aberto: consultar
é livre.

A TROCA, MEDIDA E NÃO SUPOSTA — Franca/SP, agosto de 2026:

    OpenStreetMap        184 negócios, 171 sem site, 11 com telefone
    Google Places        ~119 por varredura, telefone em quase todos

Ou seja: o OSM acha MAIS negócios sem site, e quase nenhum com telefone.
Por isso ele é a camada de DESCOBERTA, e o Places entra só depois, num lead
por vez, quando o operador decide abordar. Descobrir é de graça; confirmar
o contato custa duas chamadas em vez de duzentas.

LIMITES REAIS DESTA FONTE
-------------------------
· Sem telefone na maioria dos registros. É o motivo de o Places continuar
  existindo no produto.
· Sem avaliação e sem nota. O OSM é cartografia, não rede de opinião — por
  isso a pontuação aqui não pode premiar "poucas avaliações": ausência de
  dado não é sinal de oportunidade.
· Cobertura desigual. Cidade grande é bem mapeada; distrito pequeno pode
  ter dez registros. A varredura não falha — devolve menos.
· A API pública é compartilhada e tem limite de uso. Erro de excesso é
  tratado como indisponibilidade temporária, com mensagem dizendo isso.
"""

import json
import time
import urllib.error
import urllib.parse
import urllib.request

# Espelhos da Overpass, tentados em ordem.
#
# São instâncias públicas independentes servindo o mesmo banco do OSM. Uma
# só não basta: a principal devolve HTTP 429 depois de poucas consultas
# seguidas — aconteceu três vezes só durante o desenvolvimento deste
# módulo. Com o operador rodando varreduras em sequência, aconteceria de
# novo, e a tela diria "OpenStreetMap ocupado" com o serviço no ar.
#
# A ordem é deliberada: a oficial primeiro (mais dados atualizados), os
# espelhos comunitários depois.
ESPELHOS_OVERPASS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]

# A Overpass devolve 406 sem User-Agent identificável. Não é capricho: o
# serviço é mantido por doação e pede que cada cliente se identifique.
USER_AGENT = "REPASS-AI/1.0 (prospeccao de negocios locais)"

TIMEOUT_CONSULTA = 90


class OSMIndisponivel(RuntimeError):
    """Falha ao consultar o OpenStreetMap."""


# ------------------------------------------------------------------
# NICHO (português) → ETIQUETAS DO OSM
#
# O OSM não tem "nicho": tem etiquetas padronizadas (`shop`, `amenity`,
# `craft`, `office`, `leisure`, `tourism`). Buscar pelo NOME do negócio não
# funciona — "Barbearia do Zé" está etiquetada como `shop=hairdresser`, e o
# nome é só um rótulo livre que pode ser qualquer coisa.
#
# Cada entrada é uma lista de seletores Overpass. Vários seletores por nicho
# porque a mesma atividade aparece etiquetada de formas diferentes conforme
# quem mapeou.
# ------------------------------------------------------------------
NICHO_PARA_OSM = {
    # --- Beleza e cuidados pessoais ---
    "barbearia": ['shop=hairdresser', 'craft=hairdresser'],
    "salao masculino": ['shop=hairdresser'],
    "cabeleireiro": ['shop=hairdresser'],
    "salao de unhas": ['shop=beauty'],
    "manicure": ['shop=beauty'],
    "estetica facial": ['shop=beauty'],
    "clinica de estetica": ['shop=beauty', 'shop=massage'],
    "design de sobrancelhas": ['shop=beauty'],
    "massoterapia": ['shop=massage'],
    "spa": ['leisure=spa', 'shop=massage'],
    "tatuagem": ['shop=tattoo'],

    # --- Alimentação ---
    "restaurante": ['amenity=restaurant'],
    "pizzaria": ['amenity=restaurant', 'amenity=fast_food'],
    "hamburgueria": ['amenity=fast_food'],
    "lanchonete": ['amenity=fast_food'],
    "acai": ['amenity=fast_food', 'amenity=ice_cream'],
    "sorveteria": ['amenity=ice_cream', 'shop=ice_cream'],
    "cafeteria": ['amenity=cafe'],
    "padaria": ['shop=bakery'],
    "confeitaria": ['shop=confectionery', 'shop=pastry'],
    "doceria": ['shop=confectionery'],
    "bar": ['amenity=bar', 'amenity=pub'],
    "marmitaria": ['amenity=fast_food'],
    "churrascaria": ['amenity=restaurant'],

    # --- Saúde ---
    "odontologia": ['amenity=dentist', 'healthcare=dentist'],
    "dentista": ['amenity=dentist', 'healthcare=dentist'],
    "clinica veterinaria": ['amenity=veterinary'],
    "veterinario": ['amenity=veterinary'],
    "farmacia": ['amenity=pharmacy'],
    "fisioterapia": ['healthcare=physiotherapist'],
    "psicologia": ['healthcare=psychotherapist'],
    "nutricionista": ['healthcare=nutrition_counselling'],

    # --- Serviços profissionais ---
    "advocacia": ['office=lawyer'],
    "contabilidade": ['office=accountant'],
    "imobiliaria": ['office=estate_agent'],
    "corretor de imoveis": ['office=estate_agent'],
    "arquitetura": ['office=architect'],
    "seguros": ['office=insurance'],

    # --- Comércio ---
    "pet shop": ['shop=pet', 'shop=pet_grooming'],
    "banho e tosa": ['shop=pet_grooming', 'shop=pet'],
    "loja de roupas": ['shop=clothes'],
    "moda feminina": ['shop=clothes'],
    "loja de calcados": ['shop=shoes'],
    "joalheria": ['shop=jewelry'],
    "otica": ['shop=optician'],
    "perfumaria": ['shop=perfumery', 'shop=cosmetics'],
    "floricultura": ['shop=florist'],
    "papelaria": ['shop=stationery'],
    "moveis planejados": ['shop=furniture'],
    "materiais de construcao": ['shop=doityourself', 'shop=hardware', 'shop=trade'],

    # --- Automotivo ---
    "oficina mecanica": ['shop=car_repair'],
    "auto center": ['shop=car_repair'],
    "autopecas": ['shop=car_parts'],
    "lava rapido": ['amenity=car_wash'],
    "borracharia": ['shop=tyres'],
    "funilaria": ['shop=car_repair'],

    # --- Serviços técnicos e obra ---
    "marcenaria": ['craft=carpenter'],
    "serralheria": ['craft=metal_construction', 'craft=blacksmith'],
    "vidracaria": ['craft=glaziery'],
    "eletricista": ['craft=electrician'],
    "encanador": ['craft=plumber'],
    "pintura predial": ['craft=painter'],
    "construtora": ['craft=builder', 'office=construction_company'],
    "reforma": ['craft=builder'],
    "chaveiro": ['craft=key_cutter', 'shop=locksmith'],

    # --- Educação, esporte, hospedagem ---
    "academia": ['leisure=fitness_centre'],
    "crossfit": ['leisure=fitness_centre'],
    "pilates": ['leisure=fitness_centre'],
    "autoescola": ['amenity=driving_school'],
    "escola de idiomas": ['amenity=language_school'],
    "escola de musica": ['amenity=music_school'],
    "pousada": ['tourism=guest_house', 'tourism=hotel'],
    "hotel": ['tourism=hotel'],

    # --- Criativos ---
    "fotografia": ['shop=photo', 'craft=photographer'],
    "fotografo": ['craft=photographer', 'shop=photo'],
}


def _sem_acento(texto):
    """Remove acento para casar nicho digitado com a chave do mapa."""
    tabela = str.maketrans("áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ",
                           "aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC")
    return (texto or "").translate(tabela).lower().strip()


def seletores_do_nicho(nicho):
    """
    Etiquetas do OSM para um nicho em português.

    Casamento por prefixo além do exato: "pizzaria delivery" cai em
    "pizzaria". Nicho desconhecido devolve lista vazia, e quem chama decide
    o que fazer — inventar uma etiqueta traria o negócio errado, que é pior
    do que não trazer nada.
    """
    chave = _sem_acento(nicho)
    if chave in NICHO_PARA_OSM:
        return NICHO_PARA_OSM[chave]

    for conhecido, seletores in NICHO_PARA_OSM.items():
        if chave.startswith(conhecido) or conhecido in chave:
            return seletores
    return []


def _montar_consulta(seletores, cidade, estado, limite):
    """
    Monta a consulta Overpass QL.

    A área é delimitada por ESTADO e depois por cidade dentro dele. Só pelo
    nome da cidade a consulta traria homônimos de outros estados — o Brasil
    tem várias "Franca", "Bom Jesus" e "Santa Maria", e o operador receberia
    leads de mil quilômetros de distância sem perceber.

    admin_level 4 = unidade federativa, 8 = município (padrão do OSM no BR).

    Busca `node` e `way`: comércio mapeado como ponto e como área de
    edifício. Sem os dois, metade do que existe fica de fora.
    """
    partes = []
    for sel in seletores:
        chave, valor = sel.split("=", 1)
        partes.append(f'node["{chave}"="{valor}"](area.cidade);')
        partes.append(f'way["{chave}"="{valor}"](area.cidade);')

    return (
        f'[out:json][timeout:{TIMEOUT_CONSULTA}];\n'
        f'area["name"="{estado}"]["admin_level"="4"]->.uf;\n'
        f'area["name"="{cidade}"]["admin_level"="8"](area.uf)->.cidade;\n'
        f'(\n{chr(10).join(partes)}\n);\n'
        f'out center tags {limite};'
    )


def _consultar(consulta):
    """
    Executa a consulta no primeiro espelho que responder.

    Só troca de espelho em falha de DISPONIBILIDADE (429, 504, rede). Erro
    de sintaxe na consulta (400) aborta na hora: repetir a mesma consulta
    quebrada em três servidores só triplica o tempo até o mesmo erro, e
    ainda gasta a cota de serviços mantidos por doação.
    """
    dados = urllib.parse.urlencode({"data": consulta}).encode("utf-8")
    ultima_falha = None

    for indice, url in enumerate(ESPELHOS_OVERPASS):
        req = urllib.request.Request(
            url, data=dados, headers={"User-Agent": USER_AGENT}
        )
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT_CONSULTA + 15) as resp:
                return json.loads(resp.read()).get("elements", [])

        except urllib.error.HTTPError as e:
            if e.code in (429, 504):
                ultima_falha = f"HTTP {e.code} (servidor ocupado)"
                # Respiro curto antes do próximo espelho. Sem isto, três
                # tentativas em sequência imediata parecem uma rajada e
                # tendem a ser recusadas pelo mesmo motivo.
                if indice < len(ESPELHOS_OVERPASS) - 1:
                    time.sleep(1.5)
                continue
            raise OSMIndisponivel(
                f"OpenStreetMap respondeu HTTP {e.code} — a consulta foi "
                f"recusada, e isso costuma ser defeito nosso na montagem dela."
            ) from e

        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as e:
            ultima_falha = str(e)
            if indice < len(ESPELHOS_OVERPASS) - 1:
                time.sleep(1.5)
            continue

    raise OSMIndisponivel(
        f"Os {len(ESPELHOS_OVERPASS)} servidores do OpenStreetMap estao ocupados "
        f"({ultima_falha}). Tente de novo em um minuto — a consulta e gratuita "
        f"e NAO houve cobranca."
    )


def buscar_nichos(nichos, cidade, estado, max_resultados=40):
    """
    Descobre negócios de VÁRIOS nichos numa cidade, numa consulta só.

    UMA consulta, não uma por nicho. Não é otimização: seis consultas
    seguidas ao servidor público devolvem HTTP 429 na terceira — medido. E
    esperar entre elas tornaria a varredura de seis nichos um processo de
    quase um minuto, para um dado que a Overpass entrega junto de qualquer
    jeito.

    A categoria de cada lead sai da etiqueta REAL do OSM, não do nicho
    pedido. É mais fiel: quem procurou "pizzaria" e recebeu um
    `amenity=restaurant` vê "Restaurant", que é o que o mapa afirma.

    Returns:
        Lista de dicts com: nome, categoria, endereco, telefone, site,
        lat, lon, osm_id. Campos ausentes vêm como None — NUNCA inventados.
        Um telefone sorteado pertence a alguém real.
    """
    if isinstance(nichos, str):
        nichos = [n.strip() for n in nichos.split(",") if n.strip()]

    seletores = []
    for nicho in nichos or []:
        for sel in seletores_do_nicho(nicho):
            if sel not in seletores:
                seletores.append(sel)

    if not seletores:
        return []

    elementos = _consultar(
        _montar_consulta(seletores, cidade, estado, max_resultados * 3)
    )

    achados = []
    vistos = set()

    for el in elementos:
        tags = el.get("tags") or {}
        nome = (tags.get("name") or "").strip()

        # Sem nome não é lead: não dá para abordar "shop=bakery" sem saber
        # de quem é. O OSM tem muito ponto anônimo mapeado.
        if not nome or nome.lower() in vistos:
            continue

        # Franquia de rede nacional não é cliente.
        #
        # A primeira varredura em Franca trouxe McDonald's, Burger King e
        # Habib's no topo — sem etiqueta `website`, então entravam como
        # "sem site". Mas a marca TEM site, e nenhum gerente de franquia
        # compra uma landing page de um vendedor local. Eram leads mortos
        # ocupando as primeiras posições.
        #
        # `brand:wikidata` separa os dois casos com precisão: as redes
        # carregam a etiqueta, os negócios locais não. Verificado nos dois
        # sentidos — McDonald's e Burger King têm; "Bunito's" e "Pastelaria
        # 9 de Julho", que são de Franca, não têm.
        if tags.get("brand:wikidata") or tags.get("brand"):
            continue

        vistos.add(nome.lower())

        centro = el.get("center") or {}

        achados.append({
            "osm_id": f"{el.get('type')}/{el.get('id')}",
            "nome": nome,
            "categoria": _rotulo_da_categoria(tags) or "Negocio local",
            "endereco": _montar_endereco(tags, cidade, estado),
            "telefone": tags.get("phone") or tags.get("contact:phone"),
            "site": tags.get("website") or tags.get("contact:website"),
            "lat": el.get("lat") or centro.get("lat"),
            "lon": el.get("lon") or centro.get("lon"),
        })

        if len(achados) >= max_resultados:
            break

    return achados


def _rotulo_da_categoria(tags):
    """Rótulo legível a partir da etiqueta do OSM."""
    for chave in ("shop", "amenity", "craft", "office", "leisure", "tourism", "healthcare"):
        valor = tags.get(chave)
        if valor:
            return valor.replace("_", " ").title()
    return None


def _montar_endereco(tags, cidade, estado):
    """
    Endereço a partir das etiquetas `addr:*`.

    Devolve None quando não há rua — melhor campo vazio do que um endereço
    pela metade que o operador confundiria com o real. Cidade e estado
    entram só como complemento de um logradouro existente.
    """
    rua = tags.get("addr:street")
    if not rua:
        return None

    numero = tags.get("addr:housenumber")
    bairro = tags.get("addr:suburb") or tags.get("addr:neighbourhood")

    partes = [f"{rua}, {numero}" if numero else rua]
    if bairro:
        partes.append(bairro)
    partes.append(f"{cidade} - {estado}")
    return " - ".join(partes)
