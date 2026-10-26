from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Company, Contact, Visit, RecruitmentActivity, EngagementRecord
from ..schemas import CompanyCreate, CompanyUpdate, CompanyResponse, CompanyDetailResponse
from ..services.engagement_service import EngagementHistoryService

router = APIRouter(prefix="/api/companies", tags=["Companies"])

@router.get("", response_model=List[CompanyResponse])
def get_companies(
    search: Optional[str] = Query(None, description="Search by company name"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    db: Session = Depends(get_db)
):
    query = db.query(Company)
    
    if search:
        query = query.filter(Company.name.ilike(f"%{search.strip()}%"))
    if industry and industry != "All":
        query = query.filter(Company.industry == industry)
    if status_filter and status_filter != "All":
        query = query.filter(Company.status == status_filter)
        
    companies = query.order_by(Company.name.asc()).all()
    
    # Calculate counts for each company
    results = []
    for c in companies:
        c_dict = {
            "company_id": c.company_id,
            "name": c.name,
            "industry": c.industry,
            "address": c.address,
            "website": c.website,
            "status": c.status,
            "notes": c.notes,
            "created_at": c.created_at,
            "contacts_count": len(c.contacts),
            "visits_count": len(c.visits),
            "activities_count": len(c.activities)
        }
        results.append(c_dict)
        
    return results

@router.get("/{company_id}", response_model=CompanyDetailResponse)
def get_company_detail(company_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.company_id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company profile does not exist. Please create the profile first."
        )
        
    timeline_records = EngagementHistoryService.get_timeline(db, company_id)
    timeline_responses = []
    for r in timeline_records:
        rec_dict = {
            "record_id": r.record_id,
            "company_id": r.company_id,
            "type": r.type,
            "description": r.description,
            "record_date": r.record_date,
            "recorded_by": r.recorded_by,
            "recorder_name": r.recorder.name if r.recorder else "System",
            "archived": r.archived
        }
        timeline_responses.append(rec_dict)

    visits_list = []
    for v in company.visits:
        v_dict = {
            "visit_id": v.visit_id,
            "company_id": v.company_id,
            "recorded_by": v.recorded_by,
            "visit_date": v.visit_date,
            "purpose": v.purpose,
            "outcome": v.outcome,
            "notes": v.notes,
            "created_at": v.created_at,
            "attendees": [{"id": a.id, "attendee_name": a.attendee_name} for a in v.attendees],
            "company_name": company.name,
            "recorder_name": v.recorder.name if v.recorder else "Unknown"
        }
        visits_list.append(v_dict)

    activities_list = []
    for a in company.activities:
        act_dict = {
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
            "company_name": company.name,
            "creator_name": a.creator.name if a.creator else "Unknown",
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
        activities_list.append(act_dict)

    return {
        "company_id": company.company_id,
        "name": company.name,
        "industry": company.industry,
        "address": company.address,
        "website": company.website,
        "status": company.status,
        "notes": company.notes,
        "created_at": company.created_at,
        "contacts_count": len(company.contacts),
        "visits_count": len(company.visits),
        "activities_count": len(company.activities),
        "contacts": company.contacts,
        "visits": visits_list,
        "activities": activities_list,
        "engagement_timeline": timeline_responses
    }

@router.post("", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
def create_company(
    company_data: CompanyCreate,
    user_id: Optional[int] = Query(None, description="ID of coordinator creating company"),
    db: Session = Depends(get_db)
):
    # BR-004: A company profile cannot be duplicated for the same company.
    existing = db.query(Company).filter(Company.name.ilike(company_data.name.strip())).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Company profile '{company_data.name}' already exists."
        )
        
    company = Company(
        name=company_data.name.strip(),
        industry=company_data.industry.strip(),
        address=company_data.address.strip() if company_data.address else None,
        website=company_data.website.strip() if company_data.website else None,
        status=company_data.status or "ACTIVE",
        notes=company_data.notes
    )
    db.add(company)
    db.commit()
    db.refresh(company)

    # Log initial engagement record
    EngagementHistoryService.append_record(
        db=db,
        company_id=company.company_id,
        record_type="STATUS_CHANGE",
        description=f"Company profile created for {company.name} in {company.industry} sector.",
        recorded_by=user_id
    )

    return {
        "company_id": company.company_id,
        "name": company.name,
        "industry": company.industry,
        "address": company.address,
        "website": company.website,
        "status": company.status,
        "notes": company.notes,
        "created_at": company.created_at,
        "contacts_count": 0,
        "visits_count": 0,
        "activities_count": 0
    }

@router.put("/{company_id}", response_model=CompanyResponse)
def update_company(
    company_id: int,
    company_data: CompanyUpdate,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    company = db.query(Company).filter(Company.company_id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found."
        )

    if company_data.name and company_data.name.strip().lower() != company.name.lower():
        # Check duplicate
        existing = db.query(Company).filter(Company.name.ilike(company_data.name.strip())).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Another company with name '{company_data.name}' already exists."
            )
        company.name = company_data.name.strip()

    if company_data.industry is not None:
        company.industry = company_data.industry.strip()
    if company_data.address is not None:
        company.address = company_data.address.strip()
    if company_data.website is not None:
        company.website = company_data.website.strip()
    if company_data.status is not None:
        old_status = company.status
        company.status = company_data.status
        if old_status != company_data.status:
            EngagementHistoryService.append_record(
                db, company.company_id, "STATUS_CHANGE",
                f"Company status changed from {old_status} to {company_data.status}.",
                recorded_by=user_id
            )
    if company_data.notes is not None:
        company.notes = company_data.notes

    db.commit()
    db.refresh(company)

    return {
        "company_id": company.company_id,
        "name": company.name,
        "industry": company.industry,
        "address": company.address,
        "website": company.website,
        "status": company.status,
        "notes": company.notes,
        "created_at": company.created_at,
        "contacts_count": len(company.contacts),
        "visits_count": len(company.visits),
        "activities_count": len(company.activities)
    }

@router.delete("/{company_id}", status_code=status.HTTP_200_OK)
def deactivate_company(company_id: int, user_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.company_id == company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found.")
    
    company.status = "ARCHIVED"
    db.commit()
    EngagementHistoryService.append_record(
        db, company.company_id, "STATUS_CHANGE",
        f"Company profile archived/deactivated.",
        recorded_by=user_id
    )
    return {"message": f"Company '{company.name}' has been archived."}
