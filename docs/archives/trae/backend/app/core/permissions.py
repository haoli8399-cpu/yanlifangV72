"""权限系统

基于RBAC + ABAC的权限控制:
- RBAC: 角色基础权限 (customer, tenant_admin, actor, platform_admin)
- ABAC: 属性基础权限 (基于状态、授权、有效性等动态条件)
"""
from enum import Enum
from typing import Dict, List, Optional, Set

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import User


class Role(str, Enum):
    CUSTOMER = "customer"
    TENANT_ADMIN = "tenant_admin"
    ACTOR = "actor"
    PLATFORM_ADMIN = "platform_admin"


class Action(str, Enum):
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    PUBLISH = "publish"
    ACTIVATE = "activate"
    COMPLETE = "complete"
    CANCEL = "cancel"
    ASSIGN = "assign"
    ACCEPT = "accept"
    REJECT = "reject"
    INVITE = "invite"
    CONFIRM = "confirm"


class ResourceType(str, Enum):
    USER = "user"
    TENANT = "tenant"
    ACTOR = "actor"
    DEMAND = "demand"
    TENANT_ENGAGEMENT = "tenant_engagement"
    ACTIVITY_PROJECT = "activity_project"
    PROGRAM_MODULE = "program_module"
    SERVICE_OFFERING = "service_offering"
    PLAN_ITEM = "plan_item"
    QUOTE = "quote"
    CREDENTIAL = "credential"
    PAYMENT = "payment"
    EVIDENCE = "evidence"
    AUDIT_LOG = "audit_log"


# RBAC权限矩阵: {角色: {资源类型: {允许的操作}}}
RBAC_MATRIX: Dict[str, Dict[str, Set[str]]] = {
    Role.PLATFORM_ADMIN.value: {
        ResourceType.USER.value: {a.value for a in Action},
        ResourceType.TENANT.value: {a.value for a in Action},
        ResourceType.ACTOR.value: {a.value for a in Action},
        ResourceType.DEMAND.value: {a.value for a in Action},
        ResourceType.TENANT_ENGAGEMENT.value: {a.value for a in Action},
        ResourceType.ACTIVITY_PROJECT.value: {a.value for a in Action},
        ResourceType.PROGRAM_MODULE.value: {a.value for a in Action},
        ResourceType.SERVICE_OFFERING.value: {a.value for a in Action},
        ResourceType.PLAN_ITEM.value: {a.value for a in Action},
        ResourceType.QUOTE.value: {a.value for a in Action},
        ResourceType.CREDENTIAL.value: {a.value for a in Action},
        ResourceType.PAYMENT.value: {a.value for a in Action},
        ResourceType.EVIDENCE.value: {a.value for a in Action},
        ResourceType.AUDIT_LOG.value: {a.value for a in Action},
    },
    Role.TENANT_ADMIN.value: {
        ResourceType.USER.value: {Action.READ.value},
        ResourceType.TENANT.value: {Action.READ.value, Action.UPDATE.value},
        ResourceType.ACTOR.value: {Action.READ.value},
        ResourceType.DEMAND.value: {Action.READ.value, Action.UPDATE.value, Action.ACTIVATE.value, Action.COMPLETE.value},
        ResourceType.TENANT_ENGAGEMENT.value: {Action.READ.value, Action.ACCEPT.value, Action.REJECT.value, Action.ACTIVATE.value},
        ResourceType.ACTIVITY_PROJECT.value: {Action.CREATE.value, Action.READ.value, Action.UPDATE.value, Action.COMPLETE.value},
        ResourceType.PROGRAM_MODULE.value: {Action.CREATE.value, Action.READ.value, Action.UPDATE.value, Action.PUBLISH.value, Action.ACTIVATE.value},
        ResourceType.SERVICE_OFFERING.value: {Action.CREATE.value, Action.READ.value, Action.UPDATE.value, Action.PUBLISH.value},
        ResourceType.PLAN_ITEM.value: {Action.CREATE.value, Action.READ.value, Action.UPDATE.value, Action.CONFIRM.value, Action.COMPLETE.value},
        ResourceType.QUOTE.value: {Action.CREATE.value, Action.READ.value, Action.UPDATE.value, Action.SEND if hasattr(Action, 'SEND') else 'send'},
        ResourceType.CREDENTIAL.value: {Action.CREATE.value, Action.READ.value, Action.UPDATE.value, Action.CONFIRM.value},
        ResourceType.PAYMENT.value: {Action.READ.value, Action.CONFIRM.value},
        ResourceType.EVIDENCE.value: {Action.CREATE.value, Action.READ.value},
    },
    Role.ACTOR.value: {
        ResourceType.USER.value: {Action.READ.value},
        ResourceType.TENANT.value: {Action.READ.value},
        ResourceType.ACTOR.value: {Action.READ.value, Action.UPDATE.value},
        ResourceType.PROGRAM_MODULE.value: {Action.READ.value},
        ResourceType.ACTIVITY_PROJECT.value: {Action.READ.value},
        ResourceType.PLAN_ITEM.value: {Action.READ.value, Action.UPDATE.value},
    },
    Role.CUSTOMER.value: {
        ResourceType.USER.value: {Action.READ.value},
        ResourceType.TENANT.value: {Action.READ.value},
        ResourceType.ACTOR.value: {Action.READ.value},
        ResourceType.DEMAND.value: {Action.CREATE.value, Action.READ.value, Action.UPDATE.value, Action.DELETE.value, Action.PUBLISH.value},
        ResourceType.TENANT_ENGAGEMENT.value: {Action.READ.value, Action.ASSIGN.value},
        ResourceType.ACTIVITY_PROJECT.value: {Action.READ.value},
        ResourceType.QUOTE.value: {Action.READ.value, Action.ACCEPT.value, Action.REJECT.value},
        ResourceType.PAYMENT.value: {Action.CREATE.value, Action.READ.value},
    },
}


class PermissionChecker:
    """权限检查器"""

    @staticmethod
    def check_rbac(
        user_role: str,
        resource_type: str,
        action: str,
    ) -> bool:
        """检查RBAC权限"""
        role_permissions = RBAC_MATRIX.get(user_role, {})
        resource_permissions = role_permissions.get(resource_type, set())
        return action in resource_permissions

    @staticmethod
    def assert_permission(
        user: User,
        resource_type: str,
        action: str,
    ):
        """断言用户有权限，否则抛出403"""
        if not PermissionChecker.check_rbac(user.role, resource_type, action):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"权限不足: 角色 '{user.role}' 无权对 '{resource_type}' 执行 '{action}'",
            )

    @staticmethod
    def check_data_isolation(
        user: User,
        resource_owner_id: Optional[str] = None,
        resource_tenant_id: Optional[str] = None,
        resource_customer_id: Optional[str] = None,
    ) -> bool:
        """检查数据隔离规则

        - platform_admin: 可访问所有数据
        - tenant_admin: 只能访问自己租户的数据
        - actor: 只能访问自己的数据
        - customer: 只能访问自己的数据
        """
        if user.role == Role.PLATFORM_ADMIN.value:
            return True

        if user.role == Role.TENANT_ADMIN.value:
            return resource_tenant_id is not None and str(user.tenant_id) == str(resource_tenant_id)

        if user.role == Role.ACTOR.value:
            return resource_owner_id is not None and str(user.actor_id) == str(resource_owner_id)

        if user.role == Role.CUSTOMER.value:
            return resource_customer_id is not None and str(user.id) == str(resource_customer_id)

        return False

    @staticmethod
    def assert_data_isolation(
        user: User,
        resource_owner_id: Optional[str] = None,
        resource_tenant_id: Optional[str] = None,
        resource_customer_id: Optional[str] = None,
    ):
        """断言数据隔离，否则抛出403"""
        if not PermissionChecker.check_data_isolation(
            user, resource_owner_id, resource_tenant_id, resource_customer_id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="数据隔离违规: 无权访问该资源",
            )

    @staticmethod
    def check_abac(
        user: User,
        resource_type: str,
        action: str,
        resource_state: Optional[Dict] = None,
    ) -> bool:
        """检查ABAC动态权限

        基于资源状态的动态权限检查，例如:
        - demand.lifecycle == 'completed' 时不可更新
        - project.status == 'active' 时不可删除
        """
        if not PermissionChecker.check_rbac(user.role, resource_type, action):
            return False

        if resource_state is None:
            return True

        # ABAC规则
        lifecycle = resource_state.get("lifecycle")
        status_val = resource_state.get("status")

        # 已完成/已取消的资源不可更新
        if action == Action.UPDATE.value:
            if lifecycle in [LifecycleState.COMPLETED.value, LifecycleState.CANCELLED.value]:
                return False
            if status_val in ["completed", "cancelled", "archived"]:
                return False

        # 已完成的资源不可删除
        if action == Action.DELETE.value:
            if lifecycle == LifecycleState.COMPLETED.value:
                return False
            if status_val in ["completed", "active"]:
                return False

        # 只有private状态才能删除
        if action == Action.DELETE.value:
            publication = resource_state.get("publication")
            if publication == PublicationState.PUBLISHED.value:
                return False

        return True


# 引入状态枚举用于ABAC
from app.core.state_machine import LifecycleState, PublicationState


def require_permission(resource_type: str, action: str):
    """FastAPI依赖: 权限检查装饰器"""
    from app.api.v1.auth import get_current_user

    async def permission_checker(current_user: User = Depends(get_current_user)) -> User:
        PermissionChecker.assert_permission(current_user, resource_type, action)
        return current_user

    from fastapi import Depends
    return permission_checker
