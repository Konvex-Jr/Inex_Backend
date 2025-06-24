from fastapi.middleware.cors import CORSMiddleware

def setup_middleware(app):
    origins = [
        "http://localhost:3000",
        "http://10.20.160.179:3000",
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
