import json
import os
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from dotenv import load_dotenv
from fastapi import HTTPException

ENV_FILE = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ENV_FILE)


def get_invoices() -> object:
    api_key = os.getenv("NOVA_API_KEY", "").strip()
    base_url = os.getenv("NOVA_BASE_URL", "").strip().rstrip("/")
    if not api_key or not base_url:
        raise HTTPException(status_code=503, detail="Nova API is not configured. Set NOVA_API_KEY and NOVA_BASE_URL in backend/.env.")

    request = Request(
        f"{base_url}/invoices?limit=5",
        headers={"Authorization": f"Bearer {api_key}", "Accept": "application/json"},
        method="GET",
    )
    try:
        with urlopen(request, timeout=20) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        raise HTTPException(status_code=502, detail=f"Nova API returned HTTP {error.code}.") from None
    except URLError:
        raise HTTPException(status_code=502, detail="Unable to connect to the Nova API.") from None
    except (UnicodeDecodeError, json.JSONDecodeError):
        raise HTTPException(status_code=502, detail="Nova API returned an invalid JSON response.") from None