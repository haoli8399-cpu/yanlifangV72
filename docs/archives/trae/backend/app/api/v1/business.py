"""业务API路由 - 核心业务流程"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.api.v1.auth import get_current_user
from app.db.dependency import get_db
from app.db.models import User
from app.services.business import (
    DemandService, MainServiceAssignmentService, EngagementService,
    ProjectService, CollaborationService, QuoteService, ChargeableValueService
)
from app.services.ai_assistant import AIAssistantService
from decimal import Decimal

router = APIRouter()


# ===== 请求模型 =====

class AssignmentCreate(BaseModel):
    demand_id: str
    tenant_id: str

class EngagementCreate(BaseModel):
    demand_id: str
    tenant_id: str
    engagement_type: str = "main_service"

class ProjectFromEngagement(BaseModel):
    engagement_id: str
    title: str
    description: Optional[str] = None

class CollaborationInvite(BaseModel):
    project_id: str
    tenant_id: str

class QuoteCreate(BaseModel):
    project_id: str
    total_amount: float
    items: list
    description: Optional[str] = None
    ai_generated: bool = False

class ChargeableValueCreate(BaseModel):
    project_id: str
    amount: float
    attribution_type: str = "platform_sourced"


# ===== 需求管理 =====

@router.post("/demands/{demand_id}/activate")
async def activate_demand(
    demand_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """激活需求"""
    demand = await DemandService.activate_demand(db, current_user, demand_id)
    return {"id": str(demand.id), "lifecycle": demand.lifecycle}

@router.post("/demands/{demand_id}/publish")
async def publish_demand(
    demand_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """发布需求"""
    demand = await DemandService.publish_demand(db, current_user, demand_id)
    return {"id": str(demand.id), "publication": demand.publication}


# ===== 主服务指派 =====

@router.post("/assignments")
async def create_assignment(
    data: AssignmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """创建主服务指派"""
    assignment = await MainServiceAssignmentService.create_assignment(
        db, current_user, data.demand_id, data.tenant_id
    )
    return {
        "id": str(assignment.id),
        "demand_id": str(assignment.demand_id),
        "tenant_id": str(assignment.tenant_id),
        "status": assignment.status,
    }

@router.post("/assignments/{assignment_id}/accept")
async def accept_assignment(
    assignment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """服务商接受主服务指派"""
    assignment = await MainServiceAssignmentService.accept_assignment(
        db, current_user, assignment_id
    )
    return {"id": str(assignment.id), "status": assignment.status}

@router.post("/assignments/{assignment_id}/activate")
async def activate_assignment(
    assignment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """激活主服务指派"""
    assignment = await MainServiceAssignmentService.activate_assignment(
        db, current_user, assignment_id
    )
    return {"id": str(assignment.id), "status": assignment.status}


# ===== 租户承接 =====

@router.post("/engagements")
async def create_engagement(
    data: EngagementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """创建租户承接"""
    engagement = await EngagementService.create_engagement(
        db, current_user, data.demand_id, data.tenant_id, data.engagement_type
    )
    return {
        "id": str(engagement.id),
        "demand_id": str(engagement.demand_id),
        "tenant_id": str(engagement.tenant_id),
        "status": engagement.status,
    }

@router.post("/engagements/{engagement_id}/accept")
async def accept_engagement(
    engagement_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """接受承接"""
    engagement = await EngagementService.accept_engagement(db, current_user, engagement_id)
    return {"id": str(engagement.id), "status": engagement.status}

@router.post("/engagements/{engagement_id}/activate")
async def activate_engagement(
    engagement_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """激活承接"""
    engagement = await EngagementService.activate_engagement(db, current_user, engagement_id)
    return {"id": str(engagement.id), "status": engagement.status}


# ===== 项目管理 =====

@router.post("/projects/from-engagement")
async def create_project_from_engagement(
    data: ProjectFromEngagement,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """从承接创建项目"""
    project = await ProjectService.create_project_from_engagement(
        db, current_user, data.engagement_id, data.title, data.description
    )
    return {
        "id": str(project.id),
        "engagement_id": str(project.engagement_id),
        "title": project.title,
        "status": project.status,
    }

@router.post("/projects/{project_id}/activate")
async def activate_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """激活项目"""
    project = await ProjectService.activate_project(db, current_user, project_id)
    return {"id": str(project.id), "status": project.status}

@router.post("/projects/{project_id}/complete")
async def complete_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """完成项目"""
    project = await ProjectService.complete_project(db, current_user, project_id)
    return {"id": str(project.id), "status": project.status}


# ===== 协作管理 =====

@router.post("/collaborations/invite")
async def invite_collaborator(
    data: CollaborationInvite,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """邀请协作方"""
    collaboration = await CollaborationService.invite_collaborator(
        db, current_user, data.project_id, data.tenant_id
    )
    return {
        "id": str(collaboration.id),
        "project_id": str(collaboration.project_id),
        "tenant_id": str(collaboration.tenant_id),
        "status": collaboration.status,
    }

@router.post("/collaborations/{collaboration_id}/accept")
async def accept_collaboration(
    collaboration_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """接受协作邀请"""
    collaboration = await CollaborationService.accept_invitation(
        db, current_user, collaboration_id
    )
    return {"id": str(collaboration.id), "status": collaboration.status}


# ===== 报价管理 =====

@router.post("/quotes")
async def create_quote(
    data: QuoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """创建报价"""
    quote = await QuoteService.create_quote(
        db, current_user, data.project_id, Decimal(str(data.total_amount)),
        data.items, data.description, data.ai_generated
    )
    return {
        "id": str(quote.id),
        "project_id": str(quote.project_id),
        "version_number": quote.version_number,
        "total_amount": float(quote.total_amount),
        "status": quote.status,
        "ai_generated": quote.ai_generated,
        "human_confirmed": quote.human_confirmed,
    }

@router.post("/quotes/{quote_id}/send")
async def send_quote(
    quote_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """发送报价"""
    quote = await QuoteService.send_quote(db, current_user, quote_id)
    return {"id": str(quote.id), "status": quote.status}

@router.post("/quotes/{quote_id}/accept")
async def accept_quote(
    quote_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """客户接受报价"""
    quote = await QuoteService.accept_quote(db, current_user, quote_id)
    return {"id": str(quote.id), "status": quote.status}


# ===== 可收费价值 =====

@router.post("/chargeable-values")
async def create_chargeable_value(
    data: ChargeableValueCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """创建可收费价值"""
    cv = await ChargeableValueService.create_chargeable_value(
        db, current_user, data.project_id, Decimal(str(data.amount)), data.attribution_type
    )
    return {
        "id": str(cv.id),
        "project_id": str(cv.project_id),
        "amount": float(cv.amount),
        "attribution_type": cv.attribution_type,
        "status": cv.status,
    }

@router.post("/projects/{project_id}/reconcile")
async def reconcile_payments(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """对账 - 验证金额守恒"""
    result = await ChargeableValueService.reconcile_payments(db, current_user, project_id)
    return result


# ===== AI助手 =====

@router.get("/ai/demands/{demand_id}/analyze-maturity")
async def analyze_demand_maturity(
    demand_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """AI分析需求成熟度"""
    return await AIAssistantService.analyze_demand_maturity(db, current_user, demand_id)

@router.get("/ai/demands/{demand_id}/suggest-suppliers")
async def suggest_suppliers(
    demand_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """AI推荐服务商"""
    return await AIAssistantService.suggest_suppliers(db, current_user, demand_id)

@router.get("/ai/projects/{project_id}/draft-quote")
async def draft_quote(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """AI草拟报价"""
    return await AIAssistantService.draft_quote(db, current_user, project_id)

@router.get("/ai/projects/{project_id}/summary")
async def project_summary(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """AI项目摘要"""
    return await AIAssistantService.generate_project_summary(db, current_user, project_id)
