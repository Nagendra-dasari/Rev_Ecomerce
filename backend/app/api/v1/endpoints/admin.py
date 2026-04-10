from fastapi import APIRouter, Depends

from app.api.deps import require_admin
from app.schemas.admin import AdminDashboardResponse
from app.services.admin_service import admin_service

router = APIRouter(dependencies=[Depends(require_admin)])


@router.get("/dashboard", response_model=AdminDashboardResponse)
async def get_dashboard() -> AdminDashboardResponse:
    return admin_service.get_dashboard()
