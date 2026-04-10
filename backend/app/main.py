from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.connection import close_mongo_connection
from app.db.init_db import seed_local_data

@asynccontextmanager
async def lifespan(_: FastAPI):
    seed_local_data()
    try:
        yield
    finally:
        close_mongo_connection()


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Localhost-first e-commerce platform ready for a later MongoDB integration.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_v1_prefix)
