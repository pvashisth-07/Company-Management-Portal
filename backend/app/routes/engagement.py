from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import EngagementRecord, Company
from ..schemas import EngagementRecordResponse
from ..services.engagement_service import EngagementHistoryService

router = APIRouter(prefix="/api/engagement", tags=["Engagement History"])

@router.get("/company/{company_id}", response_model=List[EngagementRecordResponse])
def get_company_timeline(
    company_id: int,
    include_archived: bool = Query(False),
    db: Session = Depends(get_db)
):
    company = db.query(Company).filter(Company.company_id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company profile does not exist. Please create the profile first."
        )

    records = EngagementHistoryService.get_timeline(db, company_id, include_archived=include_archived)
    results = []
    for r in records:
        results.append({
            "record_id": r.record_id,
            "company_id": r.company_id,
            "type": r.type,
            "description": r.description,
            "record_date": r.record_date,
            "recorded_by": r.recorded_by,
            "recorder_name": r.recorder.name if r.recorder else "System",
            "archived": r.archived
        })
    return results

@router.post("/record/{record_id}/archive")
def archive_engagement_record(record_id: int, db: Session = Depends(get_db)):
    # BR-008: Engagement history entries cannot be deleted, only archived.
    success = EngagementHistoryService.archive_record(db, record_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Engagement record not found.")
    return {"message": "Engagement record archived successfully."}
