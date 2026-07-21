"""业务服务层 - 核心业务逻辑

包含:
- 主服务指派 (MainServiceAssignment)
- 租户承接 (TenantEngagement)
- 项目协作 (Collaboration)
- 报价系统 (Quote)
- 金额守恒 (ChargeableValue)
"""
from datetime import datetime
from decimal import Decimal
from typing import Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.db.models import (
    Demand, TenantEngagement, ActivityProject, MainServiceAssignment,
    Collaboration, Quote, PlanItem, ChargeableValue, PaymentRecord, User, Tenant
)
from app.core.state_machine import validate_state_transition
from app.core.audit import AuditService
from app.core.permissions import PermissionChecker, Action, ResourceType


class DemandService:
    """需求服务"""

    @staticmethod
    async def activate_demand(
        db: AsyncSession,
        user: User,
        demand_id: str,
    ) -> Demand:
        """激活需求"""
        result = await db.execute(select(Demand).where(Demand.id == demand_id))
        demand = result.scalar_one_or_none()

        if not demand:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="需求不存在")

        PermissionChecker.assert_permission(user, ResourceType.DEMAND.value, Action.ACTIVATE.value)

        old_lifecycle = demand.lifecycle
        validate_state_transition("lifecycle", old_lifecycle, "active", "demand", {
            "readiness": demand.readiness,
            "title": demand.title,
            "customer_id": str(demand.customer_id),
        })

        demand.lifecycle = "active"
        await db.commit()
        await db.refresh(demand)

        await AuditService.log_state_transition(
            db, user, "demand", demand_id, "lifecycle", old_lifecycle, "active"
        )

        return demand

    @staticmethod
    async def publish_demand(
        db: AsyncSession,
        user: User,
        demand_id: str,
    ) -> Demand:
        """发布需求"""
        result = await db.execute(select(Demand).where(Demand.id == demand_id))
        demand = result.scalar_one_or_none()

        if not demand:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="需求不存在")

        PermissionChecker.assert_permission(user, ResourceType.DEMAND.value, Action.PUBLISH.value)
        PermissionChecker.assert_data_isolation(
            user, resource_customer_id=str(demand.customer_id)
        )

        old_publication = demand.publication
        if old_publication == "private":
            validate_state_transition("publication", old_publication, "publishable", "demand", {
                "readiness": demand.readiness,
            })
            demand.publication = "publishable"
        elif old_publication == "publishable":
            validate_state_transition("publication", old_publication, "published", "demand", {
                "readiness": demand.readiness,
                "evidence": demand.evidence,
            })
            demand.publication = "published"

        await db.commit()
        await db.refresh(demand)

        await AuditService.log_state_transition(
            db, user, "demand", demand_id, "publication", old_publication, demand.publication
        )

        return demand


