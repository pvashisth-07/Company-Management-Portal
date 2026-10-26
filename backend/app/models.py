from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="COORDINATOR")  # COORDINATOR, APPROVER, ADMIN
    account_status = Column(String(20), nullable=False, default="ACTIVE")  # ACTIVE, INACTIVE
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    recorded_visits = relationship("Visit", back_populates="recorder", foreign_keys="Visit.recorded_by")
    created_activities = relationship("RecruitmentActivity", back_populates="creator", foreign_keys="RecruitmentActivity.created_by")
    approvals = relationship("Approval", back_populates="approver", foreign_keys="Approval.approver_id")
    engagement_records = relationship("EngagementRecord", back_populates="recorder", foreign_keys="EngagementRecord.recorded_by")


class Company(Base):
    __tablename__ = "companies"

    company_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), unique=True, index=True, nullable=False)  # BR-004 unique
    industry = Column(String(100), nullable=False)
    address = Column(String(255), nullable=True)
    website = Column(String(200), nullable=True)
    status = Column(String(20), nullable=False, default="ACTIVE")  # ACTIVE, INACTIVE, ARCHIVED
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    contacts = relationship("Contact", back_populates="company", cascade="all, delete-orphan")
    visits = relationship("Visit", back_populates="company", cascade="all, delete-orphan")
    activities = relationship("RecruitmentActivity", back_populates="company", cascade="all, delete-orphan")
    engagement_records = relationship("EngagementRecord", back_populates="company", cascade="all, delete-orphan")


class Contact(Base):
    __tablename__ = "contacts"

    contact_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    designation = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False)
    phone = Column(String(50), nullable=True)
    department = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    company = relationship("Company", back_populates="contacts")


class Visit(Base):
    __tablename__ = "visits"

    visit_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=False, index=True)
    recorded_by = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    visit_date = Column(String(50), nullable=False)  # Format YYYY-MM-DD or DD-MM-YYYY
    purpose = Column(String(255), nullable=False)
    outcome = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    company = relationship("Company", back_populates="visits")
    recorder = relationship("User", back_populates="recorded_visits", foreign_keys=[recorded_by])
    attendees = relationship("VisitAttendee", back_populates="visit", cascade="all, delete-orphan")


class VisitAttendee(Base):
    __tablename__ = "visit_attendees"

    id = Column(Integer, primary_key=True, autoincrement=True)
    visit_id = Column(Integer, ForeignKey("visits.visit_id"), nullable=False, index=True)
    attendee_name = Column(String(150), nullable=False)

    # Relationship
    visit = relationship("Visit", back_populates="attendees")


class RecruitmentActivity(Base):
    __tablename__ = "recruitment_activities"

    activity_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=False, index=True)
    created_by = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    title = Column(String(200), nullable=False)
    type = Column(String(50), nullable=False)  # ON_CAMPUS, VIRTUAL, POOL_CAMPUS, INTERNSHIP_DRIVE, HACKATHON
    activity_date = Column(String(50), nullable=False)
    eligibility_criteria = Column(Text, nullable=False)
    positions_offered = Column(Text, nullable=False)
    package_details = Column(String(100), nullable=True)
    status = Column(String(30), nullable=False, default="DRAFT")  # DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, REVISION, SCHEDULED, ONGOING, COMPLETED, CANCELLED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    company = relationship("Company", back_populates="activities")
    creator = relationship("User", back_populates="created_activities", foreign_keys=[created_by])
    approvals = relationship("Approval", back_populates="activity", cascade="all, delete-orphan")


class Approval(Base):
    __tablename__ = "approvals"

    approval_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    activity_id = Column(Integer, ForeignKey("recruitment_activities.activity_id"), nullable=False, index=True)
    approver_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    decision = Column(String(20), nullable=False)  # APPROVED, REJECTED
    comments = Column(Text, nullable=True)
    decision_date = Column(DateTime, default=datetime.utcnow)

    # Relationships
    activity = relationship("RecruitmentActivity", back_populates="approvals")
    approver = relationship("User", back_populates="approvals", foreign_keys=[approver_id])


class EngagementRecord(Base):
    __tablename__ = "engagement_records"

    record_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # VISIT, CONTACT_UPDATE, ACTIVITY, STATUS_CHANGE, APPROVAL
    description = Column(Text, nullable=False)
    record_date = Column(DateTime, default=datetime.utcnow)
    recorded_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    archived = Column(Boolean, default=False, nullable=False)  # BR-008: history records archived, not deleted

    # Relationships
    company = relationship("Company", back_populates="engagement_records")
    recorder = relationship("User", back_populates="engagement_records", foreign_keys=[recorded_by])
