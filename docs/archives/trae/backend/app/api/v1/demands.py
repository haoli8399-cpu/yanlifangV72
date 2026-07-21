from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth import get_current_user
from app.db.dependency import get_db
from app.db.models import Demand, User

router = APIRouter()

class DemandCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: Optional[str] = None
    event_date: Optional[date] = None
    city: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None

class DemandUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[str] = None
    event_date: Optional[date] = None
    city: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    maturity: Optional[str] = None
    readiness: Optional[str] = None
    lifecycle: Optional[str] = None
    publication: Optional[str] = None

@router.get("/")
async def get_demands(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "customer":
        result = await db.execute(select(Demand).where(Demand.customer_id == current_user.id).offset(skip).limit(limit))
    elif current_user.role == "tenant_admin":
        result = await db.execute(select(Demand).where(Demand.tenant_id == current_user.tenant_id).offset(skip).limit(limit))
    elif current_user.role == "platform_admin":
        result = await db.execute(select(Demand).offset(skip).limit(limit))
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    demands = result.scalars().all()
    
    return [
        {
            "id": str(demand.id),
            "title": demand.title,
            "description": demand.description,
            "event_type": demand.event_type,
            "event_date": demand.event_date,
            "city": demand.city,
            "budget_min": float(demand.budget_min) if demand.budget_min else None,
            "budget_max": float(demand.budget_max) if demand.budget_max else None,
            "maturity": demand.maturity,
            "readiness": demand.readiness,
            "lifecycle": demand.lifecycle,
            "publication": demand.publication,
            "evidence": demand.evidence,
            "customer_id": str(demand.customer_id),
            "tenant_id": str(demand.tenant_id) if demand.tenant_id else None,
            "created_at": demand.created_at,
        }
        for demand in demands
    ]

@router.get("/{demand_id}")
async def get_demand(
    demand_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Demand).where(Demand.id == demand_id))
    demand = result.scalar_one_or_none()
    
    if not demand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demand not found")
    
    if (
        current_user.role == "customer" and str(current_user.id) != str(demand.customer_id)
    ) or (
        current_user.role == "tenant_admin" and str(current_user.tenant_id) != str(demand.tenant_id)
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return {
        "id": str(demand.id),
        "title": demand.title,
        "description": demand.description,
        "event_type": demand.event_type,
        "event_date": demand.event_date,
        "city": demand.city,
        "budget_min": float(demand.budget_min) if demand.budget_min else None,
        "budget_max": float(demand.budget_max) if demand.budget_max else None,
        "maturity": demand.maturity,
        "readiness": demand.readiness,
        "lifecycle": demand.lifecycle,
        "publication": demand.publication,
        "evidence": demand.evidence,
        "customer_id": str(demand.customer_id),
        "tenant_id": str(demand.tenant_id) if demand.tenant_id else None,
        "created_at": demand.created_at,
    }

@router.post("/")
async def create_demand(
    demand_data: DemandCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "customer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    new_demand = Demand(
        customer_id=current_user.id,
        title=demand_data.title,
        description=demand_data.description,
        event_type=demand_data.event_type,
        event_date=demand_data.event_date,
        city=demand_data.city,
        budget_min=demand_data.budget_min,
        budget_max=demand_data.budget_max,
    )
    
    db.add(new_demand)
    await db.commit()
    await db.refresh(new_demand)
    
    return {
        "id": str(new_demand.id),
        "title": new_demand.title,
        "description": new_demand.description,
        "event_type": new_demand.event_type,
        "event_date": new_demand.event_date,
        "city": new_demand.city,
        "budget_min": float(new_demand.budget_min) if new_demand.budget_min else None,
        "budget_max": float(new_demand.budget_max) if new_demand.budget_max else None,
        "maturity": new_demand.maturity,
        "readiness": new_demand.readiness,
        "lifecycle": new_demand.lifecycle,
        "publication": new_demand.publication,
        "evidence": new_demand.evidence,
        "customer_id": str(new_demand.customer_id),
        "created_at": new_demand.created_at,
    }

@router.put("/{demand_id}")
async def update_demand(
    demand_id: str,
    demand_data: DemandUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Demand).where(Demand.id == demand_id))
    demand = result.scalar_one_or_none()
    
    if not demand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demand not found")
    
    if (
        current_user.role == "customer" and str(current_user.id) != str(demand.customer_id)
    ) or (
        current_user.role == "tenant_admin" and str(current_user.tenant_id) != str(demand.tenant_id)
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    if demand_data.title is not None:
        demand.title = demand_data.title
    if demand_data.description is not None:
        demand.description = demand_data.description
    if demand_data.event_type is not None:
        demand.event_type = demand_data.event_type
    if demand_data.event_date is not None:
        demand.event_date = demand_data.event_date
    if demand_data.city is not None:
        demand.city = demand_data.city
    if demand_data.budget_min is not None:
        demand.budget_min = demand_data.budget_min
    if demand_data.budget_max is not None:
        demand.budget_max = demand_data.budget_max
    if demand_data.maturity is not None:
        demand.maturity = demand_data.maturity
    if demand_data.readiness is not None:
        demand.readiness = demand_data.readiness
    if demand_data.lifecycle is not None:
        demand.lifecycle = demand_data.lifecycle
    if demand_data.publication is not None:
        demand.publication = demand_data.publication
    
    await db.commit()
    await db.refresh(demand)
    
    return {
        "id": str(demand.id),
        "title": demand.title,
        "description": demand.description,
        "event_type": demand.event_type,
        "event_date": demand.event_date,
        "city": demand.city,
        "budget_min": float(demand.budget_min) if demand.budget_min else None,
        "budget_max": float(demand.budget_max) if demand.budget_max else None,
        "maturity": demand.maturity,
        "readiness": demand.readiness,
        "lifecycle": demand.lifecycle,
        "publication": demand.publication,
        "evidence": demand.evidence,
    }

@router.delete("/{demand_id}")
async def delete_demand(
    demand_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Demand).where(Demand.id == demand_id))
    demand = result.scalar_one_or_none()
    
    if not demand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demand not found")
    
    if current_user.role == "customer" and str(current_user.id) != str(demand.customer_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    await db.delete(demand)
    await db.commit()
    
    return {"message": "Demand deleted successfully"}