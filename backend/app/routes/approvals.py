from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import RecruitmentActivity, Approval, User, Company
from ..schemas import ApprovalCreate, ApprovalResponse, RecruitmentActivityResponse
from ..services.engagement_service import EngagementHistoryService
from .activities import format_activity_response

router = APIRouter(prefix="/api/approvals", tags=["Approvals"])

@router.get("/queue", response_model=List[RecruitmentActivityResponse])
def get_approval_queue(db: Session = Depends(get_db)):
    """
    Returns all recruitment activities pending review (SUBMITTED, UNDER_REVIEW).
    """
    pending = db.query(RecruitmentActivity).filter(
        RecruitmentActivity.status.in_(["SUBMITTED", "UNDER_REVIEW"])
    ).order_by(RecruitmentActivity.created_at.asc()).all()
    
    return [format_activity_response(a) for a in pending]

@router.get("/history", response_model=List[ApprovalResponse])
def get_approval_history(db: Session = Depends(get_db)):
    approvals = db.query(Approval).order_by(Approval.decision_date.desc()).all()
    results = []
    for app in approvals:
        results.append({
            "approval_id": app.approval_id,
            "activity_id": app.activity_id,
            "approver_id": app.approver_id,
            "decision": app.decision,
            "comments": app.comments,
            "decision_date": app.decision_date,
            "approver_name": app.approver.name if app.approver else "Approver"
        })
    return results

@router.post("/{activity_id}/decide", response_model=ApprovalResponse)
def decide_recruitment_activity(
    activity_id: int,
    decision_data: ApprovalCreate,
    approver_id: int = Query(..., description="ID of authenticated approving authority"),
    db: Session = Depends(get_db)
):
    """
    Realizes UC-009 (Approve) and UC-010 (Reject).
    BR-010: Every approval decision must record the approver's identity and decision date.
    """
    # Verify approver
    approver = db.query(User).filter(User.user_id == approver_id).first()
    if not approver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Approver user not found.")
    
    if approver.role not in ["APPROVER", "ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to perform this action. Approving authority required."
        )

    activity = db.query(RecruitmentActivity).filter(RecruitmentActivity.activity_id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recruitment activity not found.")

    if activity.status not in ["SUBMITTED", "UNDER_REVIEW"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This activity is not available for review."
        )

    decision = decision_data.decision.upper().strip()
    if decision not in ["APPROVED", "REJECTED"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Decision must be either 'APPROVED' or 'REJECTED'."
        )

    # FR-027: Approver must provide a reason when rejecting
    if decision == "REJECTED":
        if not decision_data.comments or not decision_data.comments.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Please provide a reason for rejection."
            )

    try:
        now = datetime.utcnow()
        approval = Approval(
            activity_id=activity.activity_id,
            approver_id=approver_id,
            decision=decision,
            comments=decision_data.comments.strip() if decision_data.comments else None,
            decision_date=now
        )
        db.add(approval)

        # Update activity status
        activity.status = decision  # APPROVED or REJECTED

        # Append engagement history
        description = (
            f"Recruitment activity '{activity.title}' was APPROVED by {approver.name}."
            if decision == "APPROVED"
            else f"Recruitment activity '{activity.title}' was REJECTED by {approver.name}. Reason: {decision_data.comments.strip()}"
        )
        EngagementHistoryService.append_record(
            db=db,
            company_id=activity.company_id,
            record_type="APPROVAL",
            description=description,
            recorded_by=approver_id
        )

        db.commit()
        db.refresh(approval)

        return {
            "approval_id": approval.approval_id,
            "activity_id": approval.activity_id,
            "approver_id": approval.approver_id,
            "decision": approval.decision,
            "comments": approval.comments,
            "decision_date": approval.decision_date,
            "approver_name": approver.name
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Approval decision could not be processed: {str(e)}"
        )