class MainServiceAssignmentService:
    """主服务指派服务

    核心业务规则: 每个正式项目只能有一个主服务Tenant
    """

    @staticmethod
    async def create_assignment(
        db: AsyncSession,
        user: User,
        demand_id: str,
        tenant_id: str,
    ) -> MainServiceAssignment:
        """创建主服务指派"""
        if user.role != "customer":
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="仅客户可指派主服务")

        result = await db.execute(select(Demand).where(Demand.id == demand_id))
        demand = result.scalar_one_or_none()
        if not demand:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="需求不存在")

        if str(demand.customer_id) != str(user.id):
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="无权操作此需求")

        existing = await db.execute(
            select(MainServiceAssignment).where(
                MainServiceAssignment.demand_id == demand_id,
                MainServiceAssignment.status.in_(["customer_selected", "tenant_accepted", "active"])
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="该需求已有活跃的主服务指派")

        assignment = MainServiceAssignment(
            demand_id=demand_id,
            tenant_id=tenant_id,
            customer_selected=True,
            status="customer_selected",
        )
        db.add(assignment)
        await db.commit()
        await db.refresh(assignment)

        await AuditService.log_operation(
            db, user, "assign_main_service", "main_service_assignment", str(assignment.id),
            {"demand_id": demand_id, "tenant_id": tenant_id}
        )

        return assignment

    @staticmethod
    async def accept_assignment(
        db: AsyncSession,
        user: User,
        assignment_id: str,
    ) -> MainServiceAssignment:
        """服务商接受主服务指派"""
        if user.role != "tenant_admin":
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="仅服务商可接受指派")

        result = await db.execute(
            select(MainServiceAssignment).where(MainServiceAssignment.id == assignment_id)
        )
        assignment = result.scalar_one_or_none()

        if not assignment:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="主服务指派不存在")

        if str(assignment.tenant_id) != str(user.tenant_id):
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="无权操作此指派")

        if assignment.status != "customer_selected":
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="指派状态不允许接受")

        assignment.tenant_accepted = True
        assignment.status = "tenant_accepted"
        await db.commit()
        await db.refresh(assignment)

        await AuditService.log_operation(
            db, user, "accept_main_service", "main_service_assignment", str(assignment.id),
            {"demand_id": str(assignment.demand_id), "tenant_id": str(assignment.tenant_id)}
        )

        return assignment

    @staticmethod
    async def activate_assignment(
        db: AsyncSession,
        user: User,
        assignment_id: str,
    ) -> MainServiceAssignment:
        """激活主服务指派，创建项目"""
        result = await db.execute(
            select(MainServiceAssignment).where(MainServiceAssignment.id == assignment_id)
        )
        assignment = result.scalar_one_or_none()

        if not assignment:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="主服务指派不存在")

        if not (assignment.customer_selected and assignment.tenant_accepted):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="需客户和服务商双方确认")

        assignment.status = "active"
        await db.commit()
        await db.refresh(assignment)

        await AuditService.log_operation(
            db, user, "activate_main_service", "main_service_assignment", str(assignment.id),
            {"demand_id": str(assignment.demand_id)}
        )

        return assignment


class EngagementService:
    """租户承接服务"""

    @staticmethod
    async def create_engagement(
        db: AsyncSession,
        user: User,
        demand_id: str,
        tenant_id: str,
        engagement_type: str = "main_service",
    ) -> TenantEngagement:
        """创建租户承接"""
        engagement = TenantEngagement(
            demand_id=demand_id,
            tenant_id=tenant_id,
            engagement_type=engagement_type,
            status="pending",
        )
        db.add(engagement)
        await db.commit()
        await db.refresh(engagement)

        await AuditService.log_operation(
            db, user, "create_engagement", "tenant_engagement", str(engagement.id),
            {"demand_id": demand_id, "tenant_id": tenant_id, "type": engagement_type}
        )

        return engagement

    @staticmethod
    async def accept_engagement(
        db: AsyncSession,
        user: User,
        engagement_id: str,
    ) -> TenantEngagement:
        """接受承接"""
        result = await db.execute(
            select(TenantEngagement).where(TenantEngagement.id == engagement_id)
        )
        engagement = result.scalar_one_or_none()

        if not engagement:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="承接不存在")

        if user.role == "tenant_admin" and str(engagement.tenant_id) != str(user.tenant_id):
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="无权操作此承接")

        engagement.status = "accepted"
        await db.commit()
        await db.refresh(engagement)

        await AuditService.log_operation(
            db, user, "accept_engagement", "tenant_engagement", str(engagement.id),
            {"demand_id": str(engagement.demand_id), "tenant_id": str(engagement.tenant_id)}
        )

        return engagement

    @staticmethod
    async def activate_engagement(
        db: AsyncSession,
        user: User,
        engagement_id: str,
    ) -> TenantEngagement:
        """激活承接"""
        result = await db.execute(
            select(TenantEngagement).where(TenantEngagement.id == engagement_id)
        )
        engagement = result.scalar_one_or_none()

        if not engagement:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="承接不存在")

        engagement.status = "activated"
        await db.commit()
        await db.refresh(engagement)

        await AuditService.log_operation(
            db, user, "activate_engagement", "tenant_engagement", str(engagement.id),
            {"demand_id": str(engagement.demand_id)}
        )

        return engagement


