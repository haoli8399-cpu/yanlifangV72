from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth import get_current_user
from app.db.dependency import get_db
from app.db.models import ActivityProject, TenantEngagement, Demand, User

router = APIRouter()

class ProjectCreate(BaseModel):
    engagement_id: str
    title: str
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

@router.get("/")
async def get_projects(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "platform_admin":
        result = await db.execute(select(ActivityProject).offset(skip).limit(limit))
    elif current_user.role == "tenant_admin":
        result = await db.execute(
            select(ActivityProject)
            .join(TenantEngagement)
            .where(TenantEngagement.tenant_id == current_user.tenant_id)
            .offset(skip)
            .limit(limit)
        )
    elif current_user.role == "customer":
        result = await db.execute(
            select(ActivityProject)
            .join(TenantEngagement)
            .join(Demand)
            .where(Demand.customer_id == current_user.id)
            .offset(skip)
            .limit(limit)
        )
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    projects = result.scalars().all()
    
    return [
        {
            "id": str(project.id),
            "engagement_id": str(project.engagement_id),
            "title": project.title,
            "description": project.description,
            "status": project.status,
            "start_date": project.start_date,
            "end_date": project.end_date,
            "created_at": project.created_at,
        }
        for project in projects
    ]

@router.get("/{project_id}")
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ActivityProject)
        .join(TenantEngagement)
        .where(ActivityProject.id == project_id)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    
    if current_user.role == "platform_admin":
        pass
    elif current_user.role == "tenant_admin":
        engagement_result = await db.execute(select(TenantEngagement).where(TenantEngagement.id == project.engagement_id))
        engagement = engagement_result.scalar_one_or_none()
        if str(engagement.tenant_id) != str(current_user.tenant_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    elif current_user.role == "customer":
        demand_result = await db.execute(
            select(Demand)
            .join(TenantEngagement)
            .where(TenantEngagement.id == project.engagement_id)
        )
        demand = demand_result.scalar_one_or_none()
        if str(demand.customer_id) != str(current_user.id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return {
        "id": str(project.id),
        "engagement_id": str(project.engagement_id),
        "title": project.title,
        "description": project.description,
        "status": project.status,
        "start_date": project.start_date,
        "end_date": project.end_date,
        "created_at": project.created_at,
    }

@router.post("/")
async def create_project(
    project_data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["tenant_admin", "platform_admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    engagement_result = await db.execute(select(TenantEngagement).where(TenantEngagement.id == project_data.engagement_id))
    engagement = engagement_result.scalar_one_or_none()
    
    if not engagement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Engagement not found")
    
    if current_user.role == "tenant_admin" and str(engagement.tenant_id) != str(current_user.tenant_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    new_project = ActivityProject(
        engagement_id=project_data.engagement_id,
        title=project_data.title,
        description=project_data.description,
        start_date=project_data.start_date,
        end_date=project_data.end_date,
    )
    
    db.add(new_project)
    await db.commit()
    await db.refresh(new_project)
    
    return {
        "id": str(new_project.id),
        "engagement_id": str(new_project.engagement_id),
        "title": new_project.title,
        "description": new_project.description,
        "status": new_project.status,
        "start_date": new_project.start_date,
        "end_date": new_project.end_date,
        "created_at": new_project.created_at,
    }

@router.put("/{project_id}")
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(ActivityProject).where(ActivityProject.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    
    if current_user.role == "tenant_admin":
        engagement_result = await db.execute(select(TenantEngagement).where(TenantEngagement.id == project.engagement_id))
        engagement = engagement_result.scalar_one_or_none()
        if str(engagement.tenant_id) != str(current_user.tenant_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    elif current_user.role != "platform_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    if project_data.title is not None:
        project.title = project_data.title
    if project_data.description is not None:
        project.description = project_data.description
    if project_data.status is not None:
        project.status = project_data.status
    if project_data.start_date is not None:
        project.start_date = project_data.start_date
    if project_data.end_date is not None:
        project.end_date = project_data.end_date
    
    await db.commit()
    await db.refresh(project)
    
    return {
        "id": str(project.id),
        "engagement_id": str(project.engagement_id),
        "title": project.title,
        "description": project.description,
        "status": project.status,
        "start_date": project.start_date,
        "end_date": project.end_date,
    }

@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(ActivityProject).where(ActivityProject.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    
    if current_user.role != "platform_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    await db.delete(project)
    await db.commit()
    
    return {"message": "Project deleted successfully"}