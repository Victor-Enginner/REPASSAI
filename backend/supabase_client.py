# -*- coding: utf-8 -*-
"""
REPASS AI - Cliente Supabase (auth + banco) usando só a biblioteca padrão.

O PostgREST do Supabase é REST puro, então não precisamos do SDK oficial —
`urllib` resolve. Isso mantém o backend sem dependência nova e sem risco de
conflito de versão.

MODELO DE SEGURANÇA
-------------------
- O NAVEGADOR autentica via BFF (`/api/auth/login` etc.).
- JWT fica em cookie HttpOnly (`repass_at` / `repass_rt`) — JS não lê.
- Em cada request a API lê o cookie (ou Bearer legado p/ testes/CLI).
- Token é validado contra o `/auth/v1/user` do Supabase.
- Toda leitura/escrita no banco usa a SERVICE_ROLE, só no servidor,
  SEMPRE filtrando por `user_id`.

DEGRADAÇÃO ELEGANTE
-------------------
Sem `SUPABASE_URL` + chave secreta no .env, `configurado()` devolve False
e a aplicação roda single-user, sem login.
"""

import os
import json
import time
import urllib.error
import urllib.parse
import urllib.request

TIMEOUT = 20

# Nomes dos cookies de sessão (HttpOnly, setados só pelo backend).
COOKIE_ACCESS = "repass_at"
COOKIE_REFRESH = "repass_rt"

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

class AuthErro(Exception):
    """Falha de login/signup/recover com mensagem já pronta para o cliente."""

    def __init__(self, mensagem, status=400):
        super().__init__(mensagem)
        self.mensagem = mensagem
        self.status = status


def parse_cookies(cookie_header):
    """Parse simples de `Cookie:` → dict nome→valor."""
    out = {}
    if not cookie_header:
        return out
    for parte in cookie_header.split(";"):
        parte = parte.strip()
        if not parte or "=" not in parte:
            continue
        nome, valor = parte.split("=", 1)
        out[nome.strip()] = valor.strip()
    return out


def extrair_token(header_authorization):
    """Extrai o JWT de um header `Authorization: Bearer <token>`."""
    if not header_authorization:
        return ""
    partes = header_authorization.split(None, 1)
    if len(partes) == 2 and partes[0].lower() == "bearer":
        return partes[1].strip()
    return ""


def extrair_token_requisicao(header_authorization, cookie_header):
    """
    Token da requisição: cookie HttpOnly primeiro, Bearer legado depois.

    Cookie é o caminho do navegador. Bearer permanece para testes/CLI.
    """
    cookies = parse_cookies(cookie_header)
    token_cookie = (cookies.get(COOKIE_ACCESS) or "").strip()
    if token_cookie:
        return token_cookie
    return extrair_token(header_authorization)


def extrair_refresh_cookie(cookie_header):
    """Refresh token do cookie HttpOnly, se houver."""
    return (parse_cookies(cookie_header).get(COOKIE_REFRESH) or "").strip()


def invalidar_cache_token(token):
    """Remove um token do cache (logout / rotação)."""
    if token:
        _CACHE_TOKENS.pop(token, None)


def _traduzir_erro_auth(msg, status=400):
    m = str(msg or "").lower()
    if "invalid login credentials" in m:
        return "E-mail ou senha incorretos."
    if "email not confirmed" in m:
        return "Confirme seu e-mail antes de entrar."
    if "user already registered" in m:
        return "Este e-mail já tem cadastro."
    if "password should be at least" in m:
        return "A senha precisa ter ao menos 6 caracteres."
    if "unable to validate email" in m:
        return "E-mail inválido."
    if "email rate limit exceeded" in m:
        return "Muitas solicitações de e-mail – aguarde alguns minutos."
    if "too many requests" in m:
        return "Muitas solicitações - tente novamente em alguns minutos."
    if status == 429:
        return "Muitas solicitações - tente novamente em alguns minutos."
    return str(msg or f"HTTP {status}")


