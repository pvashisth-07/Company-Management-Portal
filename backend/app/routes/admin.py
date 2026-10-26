from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserResponse, UserUpdate

router = APIRouter(prefix="/api/admin", tags=["Admin Management"])

@router.get("/users", response_model=List[UserResponse])
def get_all_users(admin_id: int = Query(...), db: Session = Depends(get_db)):
    admin = db.query(User).filter(User.user_id == admin_id).first()
    if not admin or admin.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to perform this action. Administrator role required."
        )
    return db.query(User).all()

@router.put("/users/{target_user_id}", response_model=UserResponse)
def update_user_status_or_role(
    target_user_id: int,
    update_data: UserUpdate,
    admin_id: int = Query(...),
    db: Session = Depends(get_db)
):
    admin = db.query(User).filter(User.user_id == admin_id).first()
    if not admin or admin.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to perform this action. Administrator role required."
        )

    user = db.query(User).filter(User.user_id == target_user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if update_data.role:
        if update_data.role not in ["COORDINATOR", "APPROVER", "ADMIN"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role specified.")
        user.role = update_data.role

    if update_data.account_status:
        if update_data.account_status not in ["ACTIVE", "INACTIVE"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid account status.")
        user.account_status = update_data.account_status

    if update_data.name:
        user.name = update_data.name.strip()

    db.commit()
    db.refresh(user)
    return user
