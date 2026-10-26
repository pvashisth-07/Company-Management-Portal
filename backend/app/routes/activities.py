from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import RecruitmentActivity, Company, User
from ..schemas import (
    RecruitmentActivityCreate, RecruitmentActivityUpdate, RecruitmentActivityResponse
)
from ..services.validation_service import ValidationService
from ..services.engagement_service import EngagementHistoryService

router = APIRouter(prefix="/api/activities", tags=["Recruitment Activities"])

def format_activity_response(a: RecruitmentActivity) -> dict:
    return {
        "activity_id": a.activity_id,
        "company_id": a.company_id,
        "created_by": a.created_by,
        "title": a.title,
        "type": a.type,
        "activity_date": a.activity_date,
        "eligibility_criteria": a.eligibility_criteria,
        "positions_offered": a.positions_offered,
        "package_details": a.package_details,
        "status": a.status,
        "created_at": a.created_at,
        "updated_at": a.updated_at,
        "company_name": a.company.name if a.company else "Unknown Company",
        "creator_name": a.creator.name if a.creator else "Coordinator",
        "approvals": [
            {
                "approval_id": app.approval_id,
                "activity_id": app.activity_id,
                "approver_id": app.approver_id,
                "decision": app.decision,
                "comments": app.comments,
                "decision_date": app.decision_date,
                "approver_name": app.approver.name if app.approver else "Approver"
            } for app in a.approvals
        ]
    }

@router.get("", response_model=List[RecruitmentActivityResponse])
def get_activities(
    company_id: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    type_filter: Optional[str] = Query(None, alias="type"),
    db: Session = Depends(get_db)
):
    query = db.query(RecruitmentActivity)
    if company_id:
        query = query.filter(RecruitmentActivity.company_id == company_id)
    if status_filter and status_filter != "All":
        query = query.filter(RecruitmentActivity.status == status_filter)
    if type_filter and type_filter != "All":
        query = query.filter(RecruitmentActivity.type == type_filter)

    activities = query.order_by(RecruitmentActivity.created_at.desc()).all()
    return [format_activity_response(a) for a in activities]

