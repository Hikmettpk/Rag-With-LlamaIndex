# AI-generated: Upload ve upload-ask router
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from pathlib import Path
import tempfile
import uuid
import logging

from llama_index.core import Settings, VectorStoreIndex, StorageContext
from llama_index.core.node_parser import SentenceSplitter
from llama_index.readers.file import PyMuPDFReader
from llama_index.llms.azure_openai import AzureOpenAI
from llama_index.core.vector_stores import MetadataFilters, ExactMatchFilter
from llama_index.core.query_engine import RetrieverQueryEngine

from src.embed import get_embedding_model
from src.db import get_pg_store_uploads
from src.config import settings

from ..schemas.upload import UploadResponse, UploadAskRequest
from ..schemas.query import QueryResponse, Source

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/uploads", tags=["uploads"])

def _ensure_llm():
    llm = AzureOpenAI(
        engine=settings.azure_deployment,
        api_key=settings.azure_api_key,
        azure_endpoint=settings.azure_endpoint,
        api_version=settings.azure_api_version
    )
    Settings.embed_model = get_embedding_model()
    Settings.llm = llm

@router.post("", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    if file.content_type not in ("application/pdf",):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file.")

    # Geçici dosyaya kaydet
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(data)
        tmp_path = tmp.name

    try:
        reader = PyMuPDFReader()
        docs = reader.load_data(Path(tmp_path))
    finally:
        try:
            Path(tmp_path).unlink(missing_ok=True)
        except Exception:
            pass

    for d in docs:
        md = d.metadata or {}
        md.setdefault("file_name", file.filename)
        d.metadata = md

    splitter = SentenceSplitter(chunk_size=500, chunk_overlap=60)
    nodes = [n for doc in docs for n in splitter.get_nodes_from_documents([doc])]

    upload_group_id = str(uuid.uuid4())
    for n in nodes:
        md = dict(n.metadata or {})
        md["upload_group_id"] = upload_group_id
        n.metadata = md

    _ensure_llm()

    vector_store = get_pg_store_uploads()
    storage_ctx = StorageContext.from_defaults(vector_store=vector_store)
    _ = VectorStoreIndex(nodes, storage_context=storage_ctx)

    return UploadResponse(
        upload_group_id=upload_group_id,
        table_name=settings.uploads_table_name,
        num_chunks=len(nodes),
        files=[file.filename],
    )

@router.post("/ask", response_model=QueryResponse, description="Sadece yüklenen belge üzerinde sorgu")
async def ask_uploaded(req: UploadAskRequest) -> QueryResponse:
    if not req.upload_group_id:
        raise HTTPException(status_code=400, detail="upload_group_id is required")

    _ensure_llm()

    vector_store = get_pg_store_uploads()
    storage_ctx = StorageContext.from_defaults(vector_store=vector_store)
    index = VectorStoreIndex.from_vector_store(vector_store, storage_context=storage_ctx)

    """
    # ek import
from llama_index.core.query_engine import RetrieverQueryEngine
...
    filters = MetadataFilters(filters=[ExactMatchFilter(key="upload_group_id", value=req.upload_group_id)])
    retriever = index.as_retriever(similarity_top_k=req.max_results or 5, filters=filters)
    qe = RetrieverQueryEngine.from_args(retriever=retriever)  # AI-generated: fix for 0.13 API
    response = qe.query(req.question)
    """

    filters = MetadataFilters(filters=[ExactMatchFilter(key="upload_group_id", value=req.upload_group_id)])
    retriever = index.as_retriever(similarity_top_k=req.max_results or 5, filters=filters)
    qe = RetrieverQueryEngine.from_args(retriever=retriever)

    response = qe.query(req.question)

    sources: List[Source] = []
    if hasattr(response, "source_nodes"):
        for node in response.source_nodes[: req.max_results or 5]:
            md = node.metadata or {}
            page = md.get("page_number") or md.get("page") or md.get("page_label")
            sources.append(
                Source(
                    text=node.text,
                    document=md.get("file_name", "Unknown"),
                    page=int(page) if isinstance(page, (int, str)) and str(page).isdigit() else None,
                    metadata={k: v for k, v in md.items() if k not in ["file_name", "page_number", "page", "page_label"]},
                )
            )

    return QueryResponse(answer=str(response), sources=sources)