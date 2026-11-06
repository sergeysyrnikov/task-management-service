"""API key dependency."""

from fastapi import HTTPException, Request, status

from app.core.config.settings import settings


async def verify_api_key(request: Request) -> None:
    """Require configured API key header when TEMPLATE_APP_API_KEY is set."""
    expected = settings.app.api_key
    if not expected:
        return
    header_name = settings.app.api_key_header
    provided = request.headers.get(header_name)
    if provided != expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or missing {header_name}",
        )
