# -*- coding: utf-8 -*-
"""
REPASS AI - Cliente Supabase (auth + banco) usando só a biblioteca padrão.

O PostgREST do Supabase é REST puro, então não precisamos do SDK oficial —
`urllib` resolve. Isso mantém o backend sem dependência nova e sem risco de
conflito de versão.

MODELO DE SEGURANÇA
-------------------
- O NAVEGADOR autentica direto no Supabase e recebe um JWT.
- O JWT viaja para esta API no header `Authorization: Bearer <token>`.
- Aqui o token é validado contra o `/auth/v1/user` do Supabase.
- Toda leitura/escrita no banco usa a SERVICE_ROLE, que fica só no
  servidor, e SEMPRE filtrando por `user_id`.

Por que não deixar o navegador escrever direto no banco: a chave anon é
pública por natureza. Com RLS bloqueando anon/authenticated (ver
supabase/schema.sql), mesmo que ela vaze ninguém acessa dado de ninguém.

DEGRADAÇÃO ELEGANTE
-------------------
Sem `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` no .env, `configurado()`
devolve False e a aplicação roda exatamente como antes — single-user, sem
login. Isso permite subir o código sem quebrar o fluxo atual.
"""

import os
import json
import time
import urllib.error
import urllib.parse
import urllib.request

TIMEOUT = 20

# Cache de validação de token: o /auth/v1/user é uma chamada de rede a cada
# requisição. 60s de cache corta isso sem atrasar logout de forma perceptível.
_CACHE_TOKENS = {}
_CACHE_TTL = 60


class SupabaseIndisponivel(Exception):
    """Supabase não configurado ou fora do ar."""


def url_base():
    return os.environ.get("SUPABASE_URL", "").strip().rstrip("/")


def service_key():
    # Projetos novos do Supabase usam `sb_secret_...`; projetos antigos ainda
    # exibem a JWT `service_role`. Ambas são exclusivas do backend.
    return (
        os.environ.get("SUPABASE_SECRET_KEY", "").strip()
        or os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    )


def anon_key():
    # `sb_publishable_...` substitui gradualmente a antiga JWT `anon`.
    return (
        os.environ.get("SUPABASE_PUBLISHABLE_KEY", "").strip()
        or os.environ.get("SUPABASE_ANON_KEY", "").strip()
    )


def configurado():
    """True se há URL e service_role para falar com o banco."""
    return bool(url_base() and service_key())


def auth_configurado():
    """
    True se o modo multiusuário está ligado.

    Precisa da chave anon também: é ela que o frontend usa para o login.
    """
    return bool(url_base() and anon_key() and service_key())


def _requisicao(metodo, caminho, dados=None, headers=None, timeout=TIMEOUT):
    """Executa uma chamada REST e devolve o JSON (ou None em 204)."""
    if not url_base():
        raise SupabaseIndisponivel("SUPABASE_URL não configurada.")

    url = f"{url_base()}{caminho}"
    corpo = json.dumps(dados).encode("utf-8") if dados is not None else None

    cabecalhos = {
        "Content-Type": "application/json",
        "User-Agent": "REPASS-AI/1.0",
    }
    cabecalhos.update(headers or {})

    req = urllib.request.Request(url, data=corpo, headers=cabecalhos, method=metodo)

    try:
        with urllib.request.urlopen(req, timeout=timeout) as res:
            bruto = res.read()
            if not bruto:
                return None
            return json.loads(bruto.decode("utf-8"))
    except urllib.error.HTTPError as e:
        detalhe = ""
        try:
            detalhe = e.read().decode("utf-8")[:300]
        except Exception:
            pass
        raise SupabaseIndisponivel(f"HTTP {e.code} em {caminho}: {detalhe}")
    except Exception as e:
        raise SupabaseIndisponivel(f"Falha de rede em {caminho}: {e}")


# --- Autenticação ---------------------------------------------------------

def extrair_token(header_authorization):
    """Extrai o JWT de um header `Authorization: Bearer <token>`."""
    if not header_authorization:
        return ""
    partes = header_authorization.split(None, 1)
    if len(partes) == 2 and partes[0].lower() == "bearer":
        return partes[1].strip()
    return ""


def usuario_do_token(token):
    """
    Valida o JWT no Supabase e devolve o usuário.

    Returns:
        dict com `id` e `email`, ou None se o token for inválido/expirado.
    """
    if not token or not auth_configurado():
        return None

    agora = time.time()
    em_cache = _CACHE_TOKENS.get(token)
    if em_cache and em_cache[0] > agora:
        return em_cache[1]

    try:
        dados = _requisicao(
            "GET",
            "/auth/v1/user",
            headers={
                "apikey": anon_key(),
                "Authorization": f"Bearer {token}",
            },
            timeout=10,
        )
    except SupabaseIndisponivel:
        return None

    if not dados or not dados.get("id"):
        return None

    usuario = {"id": dados["id"], "email": dados.get("email", "")}
    _CACHE_TOKENS[token] = (agora + _CACHE_TTL, usuario)

    # Evita crescer sem limite se muitos tokens passarem por aqui.
    if len(_CACHE_TOKENS) > 500:
        for chave in [k for k, v in _CACHE_TOKENS.items() if v[0] <= agora]:
            _CACHE_TOKENS.pop(chave, None)

    return usuario


# --- Banco (PostgREST) ----------------------------------------------------

