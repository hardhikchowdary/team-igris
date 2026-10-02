from typing import Any

from fastapi import APIRouter

from app.services.nova import get_invoices

router = APIRouter(prefix="/nova", tags=["nova"])


@router.get("/invoices")
def list_nova_invoices() -> Any:
    return get_invoices()