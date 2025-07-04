# app/core/healthcheck.py
import os
import psycopg2
from fastapi import FastAPI

def register_healthcheck(app: FastAPI):

    @app.get("/health", tags=["infra"])
    def healthcheck():
        status = {}

        try:
            conn = psycopg2.connect(
                dbname=os.getenv("DATABASE"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASSWORD"),
                host=os.getenv("DB_HOST"),
                port=os.getenv("DB_PORT"),
            )
            conn.close()
            status["postgres"] = "🟢 conectado"
        except Exception as e:
            status["postgres"] = f"🔴 erro: {str(e)}"

        key = os.getenv("OPENAI_API_KEY")
        if key and key.startswith("sk-"):
            status["openai"] = "🟢 chave configurada"
        else:
            status["openai"] = "🔴 chave ausente ou inválida"

        return status