@router.get("/{activity_id}", response_model=RecruitmentActivityResponse)
def get_activity_by_id(activity_id: int, db: Session = Depends(get_db)):
    activity = db.query(RecruitmentActivity).filter(RecruitmentActivity.activity_id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recruitment activity not found.")
    return format_activity_response(activity)

@router.post("", response_model=RecruitmentActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity(
    activity_data: RecruitmentActivityCreate,
    user_id: int = Query(..., description="ID of creator coordinator"),
    db: Session = Depends(get_db)
):
    # Verify company exists
    company = db.query(Company).filter(Company.company_id == activity_data.company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company profile does not exist. Please create the profile first."
        )

    activity = RecruitmentActivity(
        company_id=activity_data.company_id,
        created_by=user_id,
        title=activity_data.title.strip(),
        type=activity_data.type.strip(),
        activity_date=activity_data.activity_date.strip(),
        eligibility_criteria=activity_data.eligibility_criteria.strip(),
        positions_offered=activity_data.positions_offered.strip(),
        package_details=activity_data.package_details.strip() if activity_data.package_details else None,
        status="DRAFT" if not activity_data.status else activity_data.status
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)

    EngagementHistoryService.append_record(
        db=db,
        company_id=activity.company_id,
        record_type="ACTIVITY",
        description=f"Created recruitment activity draft: '{activity.title}' ({activity.type}).",
        recorded_by=user_id
    )

    return format_activity_response(activity)

@router.put("/{activity_id}", response_model=RecruitmentActivityResponse)
def update_activity(
    activity_id: int,
    activity_data: RecruitmentActivityUpdate,
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    activity = db.query(RecruitmentActivity).filter(RecruitmentActivity.activity_id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recruitment activity not found.")

    # BR-007: Cancelled recruitment activities cannot be further edited.
    if activity.status == "CANCELLED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cancelled recruitment activities cannot be further edited."
        )

    # Cannot edit approved or ongoing activities without revoking or specific workflows
    if activity.status not in ["DRAFT", "REVISION"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only DRAFT or REVISION activities can be edited (current status: {activity.status})."
        )

    if activity_data.title is not None:
        activity.title = activity_data.title.strip()
    if activity_data.type is not None:
        activity.type = activity_data.type.strip()
    if activity_data.activity_date is not None:
        activity.activity_date = activity_data.activity_date.strip()
    if activity_data.eligibility_criteria is not None:
        activity.eligibility_criteria = activity_data.eligibility_criteria.strip()
    if activity_data.positions_offered is not None:
        activity.positions_offered = activity_data.positions_offered.strip()
    if activity_data.package_details is not None:
        activity.package_details = activity_data.package_details.strip()

    db.commit()
    db.refresh(activity)
    return format_activity_response(activity)

@router.post("/{activity_id}/submit", response_model=RecruitmentActivityResponse)
def submit_activity_for_approval(
    activity_id: int,
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """
    Realizes UC-008: Submit Recruitment Activity
    """
    activity = db.query(RecruitmentActivity).filter(RecruitmentActivity.activity_id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recruitment activity not found.")

    # Status check
    status_check = ValidationService.validate_submittable_status(activity)
    if not status_check.is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=status_check.errors[0]
        )

    # Required fields check
    val_data = {
        "company_id": activity.company_id,
        "title": activity.title,
        "type": activity.type,
        "activity_date": activity.activity_date,
        "eligibility_criteria": activity.eligibility_criteria,
        "positions_offered": activity.positions_offered
    }
    field_check = ValidationService.validate_activity_data(val_data)
    if not field_check.is_valid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"errors": field_check.errors, "message": f"Cannot submit: {field_check.errors[0]}"}
        )

    activity.status = "SUBMITTED"
    db.commit()
    db.refresh(activity)

    EngagementHistoryService.append_record(
        db=db,
        company_id=activity.company_id,
        record_type="ACTIVITY",
        description=f"Submitted recruitment activity '{activity.title}' for institutional approval.",
        recorded_by=user_id
    )

    return format_activity_response(activity)

@router.post("/{activity_id}/cancel", response_model=RecruitmentActivityResponse)
def cancel_activity(
    activity_id: int,
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    activity = db.query(RecruitmentActivity).filter(RecruitmentActivity.activity_id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recruitment activity not found.")

    if activity.status == "COMPLETED":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot cancel a completed activity.")

    activity.status = "CANCELLED"
    db.commit()
    db.refresh(activity)

    EngagementHistoryService.append_record(
        db=db,
        company_id=activity.company_id,
        record_type="ACTIVITY",
        description=f"Recruitment activity '{activity.title}' was CANCELLED.",
        recorded_by=user_id
    )

    return format_activity_response(activity)

@router.post("/{activity_id}/progress-status", response_model=RecruitmentActivityResponse)
def progress_activity_status(
    activity_id: int,
    new_status: str = Query(..., description="Target status: SCHEDULED, ONGOING, COMPLETED"),
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    activity = db.query(RecruitmentActivity).filter(RecruitmentActivity.activity_id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recruitment activity not found.")

    # BR-003: Only approved recruitment activities can be scheduled/executed.
    if new_status in ["SCHEDULED", "ONGOING", "COMPLETED"] and activity.status not in ["APPROVED", "SCHEDULED", "ONGOING"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only approved recruitment activities can be scheduled or conducted (current status: {activity.status})."
        )

    activity.status = new_status
    db.commit()
    db.refresh(activity)

    EngagementHistoryService.append_record(
        db=db,
        company_id=activity.company_id,
        record_type="ACTIVITY",
        description=f"Recruitment activity '{activity.title}' transitioned to {new_status}.",
        recorded_by=user_id
    )

    return format_activity_response(activity)
