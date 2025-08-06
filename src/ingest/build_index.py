from llama_index.core import Settings, VectorStoreIndex, StorageContext
from llama_index.core.node_parser import SentenceSplitter
from src.embed import get_embedding_model
from src.db import get_pg_store
from src.ingest.pdf_loader import load_pdfs

def build_index(pdf_dir: str):
    Settings.embed_model = get_embedding_model()

    splitter = SentenceSplitter(chunk_size=500, chunk_overlap=60)
    documents = load_pdfs(pdf_dir)
    # split -> embed -> store
    nodes = [n for doc in documents for n in splitter.get_nodes_from_documents([doc])]

    vector_store = get_pg_store()
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    index = VectorStoreIndex(nodes, storage_context=storage_context)
    return index
