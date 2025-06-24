from fastapi import FastAPI
from app.api.routes import router
from app.core.middleware import setup_middleware

app = FastAPI()
setup_middleware(app)
app.include_router(router)
