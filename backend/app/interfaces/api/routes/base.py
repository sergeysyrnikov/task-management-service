from datetime import datetime, timezone
from typing import Annotated

from aiologger import Logger  # type: ignore
from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends

from app.core.config.settings import settings
from app.core.di.containers import Container
from app.interfaces.api.dependencies import verify_api_key

root_router = APIRouter(dependencies=[Depends(verify_api_key)])


@root_router.get("/")
@inject
async def root(
    logger: Annotated[Logger, Depends(Provide[Container.logger])],
) -> dict[str, str]:
    """Root endpoint."""
    await logger.info("Root endpoint accessed")
    return {
        "status": "ok",
        "message": f"Welcome to {settings.app.name} {settings.app.version}",
        "version": settings.app.version,
        "timestamp": datetime.now(
            timezone.utc,
        ).isoformat(),
    }
