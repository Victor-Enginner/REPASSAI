"""Inicia o backend local sem exigir login.

Uso exclusivo de desenvolvimento. `app_api.py` ignora este bypass quando
REPASS_ENV/ENV/NODE_ENV indica produção.
"""

import os

os.environ["REPASS_ENV"] = "development"
os.environ["REPASS_DEV_SINGLE_USER"] = "1"

from app_api import run_server


if __name__ == "__main__":
    run_server(port=int(os.environ.get("PORT", "8000")))
