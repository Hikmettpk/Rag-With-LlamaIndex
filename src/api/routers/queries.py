from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List
from ..schemas.query import QueryRequest, QueryResponse, Source
from ...query.retriever import get_query_engine
import logging
from datetime import datetime

# Logger configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/queries",
    tags=["queries"],
    responses={404: {"description": "Not found"}}
)

@router.post(
    "/ask",
    response_model=QueryResponse,
    description="Doğal dili kullanarak sayısal veri içeren belgelere soru sorma",
    response_description="Finansal raporlar esas alınarak üretilen cevaplar"
)
async def query_documents(
    request: QueryRequest,
    background_tasks: BackgroundTasks
) -> QueryResponse:
    try:
        logger.info(f"[{datetime.now()}] Processing query: {request.question}")
        
        # Get query engine
        qe = get_query_engine()
        
        # Execute query
        response = qe.query(request.question)
        
        # Format sources
        sources: List[Source] = []
        if hasattr(response, 'source_nodes'):
            for node in response.source_nodes[:request.max_results]:
                sources.append(Source(
                    text=node.text,
                    document=node.metadata.get("file_name", "Unknown"),
                    page=node.metadata.get("page_number"),
                    metadata={
                        k: v for k, v in node.metadata.items()
                        if k not in ["file_name", "page_number"]
                    }
                ))
        
        background_tasks.add_task(
            logger.info,
            f"[{datetime.now()}] Query completed: {request.question[:50]}..."
        )
        
        return QueryResponse(
            answer=str(response),
            sources=sources
        )
    
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing query: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }