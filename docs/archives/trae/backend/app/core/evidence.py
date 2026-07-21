"""证据与承诺体系

证据状态:
- declared: 已声明（用户提供但未验证）
- supported: 有支撑材料（上传了证明文件）
- verified: 已验证（平台或权威方确认）
- expired: 已过期
- conflict: 存在冲突

承诺账本: 集中跟踪所有责任和承诺
"""
from datetime import datetime
from typing import Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Evidence, User
from app.core.audit import AuditService


class EvidenceService:
    """证据服务"""

    @staticmethod
    async def create_evidence(
        db: AsyncSession,
        user: User,
        entity_id: str,
        entity_type: str,
        content: Dict,
        source: str,
        valid_from: Optional[datetime] = None,
        valid_until: Optional[datetime] = None,
    ) -> Evidence:
        """创建证据"""
        evidence = Evidence(
            entity_id=entity_id,
            entity_type=entity_type,
            content=content,
            source=source,
            status="declared",
            valid_from=valid_from,
            valid_until=valid_until,
            created_by=user.id,
        )
        db.add(evidence)
        await db.commit()
        await db.refresh(evidence)

        await AuditService.log_operation(
            db, user, "create_evidence", "evidence", str(evidence.id),
            {"entity_type": entity_type, "entity_id": entity_id, "source": source}
        )

        return evidence

    @staticmethod
    async def get_evidence_by_entity(
        db: AsyncSession,
        entity_id: str,
        entity_type: Optional[str] = None,
    ) -> List[Evidence]:
        """获取实体的所有证据"""
        query = select(Evidence).where(Evidence.entity_id == entity_id)
        if entity_type:
            query = query.where(Evidence.entity_type == entity_type)
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def update_evidence_status(
        db: AsyncSession,
        user: User,
        evidence_id: str,
        new_status: str,
    ) -> Evidence:
        """更新证据状态"""
        from app.core.state_machine import validate_state_transition

        result = await db.execute(select(Evidence).where(Evidence.id == evidence_id))
        evidence = result.scalar_one_or_none()

        if not evidence:
            from fastapi import HTTPException, status
            raise HTTPException(status.HTTP_404_NOT_FOUND, detail="证据不存在")

        old_status = evidence.status
        validate_state_transition("evidence", old_status, new_status)

        evidence.status = new_status
        await db.commit()
        await db.refresh(evidence)

        await AuditService.log_state_transition(
            db, user, "evidence", str(evidence.id), "evidence", old_status, new_status
        )

        return evidence

    @staticmethod
    async def verify_evidence(
        db: AsyncSession,
        user: User,
        evidence_id: str,
    ) -> Evidence:
        """验证证据（仅平台管理员）"""
        if user.role != "platform_admin":
            from fastapi import HTTPException, status
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="仅平台管理员可验证证据")

        return await EvidenceService.update_evidence_status(db, user, evidence_id, "verified")


class CommitmentLedger:
    """承诺账本 - 集中跟踪所有责任和承诺"""

    @staticmethod
    async def record_commitment(
        db: AsyncSession,
        user: User,
        project_id: str,
        commitment_type: str,
        party_id: str,
        party_type: str,
        description: str,
        due_date: Optional[datetime] = None,
    ) -> Dict:
        """记录承诺"""
        commitment = {
            "project_id": project_id,
            "type": commitment_type,
            "party_id": party_id,
            "party_type": party_type,
            "description": description,
            "due_date": due_date.isoformat() if due_date else None,
            "status": "pending",
            "created_by": str(user.id),
            "created_at": datetime.utcnow().isoformat(),
        }

        await AuditService.log_operation(
            db, user, "record_commitment", "commitment", project_id, commitment
        )

        return commitment

    @staticmethod
    async def fulfill_commitment(
        db: AsyncSession,
        user: User,
        project_id: str,
        commitment_type: str,
        party_id: str,
    ) -> Dict:
        """履行承诺"""
        fulfillment = {
            "project_id": project_id,
            "type": commitment_type,
            "party_id": party_id,
            "status": "fulfilled",
            "fulfilled_by": str(user.id),
            "fulfilled_at": datetime.utcnow().isoformat(),
        }

        await AuditService.log_operation(
            db, user, "fulfill_commitment", "commitment", project_id, fulfillment
        )

        return fulfillment
