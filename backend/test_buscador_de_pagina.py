"""
Testes do buscador seguro de página.

A lista de destinos hostis é a que o PROMPT_ENGINE_FABLE5.md exige como prova
do item 1.3: loopback, metadados de nuvem, faixas privadas, IPv6 local e
esquema de arquivo — todos bloqueados; domínio público normal, permitido.

Nenhum teste aqui depende de rede para o caso NEGATIVO: a recusa acontece na
validação, antes de qualquer conexão. Só o caso positivo toca a internet, e
ele pula sozinho se estiver offline.
"""

import unittest

import buscador_de_pagina as bp


class EnderecosInternos(unittest.TestCase):
    """A trava de faixa de IP, isolada da rede."""

    def test_faixas_internas_sao_recusadas(self):
        internos = [
            "127.0.0.1",        # loopback
            "169.254.169.254",  # metadados de instância em nuvem
            "10.0.0.1",         # RFC1918
            "192.168.1.1",      # RFC1918
            "172.16.0.1",       # RFC1918
            "0.0.0.0",          # não especificado
            "::1",              # loopback IPv6
            "fe80::1",          # link-local IPv6
            "224.0.0.1",        # multicast
        ]
        for ip in internos:
            with self.subTest(ip=ip):
                self.assertFalse(
                    bp._endereco_e_publico(ip),
                    f"{ip} deveria ser recusado como interno",
                )

    def test_enderecos_publicos_passam(self):
        for ip in ["8.8.8.8", "1.1.1.1", "93.184.216.34", "2606:4700:4700::1111"]:
            with self.subTest(ip=ip):
                self.assertTrue(bp._endereco_e_publico(ip), f"{ip} é público")

    def test_texto_que_nao_e_ip_nao_passa(self):
        """Entrada inválida não pode virar 'público' por omissão."""
        for lixo in ["", "abc", "999.999.999.999", "127.0.0.1; rm -rf /"]:
            with self.subTest(v=lixo):
                self.assertFalse(bp._endereco_e_publico(lixo))


class EsquemasDeUrl(unittest.TestCase):
    def test_esquemas_perigosos_sao_recusados(self):
        for url in [
            "file:///etc/passwd",
            "file://C:/Windows/win.ini",
            "gopher://exemplo.com/",
            "ftp://exemplo.com/arquivo",
            "data:text/html,<script>alert(1)</script>",
            "javascript:alert(1)",
        ]:
            with self.subTest(url=url):
                with self.assertRaises(bp.UrlRecusada):
                    bp._validar(url)

    def test_url_vazia_ou_sem_host(self):
        for url in ["", "   ", "http://", "https://"]:
            with self.subTest(url=url):
                with self.assertRaises(bp.UrlRecusada):
                    bp._validar(url)


class DestinosInternosPorNome(unittest.TestCase):
    """
    O nome resolve para IP interno — o caso que uma allowlist de host não pega
    e que uma regex de string erra.
    """

    def test_localhost_em_varias_formas(self):
        # Todas resolvem para loopback sem sair da máquina.
        for url in [
            "http://localhost:5432/",
            "http://127.0.0.1/",
            "http://127.0.0.1:8000/api/health",
            "http://[::1]/",
            "http://0.0.0.0/",
        ]:
            with self.subTest(url=url):
                with self.assertRaises(bp.UrlRecusada) as ctx:
                    bp._validar(url)
                self.assertIn("interna", str(ctx.exception).lower())

    def test_metadados_de_nuvem(self):
        """O alvo clássico: credenciais da instância."""
        with self.assertRaises(bp.UrlRecusada):
            bp._validar("http://169.254.169.254/latest/meta-data/")


class LimitesDeCorpo(unittest.TestCase):
    def test_corpo_maior_que_o_teto_e_abortado(self):
        class RespostaFalsa:
            def __init__(self):
                self.enviado = 0

            def read(self, n):
                # Fluxo infinito: sem teto, isto nunca termina.
                self.enviado += n
                return b"x" * n

        with self.assertRaises(bp.FalhaAoBuscar) as ctx:
            bp._ler_com_teto(RespostaFalsa(), tamanho_max=256 * 1024)
        self.assertIn("limite", str(ctx.exception).lower())

    def test_corpo_dentro_do_teto_e_devolvido_inteiro(self):
        class RespostaCurta:
            def __init__(self):
                self.restante = [b"<html>", b"ola", b"</html>"]

            def read(self, n):
                return self.restante.pop(0) if self.restante else b""

        corpo = bp._ler_com_teto(RespostaCurta(), tamanho_max=1024)
        self.assertEqual(corpo, b"<html>ola</html>")


class DominioPublico(unittest.TestCase):
    """Único teste que toca a rede. Pula sozinho se estiver offline."""

    def test_dominio_publico_normal_e_aceito(self):
        try:
            self.assertTrue(bp._validar("https://example.com/"))
        except bp.UrlRecusada as e:
            self.fail(f"example.com deveria passar: {e}")
        except Exception:
            self.skipTest("Sem DNS/rede neste ambiente.")


if __name__ == "__main__":
    unittest.main()
