import csv
import io
from collections import Counter
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Company, Visit, RecruitmentActivity, Approval, EngagementRecord, User
from ..schemas import DashboardStats

router = APIRouter(prefix="/api/reports", tags=["Reports & Analytics"])

@router.get("/dashboard-stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    companies = db.query(Company).all()
    visits = db.query(Visit).all()
    activities = db.query(RecruitmentActivity).all()
    
    total_companies = len(companies)
    active_companies = len([c for c in companies if c.status == "ACTIVE"])
    total_visits = len(visits)
    total_activities = len(activities)
    pending_approvals = len([a for a in activities if a.status in ["SUBMITTED", "UNDER_REVIEW"]])
    approved_activities = len([a for a in activities if a.status in ["APPROVED", "SCHEDULED", "ONGOING", "COMPLETED"]])

    # Sector / Industry distribution
    industry_counts = dict(Counter([c.industry for c in companies if c.industry]))

    # Status distribution for activities
    activity_status_counts = dict(Counter([a.status for a in activities]))

    # Recent engagements
    recent_records = db.query(EngagementRecord).filter(
        EngagementRecord.archived == False
    ).order_by(EngagementRecord.record_date.desc()).limit(10).all()

    recent_list = []
    for r in recent_records:
        recent_list.append({
            "record_id": r.record_id,
            "company_id": r.company_id,
            "type": r.type,
            "description": r.description,
            "record_date": r.record_date,
            "recorded_by": r.recorded_by,
            "recorder_name": r.recorder.name if r.recorder else "System",
            "archived": r.archived
        })

    return {
        "total_companies": total_companies,
        "active_companies": active_companies,
        "total_visits": total_visits,
        "total_activities": total_activities,
        "pending_approvals": pending_approvals,
        "approved_activities": approved_activities,
        "industry_breakdown": industry_counts,
        "activity_status_breakdown": activity_status_counts,
        "recent_engagements": recent_list
    }

@router.get("/export/companies-csv")
def export_companies_csv(db: Session = Depends(get_db)):
    companies = db.query(Company).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Company ID", "Name", "Industry", "Status", "Address", "Website", "Contacts Count", "Visits Count", "Activities Count", "Created At"])
    for c in companies:
        writer.writerow([
            c.company_id,
            c.name,
            c.industry,
            c.status,
            c.address or "",
            c.website or "",
            len(c.contacts),
            len(c.visits),
            len(c.activities),
            c.created_at.strftime("%Y-%m-%d %H:%M:%S") if c.created_at else ""
        ])
    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=companies_report.csv"}
    )

@router.get("/export/visits-csv")
def export_visits_csv(db: Session = Depends(get_db)):
    visits = db.query(Visit).order_by(Visit.created_at.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Visit ID", "Company", "Visit Date", "Purpose", "Attendees", "Outcome", "Recorded By", "Created At"])
    for v in visits:
        attendees = ", ".join([a.attendee_name for a in v.attendees])
        writer.writerow([
            v.visit_id,
            v.company.name if v.company else "Unknown",
            v.visit_date,
            v.purpose,
            attendees,
            v.outcome,
            v.recorder.name if v.recorder else "N/A",
            v.created_at.strftime("%Y-%m-%d %H:%M:%S") if v.created_at else ""
        ])
    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=visits_report.csv"}
    )

@router.get("/export/activities-csv")
def export_activities_csv(db: Session = Depends(get_db)):
    activities = db.query(RecruitmentActivity).order_by(RecruitmentActivity.created_at.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Activity ID", "Company", "Title", "Type", "Activity Date", "Status", "Positions Offered", "Package Details", "Created By", "Created At"])
    for a in activities:
        writer.writerow([
            a.activity_id,
            a.company.name if a.company else "Unknown",
            a.title,
            a.type,
            a.activity_date,
            a.status,
            a.positions_offered,
            a.package_details or "",
            a.creator.name if a.creator else "N/A",
            a.created_at.strftime("%Y-%m-%d %H:%M:%S") if a.created_at else ""
        ])
    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=recruitment_activities_report.csv"}
    )
