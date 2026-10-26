from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Contact, Company
from ..schemas import ContactCreate, ContactUpdate, ContactResponse
from ..services.engagement_service import EngagementHistoryService

router = APIRouter(prefix="/api/contacts", tags=["Contacts"])

@router.get("/company/{company_id}", response_model=List[ContactResponse])
def get_contacts_by_company(company_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.company_id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company profile does not exist. Please create the profile first."
        )
    return db.query(Contact).filter(Contact.company_id == company_id).all()

@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def create_contact(
    contact_data: ContactCreate,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    # BR-009: Each company contact must be linked to an existing company profile
    company = db.query(Company).filter(Company.company_id == contact_data.company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cannot add contact: Company profile does not exist. Please create the profile first."
        )

    contact = Contact(
        company_id=contact_data.company_id,
        name=contact_data.name.strip(),
        designation=contact_data.designation.strip(),
        email=contact_data.email.strip(),
        phone=contact_data.phone.strip() if contact_data.phone else None,
        department=contact_data.department.strip() if contact_data.department else None
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)

    # Log engagement record
    EngagementHistoryService.append_record(
        db=db,
        company_id=company.company_id,
        record_type="CONTACT_UPDATE",
        description=f"Added primary contact {contact.name} ({contact.designation}, {contact.department or 'N/A'}).",
        recorded_by=user_id
    )

    return contact

@router.put("/{contact_id}", response_model=ContactResponse)
def update_contact(
    contact_id: int,
    contact_data: ContactUpdate,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    contact = db.query(Contact).filter(Contact.contact_id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found.")

    if contact_data.name is not None:
        contact.name = contact_data.name.strip()
    if contact_data.designation is not None:
        contact.designation = contact_data.designation.strip()
    if contact_data.email is not None:
        contact.email = contact_data.email.strip()
    if contact_data.phone is not None:
        contact.phone = contact_data.phone.strip()
    if contact_data.department is not None:
        contact.department = contact_data.department.strip()

    db.commit()
    db.refresh(contact)

    EngagementHistoryService.append_record(
        db=db,
        company_id=contact.company_id,
        record_type="CONTACT_UPDATE",
        description=f"Updated contact information for {contact.name}.",
        recorded_by=user_id
    )

    return contact

@router.delete("/{contact_id}")
def delete_contact(contact_id: int, user_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    contact = db.query(Contact).filter(Contact.contact_id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found.")

    company_id = contact.company_id
    contact_name = contact.name
    db.delete(contact)
    db.commit()

    EngagementHistoryService.append_record(
        db=db,
        company_id=company_id,
        record_type="CONTACT_UPDATE",
        description=f"Removed contact person {contact_name}.",
        recorded_by=user_id
    )

    return {"message": f"Contact '{contact_name}' removed successfully."}
