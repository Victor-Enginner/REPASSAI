"""
Busca uma página da web a partir de URL fornecida pelo usuário.

POR QUE ESTE MÓDULO EXISTE
--------------------------
Até aqui o REPASS AI tinha UMA saída para a internet com destino influenciável
pelo cliente: o proxy de mídia, fechado por allowlist de quatro hosts. Aceitar
qualquer host é uma capacidade nova — e é exatamente o vetor de SSRF.

O `SEGURANCA.md 3.3` está marcado como fechado com a justificativa "esse
caminho não existe". A partir do momento em que este módulo for ligado a uma
rota, ele existe. Por isso a defesa nasce junto com a funcionalidade, não
depois.

O ATAQUE QUE ISTO IMPEDE
------------------------
Um operador cola `http://169.254.169.254/latest/meta-data/` e o SERVIDOR faz a
requisição — de dentro da rede, autenticado pela própria posição. Em nuvem, esse
endereço devolve credenciais da instância. Variantes: `localhost:5432` para
sondar o Postgres, `10.0.0.0/8` para mapear a rede interna, `file:///etc/passwd`
para ler disco.

AS CINCO TRAVAS
---------------
1. Esquema: só http e https. Mata `file://`, `gopher://`, `ftp://`.
2. DNS resolvido ANTES de conectar, e TODOS os endereços conferidos. Um domínio
   público pode apontar para 127.0.0.1 de propósito.
3. Faixas recusadas: privada, loopback, link-local, reservada, multicast e não
   especificada — checadas por `ipaddress`, não por regex de string. Regex em
   texto de IP erra com `0177.0.0.1`, `2130706433` e `[::ffff:127.0.0.1]`.
4. Redirecionamento revalidado a cada salto. Um host permitido com
   open-redirect levaria a qualquer destino — foi exatamente o furo real
   encontrado no proxy de mídia (SEGURANCA.md 3.3).
5. Teto de bytes e de tempo. Sem isso, uma URL que transmite para sempre segura
   uma thread do servidor até o processo morrer.

LIMITE CONHECIDO — DNS REBINDING
--------------------------------
Entre a hora em que resolvemos o nome e a hora em que a biblioteca abre a
conexão, o DNS pode mudar a resposta e apontar para um IP interno. Fechar isso
exige conectar no IP já validado e mandar o Host no cabeçalho, o que urllib não
oferece sem reescrever o handler de socket.

Está registrado aqui em vez de escondido. Mitigação real hoje: o TTL curto
necessário para o ataque é raro, e o conteúdo devolvido é HTML que ainda passa
por quem chamou. Se este módulo passar a alimentar decisão automática, esta
lacuna precisa ser fechada antes.
"""

import ipaddress
import socket
import urllib.error
import urllib.parse
import urllib.request

# Tetos. Uma landing page complexa raramente passa de 2MB de HTML; o resto do
# peso está em asset, que é buscado depois e um a um.
TAMANHO_MAX_BYTES = 5 * 1024 * 1024
TIMEOUT_S = 15
MAX_REDIRECIONAMENTOS = 5

ESQUEMAS_PERMITIDOS = ("http", "https")

# Navegador comum. Sem isto, muitos servidores devolvem 403 para script.
AGENTE = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36 RepassAI/1.0"
)


class UrlRecusada(Exception):
    """A URL não passou nas travas. A mensagem é segura para mostrar ao usuário."""


class FalhaAoBuscar(Exception):
    """A URL era aceitável, mas a busca não completou."""


def _endereco_e_publico(ip_texto):
    """
    True quando o IP é roteável na internet pública.

    Cada flag é checada explicitamente em vez de confiar só em `is_private`:
    a cobertura de `is_private` varia entre versões do Python, e aqui um falso
    negativo é uma porta aberta para a rede interna.
    """
    try:
        ip = ipaddress.ip_address(ip_texto)
    except ValueError:
        return False

    return not (
        ip.is_private
        or ip.is_loopback
        or ip.is_link_local
        or ip.is_reserved
        or ip.is_multicast
        or ip.is_unspecified
    )