def _auth_post(caminho, corpo):
    """POST no Auth do Supabase com a chave anon (só no servidor)."""
    if not auth_configurado():
        raise AuthErro("Modo multiusuário não está ativo no servidor.", 503)
    try:
        return _requisicao(
            "POST",
            caminho,
            dados=corpo,
            headers={"apikey": anon_key()},
            timeout=15,
        )
    except SupabaseIndisponivel as exc:
        texto = str(exc)
        status = 400
        if "HTTP 401" in texto or "HTTP 403" in texto:
            status = 401
        elif "HTTP 429" in texto:
            status = 429
        # Extrai JSON de erro se veio no detalhe.
        msg = texto
        if "{" in texto:
            try:
                bruto = texto[texto.index("{"):]
                dados = json.loads(bruto)
                msg = (
                    dados.get("error_description")
                    or dados.get("msg")
                    or dados.get("message")
                    or dados.get("error")
                    or texto
                )
            except Exception:
                pass
        raise AuthErro(_traduzir_erro_auth(msg, status), status) from exc


# Resposta única para qualquer login que não deu certo. Mensagem diferente
# por motivo permite enumerar clientes: quem tenta 1.000 e-mails descobre
# quais existem pela mudança do texto.
LOGIN_RECUSADO = "E-mail ou senha incorretos."


def login_email_senha(email, senha):
    """
    Password grant no Supabase.

    Toda recusa sai com a mesma mensagem. O Supabase já responde "invalid
    login credentials" tanto para senha errada quanto para e-mail que não
    existe — mas respondia "email not confirmed" para conta criada e não
    confirmada, e esse texto distinto confirmava o cadastro.

    HTTP 429 é a exceção: é estado operacional do servidor, vale para
    qualquer e-mail e não diz nada sobre a conta.

    Returns:
        dict com access_token, refresh_token, expires_in, user.
    """
    email = (email or "").strip()
    if not email or not senha:
        raise AuthErro("Informe e-mail e senha.")
    try:
        dados = _auth_post(
            "/auth/v1/token?grant_type=password",
            {"email": email, "password": senha},
        )
    except AuthErro as erro:
        if erro.status == 429:
            raise
        raise AuthErro(LOGIN_RECUSADO, 401) from erro
    if not dados or not dados.get("access_token"):
        raise AuthErro(LOGIN_RECUSADO, 401)
    return dados


def cadastrar_email_senha(email, senha, redirect_to=None):
    """Signup no Supabase. Pode ou não devolver tokens (confirmação de e-mail)."""
    email = (email or "").strip()
    if not email or not senha:
        raise AuthErro("Informe e-mail e senha.")
    if len(senha) < 6:
        raise AuthErro("A senha precisa ter ao menos 6 caracteres.")
    corpo = {"email": email, "password": senha}
    if redirect_to:
        corpo["options"] = {"emailRedirectTo": redirect_to}
    dados = _auth_post("/auth/v1/signup", corpo) or {}
    return dados


def recuperar_senha(email, redirect_to=None):
    """Dispara e-mail de recuperação de senha."""
    email = (email or "").strip()
    if not email:
        raise AuthErro("Informe o e-mail.")
    corpo = {"email": email}
    if redirect_to:
        corpo["options"] = {"emailRedirectTo": redirect_to}
    _auth_post("/auth/v1/recover", corpo)
    return True


def renovar_sessao(refresh_token):
    """Troca refresh_token por novo par access/refresh."""
    if not refresh_token:
        raise AuthErro("Sessão expirada. Entre novamente.", 401)
    dados = _auth_post(
        "/auth/v1/token?grant_type=refresh_token",
        {"refresh_token": refresh_token},
    )
    if not dados or not dados.get("access_token"):
        raise AuthErro("Sessão expirada. Entre novamente.", 401)
    return dados


def montar_set_cookies(access_token, refresh_token, expires_in=3600, secure=False, samesite="Lax"):
    """
    Lista de strings Set-Cookie para a sessão.

    Args:
        access_token / refresh_token: JWTs do Supabase.
        expires_in: segundos de vida do access token.
        secure: True em HTTPS/produção.
        samesite: Lax | Strict | None (None exige Secure).
    """
    if samesite and samesite.lower() == "none":
        samesite = "None"
        secure = True
    else:
        samesite = samesite or "Lax"

    flags = f"Path=/; HttpOnly; SameSite={samesite}"
    if secure:
        flags += "; Secure"

    try:
        max_at = max(60, int(expires_in or 3600))
    except (TypeError, ValueError):
        max_at = 3600
    max_rt = 60 * 60 * 24 * 30  # 30 dias

    return [
        f"{COOKIE_ACCESS}={access_token}; Max-Age={max_at}; {flags}",
        f"{COOKIE_REFRESH}={refresh_token}; Max-Age={max_rt}; {flags}",
    ]


