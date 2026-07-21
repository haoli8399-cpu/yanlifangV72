"""四轴正交状态机

四轴:
1. Readiness (准备度): draft -> incomplete -> complete
2. Lifecycle (生命周期): draft -> active -> archived/completed/cancelled
3. Publication (发布度): private -> publishable -> published
4. Evidence (证据度): declared -> supported -> verified -> expired/conflict

状态转换守卫和审计要求在此定义。
"""
from enum import Enum
from typing import Dict, List, Optional, Set, Tuple

from fastapi import HTTPException, status


class ReadinessState(str, Enum):
    DRAFT = "draft"
    INCOMPLETE = "incomplete"
    COMPLETE = "complete"


class LifecycleState(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class PublicationState(str, Enum):
    PRIVATE = "private"
    PUBLISHABLE = "publishable"
    PUBLISHED = "published"


class EvidenceState(str, Enum):
    DECLARED = "declared"
    SUPPORTED = "supported"
    VERIFIED = "verified"
    EXPIRED = "expired"
    CONFLICT = "conflict"


# 状态转换图: {当前状态: {允许的目标状态}}
READINESS_TRANSITIONS: Dict[str, Set[str]] = {
    ReadinessState.DRAFT.value: {ReadinessState.INCOMPLETE.value, ReadinessState.COMPLETE.value},
    ReadinessState.INCOMPLETE.value: {ReadinessState.COMPLETE.value, ReadinessState.DRAFT.value},
    ReadinessState.COMPLETE.value: {ReadinessState.INCOMPLETE.value},
}

LIFECYCLE_TRANSITIONS: Dict[str, Set[str]] = {
    LifecycleState.DRAFT.value: {LifecycleState.ACTIVE.value, LifecycleState.CANCELLED.value},
    LifecycleState.ACTIVE.value: {LifecycleState.COMPLETED.value, LifecycleState.CANCELLED.value, LifecycleState.ARCHIVED.value},
    LifecycleState.ARCHIVED.value: set(),
    LifecycleState.COMPLETED.value: set(),
    LifecycleState.CANCELLED.value: {LifecycleState.DRAFT.value},
}

PUBLICATION_TRANSITIONS: Dict[str, Set[str]] = {
    PublicationState.PRIVATE.value: {PublicationState.PUBLISHABLE.value},
    PublicationState.PUBLISHABLE.value: {PublicationState.PUBLISHED.value, PublicationState.PRIVATE.value},
    PublicationState.PUBLISHED.value: {PublicationState.PUBLISHABLE.value},
}

EVIDENCE_TRANSITIONS: Dict[str, Set[str]] = {
    EvidenceState.DECLARED.value: {EvidenceState.SUPPORTED.value, EvidenceState.CONFLICT.value},
    EvidenceState.SUPPORTED.value: {EvidenceState.VERIFIED.value, EvidenceState.CONFLICT.value, EvidenceState.DECLARED.value},
    EvidenceState.VERIFIED.value: {EvidenceState.EXPIRED.value, EvidenceState.CONFLICT.value},
    EvidenceState.EXPIRED.value: {EvidenceState.DECLARED.value},
    EvidenceState.CONFLICT.value: {EvidenceState.DECLARED.value, EvidenceState.SUPPORTED.value},
}

# 守卫条件: 转换到目标状态所需的前提条件
TRANSITION_GUARDS: Dict[str, Dict[str, List[str]]] = {
    "demand": {
        "draft->active": [
            "readiness == complete",
            "title is not empty",
            "customer_id is not null",
        ],
        "active->completed": [
            "has_active_project",
            "project.status == completed",
        ],
        "private->publishable": [
            "readiness in [incomplete, complete]",
        ],
        "publishable->published": [
            "readiness == complete",
            "evidence in [supported, verified]",
        ],
    },
    "project": {
        "created->active": [
            "engagement.status == activated",
            "has_main_service_tenant",
        ],
        "active->completed": [
            "all_plan_items_completed",
            "has_credentials",
        ],
    },
    "program_module": {
        "draft->active": [
            "has_active_version",
            "readiness == complete",
        ],
        "private->publishable": [
            "readiness in [incomplete, complete]",
        ],
        "publishable->published": [
            "readiness == complete",
            "evidence in [supported, verified]",
        ],
    },
}


class StateMachine:
    """通用状态机"""

    def __init__(self, transitions: Dict[str, Set[str]], entity_type: str = ""):
        self.transitions = transitions
        self.entity_type = entity_type

    def can_transition(self, current: str, target: str) -> bool:
        """检查是否可以从当前状态转换到目标状态"""
        if current not in self.transitions:
            return False
        return target in self.transitions[current]

    def assert_can_transition(self, current: str, target: str):
        """断言状态转换合法，否则抛出异常"""
        if not self.can_transition(current, target):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"非法状态转换: {current} -> {target} (实体类型: {self.entity_type})",
            )

    def get_allowed_transitions(self, current: str) -> Set[str]:
        """获取当前状态允许的所有转换目标"""
        return self.transitions.get(current, set())


# 预定义状态机实例
readiness_sm = StateMachine(READINESS_TRANSITIONS, "readiness")
lifecycle_sm = StateMachine(LIFECYCLE_TRANSITIONS, "lifecycle")
publication_sm = StateMachine(PUBLICATION_TRANSITIONS, "publication")
evidence_sm = StateMachine(EVIDENCE_TRANSITIONS, "evidence")


def validate_state_transition(
    axis: str,
    current: str,
    target: str,
    entity_type: str = "",
    context: Optional[Dict] = None,
):
    """验证状态转换的合法性

    Args:
        axis: 状态轴 (readiness/lifecycle/publication/evidence)
        current: 当前状态
        target: 目标状态
        entity_type: 实体类型 (demand/project/program_module等)
        context: 上下文信息，用于守卫检查
    """
    sm_map = {
        "readiness": readiness_sm,
        "lifecycle": lifecycle_sm,
        "publication": publication_sm,
        "evidence": evidence_sm,
    }

    sm = sm_map.get(axis)
    if not sm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"未知状态轴: {axis}",
        )

    sm.assert_can_transition(current, target)

    # 检查守卫条件
    if entity_type and context:
        guard_key = f"{current}->{target}"
        guards = TRANSITION_GUARDS.get(entity_type, {}).get(guard_key, [])
        for guard in guards:
            if not _evaluate_guard(guard, context):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"状态转换守卫失败: {guard} (实体: {entity_type}, 转换: {guard_key})",
                )


def _evaluate_guard(guard: str, context: Dict) -> bool:
    """评估守卫条件（简化版）"""
    try:
        if "==" in guard:
            parts = guard.split("==")
            left = parts[0].strip()
            right = parts[1].strip().strip('"\'')
            return str(context.get(left, "")).lower() == right.lower()
        elif "is not empty" in guard:
            field = guard.replace("is not empty", "").strip()
            val = context.get(field)
            return val is not None and val != ""
        elif "is not null" in guard:
            field = guard.replace("is not null", "").strip()
            return context.get(field) is not None
        elif "in [" in guard:
            field = guard.split("in")[0].strip()
            values_str = guard.split("[")[1].split("]")[0]
            values = [v.strip().strip('"\'') for v in values_str.split(",")]
            return str(context.get(field, "")).lower() in [v.lower() for v in values]
        elif "has_" in guard:
            return bool(context.get(guard, False))
        return True
    except Exception:
        return False
