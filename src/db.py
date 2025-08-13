from llama_index.vector_stores.postgres import PGVectorStore
from src.config import settings

def get_pg_store():
    return PGVectorStore.from_params(
        database=settings.pg_db,
        host=settings.pg_host,
        port=settings.pg_port,
        user=settings.pg_user,
        password=settings.pg_pw,
        table_name=settings.table_name,
        use_halfvec=True,  #For half vector
        embed_dim=settings.embed_dim,
    )

def get_pg_store_uploads():
    return PGVectorStore.from_params(
        database=settings.pg_db,
        host=settings.pg_host,
        port=settings.pg_port,
        user=settings.pg_user,
        password=settings.pg_pw,
        table_name=settings.uploads_table_name,
        use_halfvec=True,
        embed_dim=settings.embed_dim
    )