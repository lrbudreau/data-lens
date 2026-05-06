"""
DataLens Backend — FastAPI application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routers import connections, datasets, charts, ai


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🔭 DataLens backend starting up...")
    yield
    print("🔭 DataLens backend shutting down...")


app = FastAPI(
    title="DataLens API",
    description="Local-first, AI-powered data visualization backend",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(connections.router, prefix="/api/connections", tags=["connections"])
app.include_router(datasets.router,   prefix="/api/datasets",    tags=["datasets"])
app.include_router(charts.router,     prefix="/api/charts",      tags=["charts"])
app.include_router(ai.router,         prefix="/api/ai",          tags=["ai"])


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "version": "0.1.0"}
