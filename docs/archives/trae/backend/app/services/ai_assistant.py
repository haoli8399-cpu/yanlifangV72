"""AI经纪经营助手

边界清晰:
- AI负责: 草拟报价、生成建议、匹配推荐
- 确定性系统负责: 权限验证、状态管理、金额计算、路由分发

AI永远不直接执行业务操作，只生成建议，由确定性系统执行。
"""
from decimal import Decimal
from typing import Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import (
    Demand, TenantEngagement, ActivityProject, ProgramModule,
    ServiceOffering, Quote, PlanItem, User, Tenant
)


class AIAssistantService:
    """AI经纪经营助手服务"""

    @staticmethod
    async def draft_quote(
        db: AsyncSession,
        user: User,
        project_id: str,
    ) -> Dict:
        """AI草拟报价

        返回报价建议，不直接创建报价。需要人工确认后才能发送。
        """
        result = await db.execute(select(ActivityProject).where(ActivityProject.id == project_id))
        project = result.scalar_one_or_none()

        if not project:
            return {"error": "项目不存在"}

        items_result = await db.execute(
            select(PlanItem).where(PlanItem.project_id == project_id)
        )
        plan_items = items_result.scalars().all()

        suggested_items = []
        total = Decimal("0")

        for item in plan_items:
            suggested_items.append({
                "name": item.name,
                "description": item.description,
                "price": float(item.price) if item.price else 0,
                "program_module_version_id": str(item.program_module_version_id) if item.program_module_version_id else None,
            })
            if item.price:
                total += item.price

        markup = Decimal("1.1")
        suggested_total = total * markup

        return {
            "project_id": project_id,
            "project_title": project.title,
            "suggested_items": suggested_items,
            "base_total": float(total),
            "suggested_total": float(suggested_total),
            "markup_applied": "10%",
            "ai_generated": True,
            "needs_human_confirmation": True,
            "disclaimer": "此报价由AI生成，仅供参考。需人工确认后才能发送给客户。",
        }

    @staticmethod
    async def suggest_suppliers(
        db: AsyncSession,
        user: User,
        demand_id: str,
    ) -> Dict:
        """AI推荐服务商

        基于需求特征推荐合适的服务商。
        """
        result = await db.execute(select(Demand).where(Demand.id == demand_id))
        demand = result.scalar_one_or_none()

        if not demand:
            return {"error": "需求不存在"}

        tenants_result = await db.execute(
            select(Tenant).where(Tenant.status == "active")
        )
        tenants = tenants_result.scalars().all()

        recommendations = []
        for tenant in tenants:
            programs_result = await db.execute(
                select(ProgramModule).where(
                    ProgramModule.tenant_id == tenant.id,
                    ProgramModule.lifecycle == "active"
                )
            )
            programs = programs_result.scalars().all()

            score = 0
            reasons = []

            if demand.city and tenant.city == demand.city:
                score += 30
                reasons.append("同城服务")
            elif demand.city and tenant.city:
                score += 10
                reasons.append("可异地服务")

            if len(programs) > 0:
                score += min(len(programs) * 10, 40)
                reasons.append(f"拥有 {len(programs)} 个活跃节目模块")

            if tenant.tier == "enterprise":
                score += 20
                reasons.append("企业级服务商")
            elif tenant.tier == "pro":
                score += 10
                reasons.append("专业级服务商")

            if score > 0:
                recommendations.append({
                    "tenant_id": str(tenant.id),
                    "tenant_name": tenant.name,
                    "score": score,
                    "reasons": reasons,
                    "tier": tenant.tier,
                    "city": tenant.city,
                })

        recommendations.sort(key=lambda x: x["score"], reverse=True)

        return {
            "demand_id": demand_id,
            "demand_title": demand.title,
            "recommendations": recommendations[:5],
            "disclaimer": "推荐结果由AI生成，仅供参考。最终选择由客户决定。",
        }

    @staticmethod
    async def analyze_demand_maturity(
        db: AsyncSession,
        user: User,
        demand_id: str,
    ) -> Dict:
        """AI分析需求成熟度

        分析需求信息完整度，推荐合适的处理模式。
        """
        result = await db.execute(select(Demand).where(Demand.id == demand_id))
        demand = result.scalar_one_or_none()

        if not demand:
            return {"error": "需求不存在"}

        completeness = {
            "title": bool(demand.title),
            "description": bool(demand.description),
            "event_type": bool(demand.event_type),
            "event_date": bool(demand.event_date),
            "city": bool(demand.city),
            "budget": bool(demand.budget_min or demand.budget_max),
        }

        filled_fields = sum(1 for v in completeness.values() if v)
        total_fields = len(completeness)
        completeness_ratio = filled_fields / total_fields

        if completeness_ratio >= 0.8:
            recommended_mode = "explicit"
            mode_description = "明确快执模式 - 需求清晰，可直接匹配服务商快速执行"
        elif completeness_ratio >= 0.5:
            recommended_mode = "consultative"
            mode_description = "咨询探索模式 - 需要进一步沟通明确需求细节"
        elif completeness_ratio >= 0.3:
            recommended_mode = "repeat"
            mode_description = "回头客模式 - 基于历史记录快速对接"
        else:
            recommended_mode = "consultative"
            mode_description = "咨询探索模式 - 需求信息较少，建议引导客户补充"

        missing_fields = [k for k, v in completeness.items() if not v]

        return {
            "demand_id": demand_id,
            "completeness": completeness,
            "completeness_ratio": completeness_ratio,
            "current_maturity": demand.maturity,
            "recommended_mode": recommended_mode,
            "mode_description": mode_description,
            "missing_fields": missing_fields,
            "suggestions": [
                f"建议补充 {field} 信息" for field in missing_fields
            ],
            "disclaimer": "分析结果由AI生成，仅供参考。",
        }

    @staticmethod
    async def generate_project_summary(
        db: AsyncSession,
        user: User,
        project_id: str,
    ) -> Dict:
        """AI生成项目摘要"""
        result = await db.execute(select(ActivityProject).where(ActivityProject.id == project_id))
        project = result.scalar_one_or_none()

        if not project:
            return {"error": "项目不存在"}

        items_result = await db.execute(
            select(PlanItem).where(PlanItem.project_id == project_id)
        )
        plan_items = items_result.scalars().all()

        total_items = len(plan_items)
        completed_items = len([i for i in plan_items if i.status == "completed"])
        in_progress_items = len([i for i in plan_items if i.status == "in_progress"])
        pending_items = len([i for i in plan_items if i.status == "pending"])

        progress = (completed_items / total_items * 100) if total_items > 0 else 0

        if progress == 100:
            status_summary = "项目已完成所有计划项"
        elif progress >= 75:
            status_summary = "项目进展顺利，接近完成"
        elif progress >= 50:
            status_summary = "项目过半，按计划推进中"
        elif progress >= 25:
            status_summary = "项目已启动，正在推进初期工作"
        else:
            status_summary = "项目刚创建，待启动"

        return {
            "project_id": project_id,
            "project_title": project.title,
            "status": project.status,
            "progress": round(progress, 1),
            "status_summary": status_summary,
            "statistics": {
                "total_items": total_items,
                "completed_items": completed_items,
                "in_progress_items": in_progress_items,
                "pending_items": pending_items,
            },
            "disclaimer": "摘要由AI生成，仅供参考。",
        }