class ProjectService:
    """项目服务"""

    @staticmethod
    async def create_project_from_engagement(
        db: AsyncSession,
        user: User,
        engagement_id: str,
        title: str,
        description: Optional[str] = None,
    ) -> ActivityProject:
        """从承接创建项目"""
        result = await db.execute(
            select(TenantEngagement).where(TenantEngagement.id == engagement_id)
        )
        engagement = result.scalar_one_or_none()

        if not engagement:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="承接不存在")

        if engagement.status != "activated":
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="承接未激活，无法创建项目")

        project = ActivityProject(
            engagement_id=engagement_id,
            title=title,
            description=description,
            status="created",
        )
        db.add(project)
        await db.commit()
        await db.refresh(project)

        await AuditService.log_operation(
            db, user, "create_project", "activity_project", str(project.id),
            {"engagement_id": engagement_id, "title": title}
        )

        return project

    @staticmethod
    async def activate_project(
        db: AsyncSession,
        user: User,
        project_id: str,
    ) -> ActivityProject:
        """激活项目"""
        result = await db.execute(select(ActivityProject).where(ActivityProject.id == project_id))
        project = result.scalar_one_or_none()

        if not project:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="项目不存在")

        old_status = project.status
        project.status = "active"
        await db.commit()
        await db.refresh(project)

        await AuditService.log_state_transition(
            db, user, "project", project_id, "lifecycle", old_status, "active"
        )

        return project

    @staticmethod
    async def complete_project(
        db: AsyncSession,
        user: User,
        project_id: str,
    ) -> ActivityProject:
        """完成项目"""
        result = await db.execute(select(ActivityProject).where(ActivityProject.id == project_id))
        project = result.scalar_one_or_none()

        if not project:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="项目不存在")

        items_result = await db.execute(
            select(PlanItem).where(PlanItem.project_id == project_id)
        )
        plan_items = items_result.scalars().all()

        incomplete_items = [item for item in plan_items if item.status != "completed"]
        if incomplete_items:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                detail=f"项目有 {len(incomplete_items)} 个未完成的计划项"
            )

        old_status = project.status
        project.status = "completed"
        await db.commit()
        await db.refresh(project)

        await AuditService.log_state_transition(
            db, user, "project", project_id, "lifecycle", old_status, "completed"
        )

        return project


class CollaborationService:
    """协作服务"""

    @staticmethod
    async def invite_collaborator(
        db: AsyncSession,
        user: User,
        project_id: str,
        tenant_id: str,
    ) -> Collaboration:
        """邀请协作方"""
        collaboration = Collaboration(
            project_id=project_id,
            tenant_id=tenant_id,
            status="invited",
        )
        db.add(collaboration)
        await db.commit()
        await db.refresh(collaboration)

        await AuditService.log_operation(
            db, user, "invite_collaborator", "collaboration", str(collaboration.id),
            {"project_id": project_id, "tenant_id": tenant_id}
        )

        return collaboration

    @staticmethod
    async def accept_invitation(
        db: AsyncSession,
        user: User,
        collaboration_id: str,
    ) -> Collaboration:
        """接受协作邀请"""
        result = await db.execute(
            select(Collaboration).where(Collaboration.id == collaboration_id)
        )
        collaboration = result.scalar_one_or_none()

        if not collaboration:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="协作邀请不存在")

        if user.role == "tenant_admin" and str(collaboration.tenant_id) != str(user.tenant_id):
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="无权操作此邀请")

        collaboration.status = "accepted"
        await db.commit()
        await db.refresh(collaboration)

        await AuditService.log_operation(
            db, user, "accept_collaboration", "collaboration", str(collaboration.id),
            {"project_id": str(collaboration.project_id)}
        )

        return collaboration


