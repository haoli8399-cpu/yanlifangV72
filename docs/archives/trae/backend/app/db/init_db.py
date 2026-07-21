"""数据库初始化和迁移脚本

执行: python -m app.db.init_db
"""
import asyncio
import logging

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import Base, engine, async_session
from app.db.models import (
    User, Tenant, Actor, Demand, TenantEngagement, ActivityProject,
    ProgramModule, ProgramModuleVersion, ServiceOffering, ServiceOfferingVersion,
    PlanItem, MainServiceAssignment, Collaboration, Quote, Credential,
    PaymentRecord, ChargeableValue, Evidence, AuditLog
)
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def init_db():
    """创建所有表"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    logger.info("数据库表创建完成")


async def seed_data():
    """填充种子数据"""
    async with async_session() as session:  # type: AsyncSession
        # 创建平台管理员
        admin = User(
            email="admin@yanlifang.com",
            password_hash=get_password_hash("admin123"),
            full_name="平台管理员",
            role="platform_admin",
            is_active=True,
            is_verified=True,
        )
        session.add(admin)

        # 创建测试服务商
        tenant = Tenant(
            name="星河演艺",
            legal_name="星河演艺有限公司",
            description="专业商演服务商",
            industry="演艺服务",
            city="北京",
            status="active",
            tier="pro",
        )
        session.add(tenant)
        await session.flush()

        tenant_admin = User(
            email="tenant@yanlifang.com",
            password_hash=get_password_hash("tenant123"),
            full_name="服务商管理员",
            role="tenant_admin",
            tenant_id=tenant.id,
            is_active=True,
            is_verified=True,
        )
        session.add(tenant_admin)

        # 创建测试艺人
        actor = Actor(
            stage_name="李明星",
            real_name="李明",
            bio="资深主持人，10年商演经验",
            expertise={"categories": ["主持", "策划"], "languages": ["中文", "英语"]},
            availability={"weekdays": True, "weekends": True},
            status="active",
        )
        session.add(actor)
        await session.flush()

        actor_user = User(
            email="actor@yanlifang.com",
            password_hash=get_password_hash("actor123"),
            full_name="李明星",
            role="actor",
            actor_id=actor.id,
            is_active=True,
            is_verified=True,
        )
        session.add(actor_user)

        # 创建测试客户
        customer = User(
            email="customer@yanlifang.com",
            password_hash=get_password_hash("customer123"),
            full_name="张客户",
            role="customer",
            is_active=True,
            is_verified=True,
        )
        session.add(customer)

        await session.commit()
        logger.info("种子数据填充完成")
        logger.info("测试账号:")
        logger.info("  管理员: admin@yanlifang.com / admin123")
        logger.info("  服务商: tenant@yanlifang.com / tenant123")
        logger.info("  艺人: actor@yanlifang.com / actor123")
        logger.info("  客户: customer@yanlifang.com / customer123")


async def main():
    await init_db()
    await seed_data()


if __name__ == "__main__":
    asyncio.run(main())
