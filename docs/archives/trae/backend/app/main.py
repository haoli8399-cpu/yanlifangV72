from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import auth, users, tenants, actors, demands, projects, supply, business
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="演立方 V7.2 - AI 驱动的商演与企业活动经营产品",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(tenants.router, prefix="/api/v1/tenants", tags=["tenants"])
app.include_router(actors.router, prefix="/api/v1/actors", tags=["actors"])
app.include_router(demands.router, prefix="/api/v1/demands", tags=["demands"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(supply.router, prefix="/api/v1/supply", tags=["supply"])
app.include_router(business.router, prefix="/api/v1/business", tags=["business"])

@app.get("/")
async def root():
    return {"message": "演立方 V7.2 API", "version": settings.VERSION}

@app.get("/health")
async def health():
    return {"status": "healthy", "version": settings.VERSION}