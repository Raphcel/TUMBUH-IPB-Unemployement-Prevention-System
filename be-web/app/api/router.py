from fastapi import APIRouter

from app.api.routes import auth, users, companies, opportunities, applications, bookmarks, externships, notifications

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(companies.router)
api_router.include_router(opportunities.router)
api_router.include_router(applications.router)
api_router.include_router(bookmarks.router)
api_router.include_router(externships.router)
api_router.include_router(notifications.router)
