from typing import List, Tuple
from sqlalchemy.orm import Session
from ..models import Company, RecruitmentActivity

class ValidationResult:
    def __init__(self, is_valid: bool, errors: List[str]):
        self.is_valid = is_valid
        self.errors = errors

class ValidationService:
    @staticmethod
    def validate_company_exists(db: Session, company_id: int) -> bool:
        company = db.query(Company).filter(Company.company_id == company_id).first()
        return company is not None

    @staticmethod
    def validate_visit_data(data: dict) -> ValidationResult:
        errors = []
        if not data.get("company_id"):
            errors.append("Company is required.")
        if not data.get("visit_date") or not str(data.get("visit_date")).strip():
            errors.append("Visit date is required.")
        if not data.get("purpose") or not str(data.get("purpose")).strip():
            errors.append("Purpose of visit is required.")
        if not data.get("outcome") or not str(data.get("outcome")).strip():
            errors.append("Visit outcome is required.")
        attendees = data.get("attendees", [])
        if not attendees or len(attendees) == 0:
            errors.append("At least one attendee is required.")

        return ValidationResult(len(errors) == 0, errors)

    @staticmethod
    def validate_activity_data(data: dict) -> ValidationResult:
        errors = []
        if not data.get("company_id"):
            errors.append("Company is required.")
        if not data.get("title") or not str(data.get("title")).strip():
            errors.append("Activity title is required.")
        if not data.get("type") or not str(data.get("type")).strip():
            errors.append("Activity type is required.")
        if not data.get("activity_date") or not str(data.get("activity_date")).strip():
            errors.append("Activity date is required.")
        if not data.get("eligibility_criteria") or not str(data.get("eligibility_criteria")).strip():
            errors.append("Eligibility criteria is required.")
        if not data.get("positions_offered") or not str(data.get("positions_offered")).strip():
            errors.append("Positions offered is required.")

        return ValidationResult(len(errors) == 0, errors)

    @staticmethod
    def validate_submittable_status(activity: RecruitmentActivity) -> ValidationResult:
        errors = []
        if activity.status == "CANCELLED":
            errors.append("Cancelled recruitment activities cannot be modified or submitted.")
        elif activity.status not in ["DRAFT", "REVISION"]:
            errors.append(f"Only DRAFT or REVISION activities can be submitted for approval (current status: {activity.status}).")

        return ValidationResult(len(errors) == 0, errors)

    @staticmethod
    def validate_reviewable_status(activity: RecruitmentActivity) -> ValidationResult:
        errors = []
        if activity.status not in ["SUBMITTED", "UNDER_REVIEW"]:
            errors.append("This activity is not in a pending review state.")
        return ValidationResult(len(errors) == 0, errors)
