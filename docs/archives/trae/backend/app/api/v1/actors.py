from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth import get_current_user
from app.db.dependency import get_db
from app.db.models import Actor, User

router = APIRouter()

class ActorCreate(BaseModel):
    stage_name: str
    real_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    expertise: Optional[dict] = None
    availability: Optional[dict] = None

class ActorUpdate(BaseModel):
    stage_name: Optional[str] = None
    real_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    expertise: Optional[dict] = None
    availability: Optional[dict] = None
    status: Optional[str] = None

@router.get("/")
async def get_actors(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "platform_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    result = await db.execute(select(Actor).offset(skip).limit(limit))
    actors = result.scalars().all()
    
    return [
        {
            "id": str(actor.id),
            "stage_name": actor.stage_name,
            "real_name": actor.real_name,
            "avatar_url": actor.avatar_url,
            "bio": actor.bio,
            "expertise": actor.expertise,
            "availability": actor.availability,
            "status": actor.status,
            "created_at": actor.created_at,
        }
        for actor in actors
    ]

@router.get("/{actor_id}")
async def get_actor(
    actor_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "actor" and str(current_user.actor_id) != actor_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    result = await db.execute(select(Actor).where(Actor.id == actor_id))
    actor = result.scalar_one_or_none()
    
    if not actor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Actor not found")
    
    return {
        "id": str(actor.id),
        "stage_name": actor.stage_name,
        "real_name": actor.real_name,
        "avatar_url": actor.avatar_url,
        "bio": actor.bio,
        "expertise": actor.expertise,
        "availability": actor.availability,
        "status": actor.status,
        "created_at": actor.created_at,
    }

@router.post("/")
async def create_actor(
    actor_data: ActorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["platform_admin", "actor"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    if current_user.role == "actor" and current_user.actor_id is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Actor profile already exists")
    
    new_actor = Actor(
        stage_name=actor_data.stage_name,
        real_name=actor_data.real_name,
        avatar_url=actor_data.avatar_url,
        bio=actor_data.bio,
        expertise=actor_data.expertise,
        availability=actor_data.availability,
    )
    
    db.add(new_actor)
    await db.commit()
    await db.refresh(new_actor)
    
    if current_user.role == "actor":
        current_user.actor_id = new_actor.id
        await db.commit()
    
    return {
        "id": str(new_actor.id),
        "stage_name": new_actor.stage_name,
        "real_name": new_actor.real_name,
        "avatar_url": new_actor.avatar_url,
        "bio": new_actor.bio,
        "expertise": new_actor.expertise,
        "availability": new_actor.availability,
        "status": new_actor.status,
        "created_at": new_actor.created_at,
    }

@router.put("/{actor_id}")
async def update_actor(
    actor_id: str,
    actor_data: ActorUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "actor" and str(current_user.actor_id) != actor_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    result = await db.execute(select(Actor).where(Actor.id == actor_id))
    actor = result.scalar_one_or_none()
    
    if not actor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Actor not found")
    
    if actor_data.stage_name is not None:
        actor.stage_name = actor_data.stage_name
    if actor_data.real_name is not None:
        actor.real_name = actor_data.real_name
    if actor_data.avatar_url is not None:
        actor.avatar_url = actor_data.avatar_url
    if actor_data.bio is not None:
        actor.bio = actor_data.bio
    if actor_data.expertise is not None:
        actor.expertise = actor_data.expertise
    if actor_data.availability is not None:
        actor.availability = actor_data.availability
    if actor_data.status is not None:
        actor.status = actor_data.status
    
    await db.commit()
    await db.refresh(actor)
    
    return {
        "id": str(actor.id),
        "stage_name": actor.stage_name,
        "real_name": actor.real_name,
        "avatar_url": actor.avatar_url,
        "bio": actor.bio,
        "expertise": actor.expertise,
        "availability": actor.availability,
        "status": actor.status,
    }

@router.delete("/{actor_id}")
async def delete_actor(
    actor_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "platform_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    result = await db.execute(select(Actor).where(Actor.id == actor_id))
    actor = result.scalar_one_or_none()
    
    if not actor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Actor not found")
    
    await db.delete(actor)
    await db.commit()
    
    return {"message": "Actor deleted successfully"}