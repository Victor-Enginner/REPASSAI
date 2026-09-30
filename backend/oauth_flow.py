"""Server-side Supabase PKCE; JWTs never enter browser JavaScript."""
import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from urllib.parse import urlencode, urlsplit

import supabase_client

COOKIE = 'repass_oauth'
PROVIDERS = {'google', 'github', 'azure'}


def origin():
    value = os.getenv('REPASS_PUBLIC_ORIGIN', '').strip().rstrip('/')
    parsed = urlsplit(value)
    local = parsed.hostname in {'localhost', '127.0.0.1'}
    if not parsed.hostname or parsed.username or parsed.password or parsed.query or parsed.fragment or parsed.path or (parsed.scheme != 'https' and not (local and parsed.scheme == 'http')):
        raise ValueError('Configure REPASS_PUBLIC_ORIGIN com a origem pública HTTPS.')
    return value


def enabled():
    if len(os.getenv('REPASS_OAUTH_SECRET', '')) < 32 or not supabase_client.auth_configurado():
        return []
    try:
        origin()
    except ValueError:
        return []
    return sorted(PROVIDERS.intersection(os.getenv('REPASS_OAUTH_PROVIDERS', '').split(',')))


def _b64(data):
    return base64.urlsafe_b64encode(data).decode().rstrip('=')


def _sign(payload):
    secret = os.getenv('REPASS_OAUTH_SECRET', '')
    if len(secret) < 32:
        raise ValueError('Login social não configurado.')
    return _b64(hmac.new(secret.encode(), payload.encode(), hashlib.sha256).digest())


def cookie(value='', secure=True, clear=False):
    return f'{COOKIE}={value}; Path=/api/auth/oauth; Max-Age={0 if clear else 600}; HttpOnly; SameSite=Lax' + ('; Secure' if secure else '')


def start(provider, secure=True):
    if not isinstance(provider, str) or provider not in enabled():
        raise ValueError('Provedor de login ainda não habilitado.')
    verifier = secrets.token_urlsafe(48)
    nonce = secrets.token_urlsafe(24)
    payload = _b64(json.dumps({'v': verifier, 'n': nonce, 'exp': int(time.time()) + 600}).encode())
    callback = origin() + '/api/auth/oauth/callback'
    query = {'provider': provider, 'redirect_to': callback,
             'code_challenge': _b64(hashlib.sha256(verifier.encode()).digest()),
             'code_challenge_method': 's256'}
    if provider == 'azure':
        query['scopes'] = 'email'
    return supabase_client.url_base() + '/auth/v1/authorize?' + urlencode(query), cookie(payload + '.' + _sign(payload), secure)


def verify(value, flow=None):
    try:
        payload, signature = value.split('.')
        if not hmac.compare_digest(signature, _sign(payload)):
            raise ValueError()
        data = json.loads(base64.urlsafe_b64decode(payload + '=' * (-len(payload) % 4)))
        if data['exp'] <= time.time() or (flow is not None and not hmac.compare_digest(data['n'], flow)):
            raise ValueError()
        return data['v']
    except (ValueError, KeyError, TypeError, json.JSONDecodeError):
        raise ValueError('Sessão de login expirada ou inválida.') from None


def finish(value, code):
    if not isinstance(code, str) or not code or len(code) > 4096:
        raise ValueError('Código de login inválido.')
    # The signed browser cookie supplies the verifier; a code issued for another
    # browser cannot be exchanged. Supabase validates provider OAuth state.
    verifier = verify(value)
    session = supabase_client._auth_post('/auth/v1/token?grant_type=pkce', {'auth_code': code, 'code_verifier': verifier})
    if not session.get('access_token') or not session.get('refresh_token') or not session.get('user', {}).get('id'):
        raise ValueError('O provedor não confirmou a sessão.')
    return session
