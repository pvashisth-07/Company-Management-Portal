from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Visit, VisitAttendee, Company, User
from ..schemas import VisitCreate, VisitUpdate, VisitResponse
from ..services.validation_service import ValidationService
from ..services.engagement_service import EngagementHistoryService

router = APIRouter(prefix="/api/visits", tags=["Visits"])

@router.get("", response_model=List[VisitResponse])
def get_visits(
    company_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Visit)
    if company_id:
        query = query.filter(Visit.company_id == company_id)
    
    visits = query.order_by(Visit.created_at.desc()).all()
    results = []
    for v in visits:
        results.append({
            "visit_id": v.visit_id,
            "company_id": v.company_id,
            "recorded_by": v.recorded_by,
            "visit_date": v.visit_date,
            "purpose": v.purpose,
            "outcome": v.outcome,
            "notes": v.notes,
            "created_at": v.created_at,
            "attendees": [{"id": a.id, "attendee_name": a.attendee_name} for a in v.attendees],
            "company_name": v.company.name if v.company else "Unknown Company",
            "recorder_name": v.recorder.name if v.recorder else "Coordinator"
        })
    return results

@router.get("/{visit_id}", response_model=VisitResponse)
def get_visit_by_id(visit_id: int, db: Session = Depends(get_db)):
    v = db.query(Visit).filter(Visit.visit_id == visit_id).first()
    if not v:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visit record not found.")
    
    return {
        "visit_id": v.visit_id,
        "company_id": v.company_id,
        "recorded_by": v.recorded_by,
        "visit_date": v.visit_date,
        "purpose": v.purpose,
        "outcome": v.outcome,
        "notes": v.notes,
        "created_at": v.created_at,
        "attendees": [{"id": a.id, "attendee_name": a.attendee_name} for a in v.attendees],
        "company_name": v.company.name if v.company else "Unknown Company",
        "recorder_name": v.recorder.name if v.recorder else "Coordinator"
    }

@router.post("", response_model=VisitResponse, status_code=status.HTTP_201_CREATED)
def record_visit(
    visit_data: VisitCreate,
    user_id: int = Query(..., description="ID of authenticated coordinator recording the visit"),
    db: Session = Depends(get_db)
):
    # UC-006 Step 1: Check company existence
    company = db.query(Company).filter(Company.company_id == visit_data.company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company profile does not exist. Please create the profile first."
        )

    # UC-006 Step 2: Validate required fields
    val_result = ValidationService.validate_visit_data(visit_data.model_dump())
    if not val_result.is_valid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"errors": val_result.errors, "message": "Validation failed for visit record."}
        )

    # Step 3: Transactional save (Visit + Attendees + EngagementRecord)
    try:
        visit = Visit(
            company_id=visit_data.company_id,
            recorded_by=user_id,
            visit_date=visit_data.visit_date.strip(),
            purpose=visit_data.purpose.strip(),
            outcome=visit_data.outcome.strip(),
            notes=visit_data.notes.strip() if visit_data.notes else None
        )
        db.add(visit)
        db.flush()  # get visit_id

        # Add attendees
        attendees_records = []
        for name in visit_data.attendees:
            if name.strip():
                att = VisitAttendee(visit_id=visit.visit_id, attendee_name=name.strip())
                db.add(att)
                attendees_records.append(att)

        # Append Engagement History
        attendees_str = ", ".join([a.strip() for a in visit_data.attendees if a.strip()])
        EngagementHistoryService.append_record(
            db=db,
            company_id=visit_data.company_id,
            record_type="VISIT",
            description=f"Institutional Visit on {visit.visit_date}. Purpose: {visit.purpose}. Attendees: {attendees_str}. Outcome: {visit.outcome}",
            recorded_by=user_id
        )

        db.commit()
        db.refresh(visit)

        recorder = db.query(User).filter(User.user_id == user_id).first()

        return {
            "visit_id": visit.visit_id,
            "company_id": visit.company_id,
            "recorded_by": visit.recorded_by,
            "visit_date": visit.visit_date,
            "purpose": visit.purpose,
            "outcome": visit.outcome,
            "notes": visit.notes,
            "created_at": visit.created_at,
            "attendees": [{"id": a.id, "attendee_name": a.attendee_name} for a in visit.attendees],
            "company_name": company.name,
            "recorder_name": recorder.name if recorder else "Coordinator"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Visit could not be saved. Please try again. ({str(e)})"
        )

@router.put("/{visit_id}", response_model=VisitResponse)
def update_visit(
    visit_id: int,
    visit_data: VisitUpdate,
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """
    Realizes FR-018: Edit Visit Record (modify a visit record and log update to engagement history)
    """
    visit = db.query(Visit).filter(Visit.visit_id == visit_id).first()
    if not visit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visit record not found.")

    if visit_data.visit_date is not None:
        visit.visit_date = visit_data.visit_date.strip()
    if visit_data.purpose is not None:
        visit.purpose = visit_data.purpose.strip()
    if visit_data.outcome is not None:
        visit.outcome = visit_data.outcome.strip()
    if visit_data.notes is not None:
        visit.notes = visit_data.notes.strip()

    if visit_data.attendees is not None:
        # Replace attendees
        db.query(VisitAttendee).filter(VisitAttendee.visit_id == visit_id).delete()
        for name in visit_data.attendees:
            if name.strip():
                db.add(VisitAttendee(visit_id=visit.visit_id, attendee_name=name.strip()))

    # Update engagement record
    EngagementHistoryService.append_record(
        db=db,
        company_id=visit.company_id,
        record_type="VISIT",
        description=f"Visit record updated (Date: {visit.visit_date}, Purpose: {visit.purpose}). Outcome: {visit.outcome}",
        recorded_by=user_id
    )

    db.commit()
    db.refresh(visit)

    return {
        "visit_id": visit.visit_id,
        "company_id": visit.company_id,
        "recorded_by": visit.recorded_by,
        "visit_date": visit.visit_date,
        "purpose": visit.purpose,
        "outcome": visit.outcome,
        "notes": visit.notes,
        "created_at": visit.created_at,
        "attendees": [{"id": a.id, "attendee_name": a.attendee_name} for a in visit.attendees],
        "company_name": visit.company.name if visit.company else "Unknown Company",
        "recorder_name": visit.recorder.name if visit.recorder else "Coordinator"
    }

