from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

# ----------------- User Schemas -----------------
class UserBase(BaseModel):
    name: str = Field(..., min_length=2)
    email: str
    role: str = "USER"  # USER, COORDINATOR, APPROVER, ADMIN, MANAGEMENT

class UserCreate(UserBase):
    password: str = Field(..., min_length=4)

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    user_id: int
    account_status: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    account_status: Optional[str] = None


# ----------------- Contact Schemas -----------------
class ContactBase(BaseModel):
    name: str = Field(..., min_length=2)
    designation: str
    email: str
    phone: Optional[str] = None
    department: Optional[str] = None

class ContactCreate(ContactBase):
    company_id: int

class ContactUpdate(BaseModel):
    name: Optional[str] = None
    designation: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None

class ContactResponse(ContactBase):
    contact_id: int
    company_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ----------------- Attendee Schemas -----------------
class AttendeeResponse(BaseModel):
    id: int
    attendee_name: str

    class Config:
        from_attributes = True


# ----------------- Visit Schemas -----------------
class VisitCreate(BaseModel):
    company_id: int
    visit_date: str
    purpose: str
    outcome: str
    notes: Optional[str] = None
    attendees: List[str] = []

class VisitUpdate(BaseModel):
    visit_date: Optional[str] = None
    purpose: Optional[str] = None
    outcome: Optional[str] = None
    notes: Optional[str] = None
    attendees: Optional[List[str]] = None

class VisitResponse(BaseModel):
    visit_id: int
    company_id: int
    recorded_by: int
    visit_date: str
    purpose: str
    outcome: str
    notes: Optional[str] = None
    created_at: datetime
    attendees: List[AttendeeResponse] = []
    company_name: Optional[str] = None
    recorder_name: Optional[str] = None

    class Config:
        from_attributes = True


# ----------------- Approval Schemas -----------------
class ApprovalCreate(BaseModel):
    decision: str  # APPROVED, REJECTED
    comments: Optional[str] = None

class ApprovalResponse(BaseModel):
    approval_id: int
    activity_id: int
    approver_id: int
    decision: str
    comments: Optional[str] = None
    decision_date: datetime
    approver_name: Optional[str] = None

    class Config:
        from_attributes = True


# ----------------- Recruitment Activity Schemas -----------------
class RecruitmentActivityCreate(BaseModel):
    company_id: int
    title: str
    type: str  # ON_CAMPUS, VIRTUAL, POOL_CAMPUS, INTERNSHIP_DRIVE, HACKATHON
    activity_date: str
    eligibility_criteria: str
    positions_offered: str
    package_details: Optional[str] = None
    status: Optional[str] = "DRAFT"

class RecruitmentActivityUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    activity_date: Optional[str] = None
    eligibility_criteria: Optional[str] = None
    positions_offered: Optional[str] = None
    package_details: Optional[str] = None
    status: Optional[str] = None

class RecruitmentActivityResponse(BaseModel):
    activity_id: int
    company_id: int
    created_by: int
    title: str
    type: str
    activity_date: str
    eligibility_criteria: str
    positions_offered: str
    package_details: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    company_name: Optional[str] = None
    creator_name: Optional[str] = None
    approvals: List[ApprovalResponse] = []

    class Config:
        from_attributes = True


# ----------------- Engagement Record Schemas -----------------
class EngagementRecordResponse(BaseModel):
    record_id: int
    company_id: int
    type: str
    description: str
    record_date: datetime
    recorded_by: Optional[int] = None
    recorder_name: Optional[str] = None
    archived: bool

    class Config:
        from_attributes = True


# ----------------- Company Schemas -----------------
class CompanyBase(BaseModel):
    name: str = Field(..., min_length=2)
    industry: str
    address: Optional[str] = None
    website: Optional[str] = None
    status: str = "ACTIVE"
    notes: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class CompanyResponse(CompanyBase):
    company_id: int
    created_at: datetime
    contacts_count: Optional[int] = 0
    visits_count: Optional[int] = 0
    activities_count: Optional[int] = 0

    class Config:
        from_attributes = True

class CompanyDetailResponse(CompanyResponse):
    contacts: List[ContactResponse] = []
    visits: List[VisitResponse] = []
    activities: List[RecruitmentActivityResponse] = []
    engagement_timeline: List[EngagementRecordResponse] = []

    class Config:
        from_attributes = True


# ----------------- Dashboard & Stats Schemas -----------------
class DashboardStats(BaseModel):
    total_companies: int
    active_companies: int
    total_visits: int
    total_activities: int
    pending_approvals: int
    approved_activities: int
    industry_breakdown: dict
    activity_status_breakdown: dict
    recent_engagements: List[EngagementRecordResponse]