def montar_clear_cookies(secure=False, samesite="Lax"):
    """Cookies com Max-Age=0 para logout."""
    if samesite and samesite.lower() == "none":
        samesite = "None"
        secure = True
    else:
        samesite = samesite or "Lax"
    flags = f"Path=/; HttpOnly; SameSite={samesite}; Max-Age=0"
    if secure:
        flags += "; Secure"
    return [
        f"{COOKIE_ACCESS}=; {flags}",
        f"{COOKIE_REFRESH}=; {flags}",
    ]


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
    """
    Debita uma varredura da cota, numa única operação no Postgres.

    O antigo SELECT seguido de PATCH perdia incrementos quando duas
    varreduras terminavam ao mesmo tempo (TOCTOU). A RPC também impede que o
    contador ultrapasse o limite configurado no perfil.

    Returns:
        True se debitou. False se a cota já estava no limite — e nesse caso
        quem chamou NÃO pode seguir com o trabalho. Ignorar este retorno
        reabre o Denial of Wallet: a RPC recusa, o trabalho caro roda mesmo
        assim, e o cliente gasta Places de graça.
    """
    resultado = _requisicao(
        "POST",
        "/rest/v1/rpc/consumir_varredura_atomica",
        dados={"p_user_id": user_id},
        headers=_headers_servico(),
    )
    return bool(resultado)


def consumir_site(user_id):
    """
    Debita um site da cota, atomicamente, respeitando o limite.

    Returns:
        True se debitou; False se no limite. Vale o mesmo aviso de
        `consumir_varredura`: o retorno decide se o trabalho pode seguir.
    """
    resultado = _requisicao(
        "POST",
        "/rest/v1/rpc/consumir_site_atomico",
        dados={"p_user_id": user_id},
        headers=_headers_servico(),
    )
    return bool(resultado)


def devolver_varredura(user_id):
    """
    Estorna uma varredura debitada cujo trabalho não se concretizou.

    Falha aqui é registrada e engolida: já respondemos ao cliente, e uma
    exceção neste ponto trocaria "perdeu uma unidade de cota" por "erro 500
    depois do trabalho pronto". O prejuízo do estorno perdido é menor.
    """
    try:
        _requisicao(
            "POST",
            "/rest/v1/rpc/devolver_varredura_atomica",
            dados={"p_user_id": user_id},
            headers=_headers_servico(),
        )
        return True
    except SupabaseIndisponivel as e:
        print(f"[Supabase] Estorno de varredura falhou para {user_id}: {e}")
        return False


def devolver_site(user_id):
    """Estorna um site debitado que acabou não sendo criado. Ver acima."""
    try:
        _requisicao(
            "POST",
            "/rest/v1/rpc/devolver_site_atomico",
            dados={"p_user_id": user_id},
            headers=_headers_servico(),
        )
        return True
    except SupabaseIndisponivel as e:
        print(f"[Supabase] Estorno de site falhou para {user_id}: {e}")
        return False


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


def diagnosticar_conexao():
    """
    Faz uma leitura mínima e sem mutação para provar a conexão PostgREST.

    A resposta é própria para telemetria: não contém URL, chave, usuário nem
    conteúdo das tabelas.
    """
    inicio = time.perf_counter()
    if not configurado():
        return {
            "conectado": False,
            "latencia_ms": None,
            "erro": "nao_configurado",
        }
    ultimo_erro = None
    for tentativa in range(2):
        try:
            selecionar("perfis", colunas="user_id", limite=1)
            return {
                "conectado": True,
                "latencia_ms": round((time.perf_counter() - inicio) * 1000),
                "erro": None,
            }
        except Exception as exc:
            ultimo_erro = exc
            if tentativa == 0:
                time.sleep(0.2)
    return {
        "conectado": False,
        "latencia_ms": round((time.perf_counter() - inicio) * 1000),
        "erro": type(ultimo_erro).__name__,
    }
