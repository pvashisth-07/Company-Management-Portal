from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import auth, companies, contacts, visits, activities, approvals, engagement, reports, admin

# Create tables in SQLite
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Company Engagement Portal API",
    description="Backend API for managing institutional interactions with recruiting companies and industry organizations (LNMIIT CS314 / Team T066)",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(companies.router)
app.include_router(contacts.router)
app.include_router(visits.router)
app.include_router(activities.router)
app.include_router(approvals.router)
app.include_router(engagement.router)
app.include_router(reports.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to Company Engagement Portal API",
        "documentation": "/docs",
        "system_status": "ONLINE",
        "version": "1.0.0"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "company-engagement-portal"}