class QuoteService:
    """报价服务"""

    @staticmethod
    async def create_quote(
        db: AsyncSession,
        user: User,
        project_id: str,
        total_amount: Decimal,
        items: List[Dict],
        description: Optional[str] = None,
        ai_generated: bool = False,
    ) -> Quote:
        """创建报价"""
        result = await db.execute(select(Quote).where(Quote.project_id == project_id))
        existing_quotes = result.scalars().all()
        version_number = len(existing_quotes) + 1

        quote = Quote(
            project_id=project_id,
            tenant_id=user.tenant_id,
            version_number=version_number,
            total_amount=total_amount,
            description=description,
            items=items,
            status="draft",
            ai_generated=ai_generated,
            human_confirmed=not ai_generated,
        )
        db.add(quote)
        await db.commit()
        await db.refresh(quote)

        await AuditService.log_operation(
            db, user, "create_quote", "quote", str(quote.id),
            {"project_id": project_id, "version": version_number, "amount": str(total_amount), "ai_generated": ai_generated}
        )

        return quote

    @staticmethod
    async def send_quote(
        db: AsyncSession,
        user: User,
        quote_id: str,
    ) -> Quote:
        """发送报价"""
        result = await db.execute(select(Quote).where(Quote.id == quote_id))
        quote = result.scalar_one_or_none()

        if not quote:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="报价不存在")

        if quote.ai_generated and not quote.human_confirmed:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="AI生成的报价需人工确认后才能发送")

        quote.status = "sent"
        await db.commit()
        await db.refresh(quote)

        await AuditService.log_operation(
            db, user, "send_quote", "quote", str(quote.id),
            {"project_id": str(quote.project_id), "version": quote.version_number}
        )

        return quote

    @staticmethod
    async def accept_quote(
        db: AsyncSession,
        user: User,
        quote_id: str,
    ) -> Quote:
        """客户接受报价"""
        if user.role != "customer":
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="仅客户可接受报价")

        result = await db.execute(select(Quote).where(Quote.id == quote_id))
        quote = result.scalar_one_or_none()

        if not quote:
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="报价不存在")

        if quote.status != "sent":
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="仅已发送的报价可接受")

        quote.status = "accepted"
        await db.commit()
        await db.refresh(quote)

        await AuditService.log_operation(
            db, user, "accept_quote", "quote", str(quote.id),
            {"project_id": str(quote.project_id), "amount": str(quote.total_amount)}
        )

        return quote


class ChargeableValueService:
    """可收费价值服务 - 金额守恒规则"""

    @staticmethod
    async def create_chargeable_value(
        db: AsyncSession,
        user: User,
        project_id: str,
        amount: Decimal,
        attribution_type: str = "platform_sourced",
    ) -> ChargeableValue:
        """创建可收费价值"""
        cv = ChargeableValue(
            project_id=project_id,
            amount=amount,
            attribution_type=attribution_type,
            status="active",
        )
        db.add(cv)
        await db.commit()
        await db.refresh(cv)

        await AuditService.log_operation(
            db, user, "create_chargeable_value", "chargeable_value", str(cv.id),
            {"project_id": project_id, "amount": str(amount), "attribution": attribution_type}
        )

        return cv

    @staticmethod
    async def reconcile_payments(
        db: AsyncSession,
        user: User,
        project_id: str,
    ) -> Dict:
        """对账 - 验证金额守恒"""
        cv_result = await db.execute(
            select(ChargeableValue).where(
                ChargeableValue.project_id == project_id,
                ChargeableValue.status == "active"
            )
        )
        chargeable_values = cv_result.scalars().all()

        pay_result = await db.execute(
            select(PaymentRecord).where(PaymentRecord.project_id == project_id)
        )
        payments = pay_result.scalars().all()

        total_cv = sum(cv.amount for cv in chargeable_values)
        total_confirmed = sum(p.amount for p in payments if p.status in ["confirmed", "reconciled"])

        reconciled = total_cv == total_confirmed

        result = {
            "project_id": project_id,
            "total_chargeable_value": str(total_cv),
            "total_confirmed_payments": str(total_confirmed),
            "reconciled": reconciled,
            "difference": str(total_cv - total_confirmed),
        }

        if reconciled:
            for cv in chargeable_values:
                cv.status = "closed"
            for p in payments:
                if p.status == "confirmed":
                    p.status = "reconciled"
            await db.commit()

        await AuditService.log_operation(
            db, user, "reconcile_payments", "chargeable_value", project_id, result
        )

        return result
