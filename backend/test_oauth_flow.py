import os
import unittest
import io
import json
from contextlib import redirect_stdout
from unittest.mock import patch
from urllib.parse import parse_qs, urlsplit

import oauth_flow


class OAuthFlowTests(unittest.TestCase):
    def test_diagnostic_logs_only_booleans(self):
        captured = io.StringIO()
        with redirect_stdout(captured):
            oauth_flow.log_configuration()
        output = captured.getvalue()
        self.assertNotIn(os.environ['REPASS_OAUTH_SECRET'], output)
        self.assertNotIn(os.environ['REPASS_PUBLIC_ORIGIN'], output)
        report = json.loads(output.split('] ', 1)[1])
        self.assertTrue(all(type(value) is bool for value in report.values()))
        self.assertTrue(report['google_declarado'])
        self.assertTrue(report['algum_provedor_habilitado'])

    def test_diagnostic_identifies_short_secret(self):
        with patch.dict(os.environ, {'REPASS_OAUTH_SECRET': 'short'}):
            captured = io.StringIO()
            with redirect_stdout(captured):
                oauth_flow.log_configuration()
            report = json.loads(captured.getvalue().split('] ', 1)[1])
            self.assertFalse(report['segredo_valido'])
            self.assertFalse(report['algum_provedor_habilitado'])

    def setUp(self):
        self.env = patch.dict(os.environ, {
            'REPASS_PUBLIC_ORIGIN': 'https://repass-ai-beta.netlify.app',
            'REPASS_OAUTH_SECRET': 'test-only-secret-' * 4,
            'REPASS_OAUTH_PROVIDERS': 'google,github,azure',
        })
        self.env.start()
        self.addCleanup(self.env.stop)
        self.auth = patch.object(oauth_flow.supabase_client, 'auth_configurado', return_value=True)
        self.auth.start()
        self.addCleanup(self.auth.stop)

    def flow(self):
        with patch.object(oauth_flow.supabase_client, 'url_base', return_value='https://test.supabase.co'):
            url, cookie = oauth_flow.start('google')
        query = parse_qs(urlsplit(url).query)
        value = cookie.split(';')[0].split('=', 1)[1]
        import base64, json
        payload = value.split('.')[0]
        nonce = json.loads(base64.urlsafe_b64decode(payload + '=' * (-len(payload) % 4)))['n']
        return query, value, nonce, cookie

    def test_pkce_and_http_only(self):
        query, value, nonce, cookie = self.flow()
        self.assertEqual(query['code_challenge_method'], ['s256'])
        self.assertEqual(query['redirect_to'], ['https://repass-ai-beta.netlify.app/api/auth/oauth/callback'])
        self.assertTrue(oauth_flow.verify(value, nonce))
        self.assertIn('HttpOnly', cookie)
        self.assertIn('Secure', cookie)

    def test_reject_tampering_and_wrong_flow(self):
        _, value, nonce, _ = self.flow()
        for token, flow in [(value + 'x', nonce), (value, 'wrong'), ('broken', nonce)]:
            with self.assertRaises(ValueError):
                oauth_flow.verify(token, flow)

    def test_expired_cookie(self):
        _, value, nonce, _ = self.flow()
        with patch.object(oauth_flow.time, 'time', return_value=10**12):
            with self.assertRaises(ValueError):
                oauth_flow.verify(value, nonce)

    def test_reject_unconfigured_provider(self):
        for provider in ['facebook', [], None]:
            with self.assertRaises(ValueError):
                oauth_flow.start(provider)

    def test_reject_unsafe_origin(self):
        for origin in ['https://example.com/path', 'http://example.com', 'https://user@example.com']:
            with patch.dict(os.environ, {'REPASS_PUBLIC_ORIGIN': origin}):
                with self.assertRaises(ValueError):
                    oauth_flow.origin()

    def test_exchange_keeps_tokens_on_server(self):
        _, value, _, _ = self.flow()
        session = {'access_token': 'test-access', 'refresh_token': 'test-refresh', 'user': {'id': 'test-user'}}
        with patch.object(oauth_flow.supabase_client, '_auth_post', return_value=session) as exchange:
            self.assertEqual(oauth_flow.finish(value, 'test-code'), session)
            self.assertEqual(exchange.call_args.args[1]['code_verifier'], oauth_flow.verify(value))

    def test_invalid_cookie_never_calls_provider(self):
        with patch.object(oauth_flow.supabase_client, '_auth_post') as exchange:
            with self.assertRaises(ValueError):
                oauth_flow.finish('invalid', 'test-code')
            exchange.assert_not_called()


if __name__ == '__main__':
    unittest.main()
