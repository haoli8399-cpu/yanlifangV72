import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, ForeignKey, Integer, Numeric,
    Text, Enum, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255))
    phone = Column(String(50))
    role = Column(Enum("customer", "tenant_admin", "actor", "platform_admin", name="user_role"), nullable=False)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"))
    actor_id = Column(UUID(as_uuid=True), ForeignKey("actors.id"))
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    tenant = relationship("Tenant", back_populates="users")
    actor = relationship("Actor", back_populates="user")

class Tenant(Base):
    __tablename__ = "tenants"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    legal_name = Column(String(255))
    description = Column(Text)
    industry = Column(String(100))
    city = Column(String(100))
    status = Column(Enum("pending", "active", "inactive", "archived", name="tenant_status"), default="pending")
    tier = Column(Enum("basic", "pro", "enterprise", name="tenant_tier"), default="basic")
    subscription_start = Column(DateTime)
    subscription_end = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    users = relationship("User", back_populates="tenant")
    programs = relationship("ProgramModule", back_populates="tenant")
    offerings = relationship("ServiceOffering", back_populates="tenant")
    engagements = relationship("TenantEngagement", back_populates="tenant")

class Actor(Base):
    __tablename__ = "actors"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    stage_name = Column(String(255), nullable=False)
    real_name = Column(String(255))
    avatar_url = Column(String(500))
    bio = Column(Text)
    expertise = Column(JSON)
    availability = Column(JSON)
    status = Column(Enum("draft", "active", "inactive", "archived", name="actor_status"), default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="actor")
    program_versions = relationship("ProgramModuleVersion", back_populates="actor")

class Demand(Base):
    __tablename__ = "demands"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    event_type = Column(String(100))
    event_date = Column(DateTime)
    city = Column(String(100))
    budget_min = Column(Numeric(18, 2))
    budget_max = Column(Numeric(18, 2))
    maturity = Column(Enum("consultative", "explicit", "repeat", "professional", name="demand_maturity"), default="consultative")
    readiness = Column(Enum("draft", "incomplete", "complete", name="demand_readiness"), default="draft")
    lifecycle = Column(Enum("draft", "active", "completed", "cancelled", name="demand_lifecycle"), default="draft")
    publication = Column(Enum("private", "publishable", "published", name="demand_publication"), default="private")
    evidence = Column(Enum("declared", "supported", "verified", "expired", "conflict", name="demand_evidence"), default="declared")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    customer = relationship("User")
    tenant = relationship("Tenant")
    engagements = relationship("TenantEngagement", back_populates="demand")

