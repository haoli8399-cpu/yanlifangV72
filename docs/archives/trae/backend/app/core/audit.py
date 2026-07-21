"""审计日志服务

四种审计类型:
1. 操作审计 (operation): 记录用户执行的操作
2. 变更审计 (change): 记录数据变更前后状态
3. 权限审计 (permission): 记录权限相关事件
4. 安全审计 (security): 记录安全相关事件
"""
import json
from datetime import datetime
from typing import Any, Dict, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import AuditLog, User


class AuditService:
    """审计日志服务"""

    @staticmethod
    async def log_operation(
        db: AsyncSession,
        user: User,
        action: str,
        resource_type: str,
        resource_id: Optional[str] = None,
        details: Optional[Dict] = None,
        ip_address: Optional[str] = None,
    ):
        """记录操作审计"""
        log = AuditLog(
            user_id=user.id,
            action=f"operation:{action}",
            resource_type=resource_type,
            resource_id=resource_id,
            details=details or {},
            ip_address=ip_address,
        )
        db.add(log)
        await db.commit()

    @staticmethod
    async def log_change(
        db: AsyncSession,
        user: User,
        resource_type: str,
        resource_id: str,
        before: Dict[str, Any],
        after: Dict[str, Any],
        ip_address: Optional[str] = None,
    ):
        """记录变更审计"""
        changes = {}
        for key in set(list(before.keys()) + list(after.keys())):
            old_val = before.get(key)
            new_val = after.get(key)
            if old_val != new_val:
                changes[key] = {"before": old_val, "after": new_val}

        log = AuditLog(
            user_id=user.id,
            action="change:update",
            resource_type=resource_type,
            resource_id=resource_id,
            details={"changes": changes},
            ip_address=ip_address,
        )
        db.add(log)
        await db.commit()

    @staticmethod
    async def log_permission(
        db: AsyncSession,
        user: User,
        action: str,
        resource_type: str,
        resource_id: Optional[str] = None,
        granted: bool = True,
        ip_address: Optional[str] = None,
    ):
        """记录权限审计"""
        log = AuditLog(
            user_id=user.id,
            action=f"permission:{'granted' if granted else 'denied'}:{action}",
            resource_type=resource_type,
            resource_id=resource_id,
            details={"granted": granted, "user_role": user.role},
            ip_address=ip_address,
        )
        db.add(log)
        await db.commit()

    @staticmethod
    async def log_security(
        db: AsyncSession,
        user: Optional[User],
        event: str,
        details: Optional[Dict] = None,
        ip_address: Optional[str] = None,
    ):
        """记录安全审计"""
        log = AuditLog(
            user_id=user.id if user else None,
            action=f"security:{event}",
            resource_type="security",
            details=details or {},
            ip_address=ip_address,
        )
        db.add(log)
        await db.commit()

    @staticmethod
    async def log_state_transition(
        db: AsyncSession,
        user: User,
        resource_type: str,
        resource_id: str,
        axis: str,
        from_state: str,
        to_state: str,
        ip_address: Optional[str] = None,
    ):
        """记录状态转换审计"""
        log = AuditLog(
            user_id=user.id,
            action=f"state_transition:{axis}",
            resource_type=resource_type,
            resource_id=resource_id,
            details={
                "axis": axis,
                "from": from_state,
                "to": to_state,
            },
            ip_address=ip_address,
        )
        db.add(log)
        await db.commit()
