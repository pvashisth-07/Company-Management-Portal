from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from ..models import EngagementRecord, User

class EngagementHistoryService:
    @staticmethod
    def append_record(
        db: Session,
        company_id: int,
        record_type: str,
        description: str,
        recorded_by: Optional[int] = None
    ) -> EngagementRecord:
        record = EngagementRecord(
            company_id=company_id,
            type=record_type,
            description=description,
            record_date=datetime.utcnow(),
            recorded_by=recorded_by,
            archived=False
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def get_timeline(db: Session, company_id: int, include_archived: bool = False) -> List[EngagementRecord]:
        query = db.query(EngagementRecord).filter(EngagementRecord.company_id == company_id)
        if not include_archived:
            query = query.filter(EngagementRecord.archived == False)
        return query.order_by(EngagementRecord.record_date.desc()).all()

    @staticmethod
    def archive_record(db: Session, record_id: int) -> bool:
        record = db.query(EngagementRecord).filter(EngagementRecord.record_id == record_id).first()
        if not record:
            return False
        record.archived = True
        db.commit()
        return True