class TenantEngagement(Base):
    __tablename__ = "tenant_engagements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    demand_id = Column(UUID(as_uuid=True), ForeignKey("demands.id"), nullable=False)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    status = Column(Enum("pending", "accepted", "rejected", "activated", "completed", name="engagement_status"), default="pending")
    engagement_type = Column(Enum("main_service", "module_collaboration", name="engagement_type"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    demand = relationship("Demand", back_populates="engagements")
    tenant = relationship("Tenant", back_populates="engagements")
    project = relationship("ActivityProject", uselist=False, back_populates="engagement")

class ActivityProject(Base):
    __tablename__ = "activity_projects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    engagement_id = Column(UUID(as_uuid=True), ForeignKey("tenant_engagements.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(Enum("created", "active", "completed", "cancelled", "archived", name="project_status"), default="created")
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    engagement = relationship("TenantEngagement", back_populates="project")
    plan_items = relationship("PlanItem", back_populates="project")
    quotes = relationship("Quote", back_populates="project")
    credentials = relationship("Credential", back_populates="project")

class ProgramModule(Base):
    __tablename__ = "program_modules"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(100))
    description = Column(Text)
    readiness = Column(Enum("draft", "incomplete", "complete", name="program_readiness"), default="draft")
    lifecycle = Column(Enum("draft", "active", "archived", name="program_lifecycle"), default="draft")
    publication = Column(Enum("private", "publishable", "published", name="program_publication"), default="private")
    evidence = Column(Enum("declared", "supported", "verified", "expired", "conflict", name="program_evidence"), default="declared")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    tenant = relationship("Tenant", back_populates="programs")
    versions = relationship("ProgramModuleVersion", back_populates="program")

class ProgramModuleVersion(Base):
    __tablename__ = "program_module_versions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    program_id = Column(UUID(as_uuid=True), ForeignKey("program_modules.id"), nullable=False)
    actor_id = Column(UUID(as_uuid=True), ForeignKey("actors.id"))
    version_number = Column(Integer, nullable=False)
    duration_minutes = Column(Integer)
    price = Column(Numeric(18, 2))
    description = Column(Text)
    requirements = Column(JSON)
    status = Column(Enum("draft", "active", "archived", name="program_version_status"), default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    program = relationship("ProgramModule", back_populates="versions")
    actor = relationship("Actor", back_populates="program_versions")

class ServiceOffering(Base):
    __tablename__ = "service_offerings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    readiness = Column(Enum("draft", "incomplete", "complete", name="offering_readiness"), default="draft")
    lifecycle = Column(Enum("draft", "active", "archived", name="offering_lifecycle"), default="draft")
    publication = Column(Enum("private", "publishable", "published", name="offering_publication"), default="private")
    evidence = Column(Enum("declared", "supported", "verified", "expired", "conflict", name="offering_evidence"), default="declared")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    tenant = relationship("Tenant", back_populates="offerings")
    versions = relationship("ServiceOfferingVersion", back_populates="offering")

class ServiceOfferingVersion(Base):
    __tablename__ = "service_offering_versions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    offering_id = Column(UUID(as_uuid=True), ForeignKey("service_offerings.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    price = Column(Numeric(18, 2))
    description = Column(Text)
    program_module_version_ids = Column(JSON)
    status = Column(Enum("draft", "active", "archived", name="offering_version_status"), default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    offering = relationship("ServiceOffering", back_populates="versions")

class PlanItem(Base):
    __tablename__ = "plan_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("activity_projects.id"), nullable=False)
    program_module_version_id = Column(UUID(as_uuid=True), ForeignKey("program_module_versions.id"))
    service_offering_version_id = Column(UUID(as_uuid=True), ForeignKey("service_offering_versions.id"))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    price = Column(Numeric(18, 2))
    status = Column(Enum("pending", "confirmed", "in_progress", "completed", "cancelled", name="plan_item_status"), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    project = relationship("ActivityProject", back_populates="plan_items")
    program_version = relationship("ProgramModuleVersion")
    offering_version = relationship("ServiceOfferingVersion")

class MainServiceAssignment(Base):
    __tablename__ = "main_service_assignments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    demand_id = Column(UUID(as_uuid=True), ForeignKey("demands.id"), nullable=False)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    customer_selected = Column(Boolean, default=False)
    tenant_accepted = Column(Boolean, default=False)
    status = Column(Enum("pending", "customer_selected", "tenant_accepted", "active", "completed", "rejected", name="msa_status"), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    demand = relationship("Demand")
    tenant = relationship("Tenant")

class Collaboration(Base):
    __tablename__ = "collaborations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("activity_projects.id"), nullable=False)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    status = Column(Enum("invited", "accepted", "rejected", "active", "completed", name="collaboration_status"), default="invited")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    project = relationship("ActivityProject")
    tenant = relationship("Tenant")

class Quote(Base):
    __tablename__ = "quotes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("activity_projects.id"), nullable=False)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    total_amount = Column(Numeric(18, 2), nullable=False)
    description = Column(Text)
    items = Column(JSON)
    validity_days = Column(Integer, default=7)
    status = Column(Enum("draft", "sent", "accepted", "rejected", "expired", name="quote_status"), default="draft")
    ai_generated = Column(Boolean, default=False)
    human_confirmed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    project = relationship("ActivityProject", back_populates="quotes")
    tenant = relationship("Tenant")

class Credential(Base):
    __tablename__ = "credentials"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("activity_projects.id"), nullable=False)
    type = Column(Enum("contract", "confirmation", "framework", "external", name="credential_type"), nullable=False)
    content = Column(JSON)
    status = Column(Enum("draft", "pending", "confirmed", "expired", "conflict", name="credential_status"), default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    project = relationship("ActivityProject", back_populates="credentials")

class PaymentRecord(Base):
    __tablename__ = "payment_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("activity_projects.id"), nullable=False)
    amount = Column(Numeric(18, 2), nullable=False)
    payment_method = Column(String(100))
    payer_declared = Column(Boolean, default=False)
    receiver_confirmed = Column(Boolean, default=False)
    status = Column(Enum("pending", "declared", "confirmed", "reconciled", "exception", name="payment_status"), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    project = relationship("ActivityProject")

class ChargeableValue(Base):
    __tablename__ = "chargeable_values"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("activity_projects.id"), nullable=False)
    amount = Column(Numeric(18, 2), nullable=False)
    attribution_type = Column(Enum("platform_sourced", "self_owned", name="attribution_type"), nullable=False)
    status = Column(Enum("pending", "active", "billed", "closed", name="cv_status"), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    project = relationship("ActivityProject")

class Evidence(Base):
    __tablename__ = "evidence"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity_id = Column(UUID(as_uuid=True), nullable=False)
    entity_type = Column(String(100), nullable=False)
    content = Column(JSON)
    source = Column(String(255))
    status = Column(Enum("declared", "supported", "verified", "expired", "conflict", name="evidence_status"), default="declared")
    valid_from = Column(DateTime)
    valid_until = Column(DateTime)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    creator = relationship("User")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100))
    resource_id = Column(UUID(as_uuid=True))
    details = Column(JSON)
    ip_address = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")