def _headers_servico(extra=None):
    """Headers com service_role. NUNCA devem chegar ao navegador."""
    chave = service_key()
    h = {"apikey": chave}

    # As novas chaves `sb_secret_...` não são JWTs. Enviá-las como Bearer faz
    # o PostgREST tentar decodificá-las como JWT e responder 401. A antiga
    # `service_role`, por outro lado, continua precisando do Authorization.
    if not chave.startswith("sb_secret_"):
        h["Authorization"] = f"Bearer {chave}"

    h.update(extra or {})
    return h


def selecionar(tabela, filtros=None, colunas="*", ordem=None, limite=None):
    """
    SELECT via PostgREST.

    Args:
        tabela: nome da tabela
        filtros: dict {coluna: valor} (igualdade) ou {coluna: 'op.valor'}
        colunas: lista de colunas
        ordem: ex. "score_oportunidade.desc"
        limite: int

    Returns:
        lista de dicts
    """
    params = {"select": colunas}
    for coluna, valor in (filtros or {}).items():
        params[coluna] = valor if "." in str(valor) else f"eq.{valor}"
    if ordem:
        params["order"] = ordem
    if limite:
        params["limit"] = str(limite)

    caminho = f"/rest/v1/{tabela}?{urllib.parse.urlencode(params)}"
    return _requisicao("GET", caminho, headers=_headers_servico()) or []


def inserir(tabela, registros, upsert_em=None):
    """
    INSERT (ou UPSERT) via PostgREST.

    Args:
        upsert_em: colunas do índice de conflito, ex. "user_id,place_id".
                   Quando informado, registro existente é atualizado.
    """
    prefer = "return=representation"
    caminho = f"/rest/v1/{tabela}"

    if upsert_em:
        prefer += ",resolution=merge-duplicates"
        caminho += f"?on_conflict={urllib.parse.quote(upsert_em)}"

    lista = registros if isinstance(registros, list) else [registros]
    return _requisicao(
        "POST", caminho, dados=lista, headers=_headers_servico({"Prefer": prefer})
    ) or []


def atualizar(tabela, filtros, valores):
    """UPDATE via PostgREST. `filtros` é obrigatório para não varrer a tabela."""
    if not filtros:
        raise ValueError("atualizar() exige filtros — sem eles o UPDATE afeta tudo.")

    params = {}
    for coluna, valor in filtros.items():
        params[coluna] = valor if "." in str(valor) else f"eq.{valor}"

    caminho = f"/rest/v1/{tabela}?{urllib.parse.urlencode(params)}"
    return _requisicao(
        "PATCH", caminho, dados=valores,
        headers=_headers_servico({"Prefer": "return=representation"})
    ) or []


# --- Perfis e cota --------------------------------------------------------

PLANO_PADRAO = {"plano": "beta", "varreduras_limite": 10, "sites_limite": 5}


def obter_ou_criar_perfil(user_id, email):
    """
    Busca o perfil do usuário, criando na primeira vez.

    Renova a cota quando o mês vira — comparando o mês de `ciclo_inicio`
    com o mês atual.
    """
    existentes = selecionar("perfis", {"user_id": user_id}, limite=1)

    if not existentes:
        novo = {
            "user_id": user_id,
            "email": email,
            **PLANO_PADRAO,
            "varreduras_usadas": 0,
            "sites_usados": 0,
            "ciclo_inicio": time.strftime("%Y-%m-%d"),
        }
        criados = inserir("perfis", novo)
        return criados[0] if criados else novo

    perfil = existentes[0]

    ciclo_mes = (perfil.get("ciclo_inicio") or "")[:7]
    mes_atual = time.strftime("%Y-%m")

    if ciclo_mes != mes_atual:
        renovados = atualizar("perfis", {"user_id": user_id}, {
            "varreduras_usadas": 0,
            "sites_usados": 0,
            "ciclo_inicio": time.strftime("%Y-%m-%d"),
        })
        return renovados[0] if renovados else perfil

    return perfil


def consumir_varredura(user_id):
    """Incrementa o contador de varreduras do ciclo."""
    atuais = selecionar("perfis", {"user_id": user_id}, colunas="varreduras_usadas", limite=1)
    usadas = (atuais[0].get("varreduras_usadas") if atuais else 0) or 0
    atualizar("perfis", {"user_id": user_id}, {"varreduras_usadas": usadas + 1})


def consumir_site(user_id):
    """Incrementa o contador de sites gerados no ciclo."""
    atuais = selecionar("perfis", {"user_id": user_id}, colunas="sites_usados", limite=1)
    usados = (atuais[0].get("sites_usados") if atuais else 0) or 0
    atualizar("perfis", {"user_id": user_id}, {"sites_usados": usados + 1})


def status():
    """Estado da integração, para o painel. Não expõe chave nenhuma."""
    projeto_configurado = bool(url_base() and anon_key())
    backend_configurado = configurado()
    return {
        "configurado": backend_configurado,
        "projeto_configurado": projeto_configurado,
        "backend_configurado": backend_configurado,
        "auth_ativo": auth_configurado(),
        "modo": "multiusuario" if auth_configurado() else "single_user",
        "motivo": (
            None
            if auth_configurado()
            else "chave_secreta_ausente"
            if projeto_configurado
            else "projeto_supabase_incompleto"
        ),
    }
