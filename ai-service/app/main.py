"""
FastAPI Application Entry Point - SIH25018 Nabha Telemedicine AI Service
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import triage

app = FastAPI(
    title="SIH25018 Nabha Telemedicine AI Triage Microservice",
    description="Explainable AI Preliminary Triage Engine for Rural Healthcare",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Setup — explicit allow-list in production.
origins = [x.strip() for x in os.getenv("CORS_ORIGINS", "http://localhost:5000,http://localhost:8000").split(",") if x.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Include Routers
app.include_router(triage.router)

@app.get("/health", tags=["Health Diagnostic"])
def health_check():
    return {
        "status": "healthy",
        "service": "nabha-telemed-ai-service",
        "version": "1.0.0"
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "SIH25018 Nabha Telemedicine AI Service Active",
        "docs": "/docs"
    }