def _validar(url):
    """
    Confere uma URL e devolve a versão normalizada.

    Raises:
        UrlRecusada: com motivo legível, quando qualquer trava reprova.
    """
    if not isinstance(url, str) or not url.strip():
        raise UrlRecusada("URL vazia.")

    url = url.strip()

    try:
        partes = urllib.parse.urlparse(url)
    except ValueError as e:
        raise UrlRecusada("URL malformada.") from e

    if partes.scheme.lower() not in ESQUEMAS_PERMITIDOS:
        raise UrlRecusada(
            f"Esquema '{partes.scheme or '(nenhum)'}' não é aceito. Use http ou https."
        )

    host = partes.hostname
    if not host:
        raise UrlRecusada("URL sem host.")

    # Resolve o nome e confere TODOS os endereços. Um domínio com registro A
    # para IP público e AAAA para ::1 passaria se olhássemos só o primeiro.
    try:
        infos = socket.getaddrinfo(host, partes.port or (443 if partes.scheme == "https" else 80))
    except socket.gaierror as e:
        raise UrlRecusada(f"Não foi possível resolver o endereço de '{host}'.") from e

    enderecos = {info[4][0] for info in infos}
    if not enderecos:
        raise UrlRecusada(f"'{host}' não resolveu para nenhum endereço.")

    internos = [ip for ip in enderecos if not _endereco_e_publico(ip)]
    if internos:
        # A mensagem não devolve o IP: para quem sonda a rede, "qual IP" já é
        # informação. Basta dizer que foi recusado.
        raise UrlRecusada(
            f"'{host}' aponta para um endereço de rede interna e foi recusado."
        )

    return url


def _ler_com_teto(resposta, tamanho_max):
    """Lê o corpo em blocos, abortando se passar do teto."""
    pedacos = []
    total = 0
    while True:
        bloco = resposta.read(64 * 1024)
        if not bloco:
            break
        total += len(bloco)
        if total > tamanho_max:
            raise FalhaAoBuscar(
                f"A página passou do limite de {tamanho_max // (1024 * 1024)}MB."
            )
        pedacos.append(bloco)
    return b"".join(pedacos)


class _SemRedirecionamentoAutomatico(urllib.request.HTTPRedirectHandler):
    """
    Desliga o redirecionamento automático do urllib.

    O urllib segue redirect sozinho e só valida a PRIMEIRA URL. Um host que
    passa na trava e responde 302 para 169.254.169.254 levaria a busca até lá
    sem nova checagem. Aqui cada salto volta para `buscar_pagina`, que
    revalida do zero.
    """

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def buscar_pagina(url, tamanho_max=TAMANHO_MAX_BYTES, timeout=TIMEOUT_S, _saltos=0):
    """
    Busca o HTML de uma URL pública, com as cinco travas aplicadas.

    Args:
        url: endereço a buscar.
        tamanho_max: teto de bytes do corpo.
        timeout: segundos por requisição.
        _saltos: uso interno, conta redirecionamentos.

    Returns:
        dict com `url_final`, `status`, `content_type`, `html` e `bytes`.

    Raises:
        UrlRecusada: a URL não passou nas travas (inclusive após redirect).
        FalhaAoBuscar: a busca não completou.
    """
    if _saltos > MAX_REDIRECIONAMENTOS:
        raise FalhaAoBuscar("Redirecionamentos demais.")

    url_valida = _validar(url)

    pedido = urllib.request.Request(
        url_valida,
        headers={"User-Agent": AGENTE, "Accept": "text/html,application/xhtml+xml,*/*"},
    )
    abridor = urllib.request.build_opener(_SemRedirecionamentoAutomatico)

    try:
        with abridor.open(pedido, timeout=timeout) as resposta:
            corpo = _ler_com_teto(resposta, tamanho_max)
            return {
                "url_final": resposta.geturl(),
                "status": resposta.status,
                "content_type": resposta.headers.get("Content-Type", ""),
                "html": corpo.decode("utf-8", errors="replace"),
                "bytes": len(corpo),
            }
    except urllib.error.HTTPError as e:
        # 3xx chega aqui porque desligamos o redirect automático. Cada salto é
        # tratado como URL nova e revalidado.
        if e.code in (301, 302, 303, 307, 308):
            destino = e.headers.get("Location")
            if not destino:
                raise FalhaAoBuscar(f"Redirecionamento {e.code} sem destino.") from e
            # Location pode ser relativo.
            destino = urllib.parse.urljoin(url_valida, destino)
            return buscar_pagina(destino, tamanho_max, timeout, _saltos + 1)
        raise FalhaAoBuscar(f"O servidor respondeu {e.code}.") from e
    except urllib.error.URLError as e:
        raise FalhaAoBuscar(f"Não foi possível conectar: {e.reason}") from e
    except socket.timeout as e:
        raise FalhaAoBuscar(f"A página não respondeu em {timeout}s.") from e
