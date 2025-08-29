from dataclasses import dataclass
from dotenv import load_dotenv
import os
load_dotenv()

@dataclass
class Settings:
    pg_host: str = os.getenv("PGHOST", "localhost")
    pg_port: int = int(os.getenv("PGPORT", "5432"))
    pg_db: str   = os.getenv("PGDATABASE", "rag_fin")
    pg_user: str = os.getenv("PGUSER", "postgres")
    pg_pw: str   = os.getenv("PGPASSWORD", "postgres")

    # Azure OpenAI Settings
    azure_endpoint: str = os.getenv("AZURE_OPENAI_ENDPOINT")
    azure_api_key: str = os.getenv("AZURE_OPENAI_API_KEY")
    azure_deployment: str = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-35-turbo")
    azure_api_version: str = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")

    # ↓↓↓ YENİ TABLO VE BOYUT ↓↓↓
    table_name: str = "fin_reports_idx_bge_new"
    embed_dim: int = 1024  # BGE-M3 boyutu
settings = Settings()
