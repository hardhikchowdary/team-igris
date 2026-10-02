from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.talent import TalentSearchRequest, TalentSearchResponse
from app.services.talent_matching import search_talent

router = APIRouter(prefix="/talent", tags=["talent"])


@router.post("/search", response_model=TalentSearchResponse)
def talent_search(payload: TalentSearchRequest, session: Session = Depends(get_db)) -> TalentSearchResponse:
    return search_talent(payload, session)