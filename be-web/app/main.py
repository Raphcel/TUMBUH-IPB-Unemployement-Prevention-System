import logging
import os
import time

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi.errors import RateLimitExceeded
from starlette.responses import JSONResponse

from app.config.settings import get_settings
from app.config.limiter import limiter
from app.api.router import api_router
import app.domain.models  # noqa: F401

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

settings = get_settings()


def create_app() -> FastAPI:
    """Application factory — creates and configures the FastAPI instance."""

    application = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    application.state.limiter = limiter

    # ── CORS ─────────────────────────────────────────────────
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    def _cors_headers(request: Request) -> dict:
        origin = request.headers.get("origin", "")
        if origin in settings.CORS_ORIGINS:
            return {
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Credentials": "true",
            }
        return {}

    @application.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Please try again later."},
            headers=_cors_headers(request),
        )

    @application.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled error on %s %s", request.method, request.url.path)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
            headers=_cors_headers(request),
        )

    # ── Security Headers ─────────────────────────────────────
    @application.middleware("http")
    async def add_security_headers(request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

    # ── Request Logging ──────────────────────────────────────
    @application.middleware("http")
    async def log_requests(request: Request, call_next):
        # Pass CORS preflight requests through without logging so that
        # CORSMiddleware (outermost layer) can respond to them directly.
        if request.method == "OPTIONS":
            return await call_next(request)

        start = time.time()
        response: Response = await call_next(request)
        duration = round((time.time() - start) * 1000, 2)
        logger.info(
            "%s %s → %s (%sms)",
            request.method,
            request.url.path,
            response.status_code,
            duration,
        )
        return response

    # ── Register routes ──────────────────────────────────────
    application.include_router(api_router)

    # ── Static files (uploads) ────────────────────────────────
    uploads_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    os.makedirs(os.path.join(uploads_dir, "avatars"), exist_ok=True)
    os.makedirs(os.path.join(uploads_dir, "cvs"), exist_ok=True)
    application.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

    # ── Health check ─────────────────────────────────────────
    @application.get("/health", tags=["Health"])
    def health_check():
        return {"status": "healthy", "version": settings.APP_VERSION}

    return application


app = create_app()
