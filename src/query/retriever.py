from llama_index.core import Settings, VectorStoreIndex, StorageContext
from llama_index.llms.azure_openai import AzureOpenAI
from src.embed import get_embedding_model
from src.db import get_pg_store
from src.config import settings
import logging

_query_engine = None
_logger = logging.getLogger(__name__)

def get_query_engine():
    global _query_engine
    if _query_engine is not None:
        _logger.info("Returning cached query engine.")
        return _query_engine
    
    _logger.info("Initializing query engine with BGE-M3 model and Azure OpenAI...")

    llm = AzureOpenAI(
        engine=settings.azure_deployment,
        api_key=settings.azure_api_key,
        azure_endpoint=settings.azure_endpoint,
        api_version=settings.azure_api_version
    )
    
    Settings.embed_model = get_embedding_model()
    Settings.llm = llm  # Azure OpenAI LLM'i ayarla
    
    vector_store = get_pg_store()
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    index = VectorStoreIndex.from_vector_store(vector_store, storage_context=storage_context)
    
    _query_engine = index.as_query_engine(similarity_top_k=5)
    _logger.info("Query engine initialized and cached successfully.")
    
    return _query_engine
