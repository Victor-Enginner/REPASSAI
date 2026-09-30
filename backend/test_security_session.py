"""Regressões isoladas: sem credenciais, rede ou cobranças reais."""
import io
import unittest
from unittest.mock import patch, Mock
import app_api
import supabase_client


class SessionSecurityTests(unittest.TestCase):
    def handler(self):
        handler = object.__new__(app_api.RepassApiHandler)
        handler.headers = {}
        handler._token_atual = Mock(return_value="synthetic-access")
        handler._usuario_atual = Mock(return_value={"id": "synthetic-user"})
        handler._cookie_flags = Mock(return_value=(True, "Lax"))
        handler._json = Mock()
        return handler

    def test_logout_revokes_before_clear(self):
        handler = self.handler()
        with patch.object(supabase_client, "encerrar_sessao") as revoke:
            handler.handle_auth_logout()
        revoke.assert_called_once_with("synthetic-access")
        self.assertEqual(handler._json.call_args.args[0], 200)
        self.assertTrue(all("Max-Age=0" in value for value in handler._json.call_args.kwargs["cookies"]))

    def test_logout_uses_renewed_token(self):
        handler = self.handler()
        handler._token_renovado = "synthetic-renewed"
        with patch.object(supabase_client, "encerrar_sessao") as revoke:
            handler.handle_auth_logout()
        revoke.assert_called_once_with("synthetic-renewed")

    def test_logout_failure_is_not_success(self):
        handler = self.handler()
        with patch.object(supabase_client, "encerrar_sessao", side_effect=supabase_client.AuthErro("failed", 503)):
            handler.handle_auth_logout()
        self.assertEqual(handler._json.call_args.args[0], 503)
        self.assertFalse(handler._json.call_args.args[1]["sucesso"])

    def test_provider_local_scope(self):
        with patch.object(supabase_client, "_requisicao") as request:
            supabase_client.encerrar_sessao("synthetic-access")
        self.assertEqual(request.call_args.args, ("POST", "/auth/v1/logout?scope=local"))

    def test_logs_drop_query(self):
        handler = self.handler()
        handler.command = "GET"
        handler.path = "/api/auth/oauth/callback?code=SECRET_SYNTHETIC"
        handler.log_message = Mock()
        handler.log_request(303)
        self.assertNotIn("SECRET_SYNTHETIC", str(handler.log_message.call_args))

    def test_json_always_no_store(self):
        handler = self.handler()
        handler.send_response = Mock()
        handler.send_header = Mock()
        handler._send_cors_headers = Mock()
        handler.end_headers = Mock()
        handler.wfile = io.BytesIO()
        app_api.RepassApiHandler._json(handler, 200, {"leads": []})
        handler.send_header.assert_any_call("Cache-Control", "private, no-store")


if __name__ == "__main__":
    unittest.main()
