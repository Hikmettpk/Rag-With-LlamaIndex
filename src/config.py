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

    # ↓↓↓ YENİ TABLO VE BOYUT ↓↓↓
    table_name: str = "fin_reports_idx_bge"
    embed_dim: int = 1024  # BGE-M3 boyutu
settings = Settings()
