from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth import get_current_user
from app.db.dependency import get_db
from app.db.models import Tenant, User

router = APIRouter()

class TenantCreate(BaseModel):
    name: str
    legal_name: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    city: Optional[str] = None

class TenantUpdate(BaseModel):
    name: Optional[str] = None
    legal_name: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    city: Optional[str] = None
    status: Optional[str] = None

@router.get("/")
async def get_tenants(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "platform_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    result = await db.execute(select(Tenant).offset(skip).limit(limit))
    tenants = result.scalars().all()
    
    return [
        {
            "id": str(tenant.id),
            "name": tenant.name,
            "legal_name": tenant.legal_name,
            "description": tenant.description,
            "industry": tenant.industry,
            "city": tenant.city,
            "status": tenant.status,
            "tier": tenant.tier,
            "created_at": tenant.created_at,
        }
        for tenant in tenants
    ]

@router.get("/{tenant_id}")
async def get_tenant(
    tenant_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "tenant_admin" and str(current_user.tenant_id) != tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
    
    return {
        "id": str(tenant.id),
        "name": tenant.name,
        "legal_name": tenant.legal_name,
        "description": tenant.description,
        "industry": tenant.industry,
        "city": tenant.city,
        "status": tenant.status,
        "tier": tenant.tier,
        "created_at": tenant.created_at,
    }

@router.post("/")
async def create_tenant(
    tenant_data: TenantCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "platform_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    new_tenant = Tenant(
        name=tenant_data.name,
        legal_name=tenant_data.legal_name,
        description=tenant_data.description,
        industry=tenant_data.industry,
        city=tenant_data.city,
    )
    
    db.add(new_tenant)
    await db.commit()
    await db.refresh(new_tenant)
    
    return {
        "id": str(new_tenant.id),
        "name": new_tenant.name,
        "legal_name": new_tenant.legal_name,
        "description": new_tenant.description,
        "industry": new_tenant.industry,
        "city": new_tenant.city,
        "status": new_tenant.status,
        "tier": new_tenant.tier,
        "created_at": new_tenant.created_at,
    }

@router.put("/{tenant_id}")
async def update_tenant(
    tenant_id: str,
    tenant_data: TenantUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "tenant_admin" and str(current_user.tenant_id) != tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
    
    if tenant_data.name is not None:
        tenant.name = tenant_data.name
    if tenant_data.legal_name is not None:
        tenant.legal_name = tenant_data.legal_name
    if tenant_data.description is not None:
        tenant.description = tenant_data.description
    if tenant_data.industry is not None:
        tenant.industry = tenant_data.industry
    if tenant_data.city is not None:
        tenant.city = tenant_data.city
    if tenant_data.status is not None:
        tenant.status = tenant_data.status
    
    await db.commit()
    await db.refresh(tenant)
    
    return {
        "id": str(tenant.id),
        "name": tenant.name,
        "legal_name": tenant.legal_name,
        "description": tenant.description,
        "industry": tenant.industry,
        "city": tenant.city,
        "status": tenant.status,
        "tier": tenant.tier,
    }

@router.delete("/{tenant_id}")
async def delete_tenant(
    tenant_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "platform_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
    
    await db.delete(tenant)
    await db.commit()
    
    return {"message": "Tenant deleted successfully"}