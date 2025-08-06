from llama_index.core import Settings, VectorStoreIndex, StorageContext
from src.embed import get_embedding_model
from src.db import get_pg_store

def get_query_engine():
    Settings.embed_model = get_embedding_model()
    vector_store = get_pg_store()
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    index = VectorStoreIndex.from_vector_store(vector_store, storage_context=storage_context)
    # V1: basit retriever; (V2'de rerank + recursive retriever ekleyeceğiz)
    return index.as_query_engine(similarity_top_k=5)
