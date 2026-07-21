from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth import get_current_user
from app.db.dependency import get_db
from app.db.models import ProgramModule, ServiceOffering, User

router = APIRouter()

class ProgramCreate(BaseModel):
    name: str
    category: Optional[str] = None
    description: Optional[str] = None

class ProgramUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    readiness: Optional[str] = None
    lifecycle: Optional[str] = None
    publication: Optional[str] = None

class OfferingCreate(BaseModel):
    name: str
    description: Optional[str] = None

class OfferingUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    readiness: Optional[str] = None
    lifecycle: Optional[str] = None
    publication: Optional[str] = None

@router.get("/programs")
async def get_programs(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "platform_admin":
        result = await db.execute(select(ProgramModule).offset(skip).limit(limit))
    elif current_user.role == "tenant_admin":
        result = await db.execute(select(ProgramModule).where(ProgramModule.tenant_id == current_user.tenant_id).offset(skip).limit(limit))
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    programs = result.scalars().all()
    
    return [
        {
            "id": str(program.id),
            "tenant_id": str(program.tenant_id),
            "name": program.name,
            "category": program.category,
            "description": program.description,
            "readiness": program.readiness,
            "lifecycle": program.lifecycle,
            "publication": program.publication,
            "evidence": program.evidence,
            "created_at": program.created_at,
        }
        for program in programs
    ]

@router.post("/programs")
async def create_program(
    program_data: ProgramCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "tenant_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    new_program = ProgramModule(
        tenant_id=current_user.tenant_id,
        name=program_data.name,
        category=program_data.category,
        description=program_data.description,
    )
    
    db.add(new_program)
    await db.commit()
    await db.refresh(new_program)
    
    return {
        "id": str(new_program.id),
        "tenant_id": str(new_program.tenant_id),
        "name": new_program.name,
        "category": new_program.category,
        "description": new_program.description,
        "readiness": new_program.readiness,
        "lifecycle": new_program.lifecycle,
        "publication": new_program.publication,
        "evidence": new_program.evidence,
        "created_at": new_program.created_at,
    }

@router.get("/programs/{program_id}")
async def get_program(
    program_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(ProgramModule).where(ProgramModule.id == program_id))
    program = result.scalar_one_or_none()
    
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")
    
    if current_user.role == "tenant_admin" and str(program.tenant_id) != str(current_user.tenant_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return {
        "id": str(program.id),
        "tenant_id": str(program.tenant_id),
        "name": program.name,
        "category": program.category,
        "description": program.description,
        "readiness": program.readiness,
        "lifecycle": program.lifecycle,
        "publication": program.publication,
        "evidence": program.evidence,
        "created_at": program.created_at,
    }

@router.put("/programs/{program_id}")
async def update_program(
    program_id: str,
    program_data: ProgramUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(ProgramModule).where(ProgramModule.id == program_id))
    program = result.scalar_one_or_none()
    
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")
    
    if current_user.role == "tenant_admin" and str(program.tenant_id) != str(current_user.tenant_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    if program_data.name is not None:
        program.name = program_data.name
    if program_data.category is not None:
        program.category = program_data.category
    if program_data.description is not None:
        program.description = program_data.description
    if program_data.readiness is not None:
        program.readiness = program_data.readiness
    if program_data.lifecycle is not None:
        program.lifecycle = program_data.lifecycle
    if program_data.publication is not None:
        program.publication = program_data.publication
    
    await db.commit()
    await db.refresh(program)
    
    return {
        "id": str(program.id),
        "tenant_id": str(program.tenant_id),
        "name": program.name,
        "category": program.category,
        "description": program.description,
        "readiness": program.readiness,
        "lifecycle": program.lifecycle,
        "publication": program.publication,
        "evidence": program.evidence,
    }

@router.get("/offerings")
async def get_offerings(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "platform_admin":
        result = await db.execute(select(ServiceOffering).offset(skip).limit(limit))
    elif current_user.role == "tenant_admin":
        result = await db.execute(select(ServiceOffering).where(ServiceOffering.tenant_id == current_user.tenant_id).offset(skip).limit(limit))
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    offerings = result.scalars().all()
    
    return [
        {
            "id": str(offering.id),
            "tenant_id": str(offering.tenant_id),
            "name": offering.name,
            "description": offering.description,
            "readiness": offering.readiness,
            "lifecycle": offering.lifecycle,
            "publication": offering.publication,
            "evidence": offering.evidence,
            "created_at": offering.created_at,
        }
        for offering in offerings
    ]

@router.post("/offerings")
async def create_offering(
    offering_data: OfferingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "tenant_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    new_offering = ServiceOffering(
        tenant_id=current_user.tenant_id,
        name=offering_data.name,
        description=offering_data.description,
    )
    
    db.add(new_offering)
    await db.commit()
    await db.refresh(new_offering)
    
    return {
        "id": str(new_offering.id),
        "tenant_id": str(new_offering.tenant_id),
        "name": new_offering.name,
        "description": new_offering.description,
        "readiness": new_offering.readiness,
        "lifecycle": new_offering.lifecycle,
        "publication": new_offering.publication,
        "evidence": new_offering.evidence,
        "created_at": new_offering.created_at,
    }

@router.get("/offerings/{offering_id}")
async def get_offering(
    offering_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(ServiceOffering).where(ServiceOffering.id == offering_id))
    offering = result.scalar_one_or_none()
    
    if not offering:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offering not found")
    
    if current_user.role == "tenant_admin" and str(offering.tenant_id) != str(current_user.tenant_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return {
        "id": str(offering.id),
        "tenant_id": str(offering.tenant_id),
        "name": offering.name,
        "description": offering.description,
        "readiness": offering.readiness,
        "lifecycle": offering.lifecycle,
        "publication": offering.publication,
        "evidence": offering.evidence,
        "created_at": offering.created_at,
    }

@router.put("/offerings/{offering_id}")
async def update_offering(
    offering_id: str,
    offering_data: OfferingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(ServiceOffering).where(ServiceOffering.id == offering_id))
    offering = result.scalar_one_or_none()
    
    if not offering:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offering not found")
    
    if current_user.role == "tenant_admin" and str(offering.tenant_id) != str(current_user.tenant_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    if offering_data.name is not None:
        offering.name = offering_data.name
    if offering_data.description is not None:
        offering.description = offering_data.description
    if offering_data.readiness is not None:
        offering.readiness = offering_data.readiness
    if offering_data.lifecycle is not None:
        offering.lifecycle = offering_data.lifecycle
    if offering_data.publication is not None:
        offering.publication = offering_data.publication
    
    await db.commit()
    await db.refresh(offering)
    
    return {
        "id": str(offering.id),
        "tenant_id": str(offering.tenant_id),
        "name": offering.name,
        "description": offering.description,
        "readiness": offering.readiness,
        "lifecycle": offering.lifecycle,
        "publication": offering.publication,
        "evidence": offering.evidence,
    }