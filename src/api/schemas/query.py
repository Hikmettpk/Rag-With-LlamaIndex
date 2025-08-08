from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class QueryRequest(BaseModel):
    question: str = Field(
        ..., 
        description="The question to ask about the financial reports",
        example="What was the company's revenue in 2024?"
    )
    max_results: Optional[int] = Field(
        default=5, 
        description="Maximum number of sources to return",
        ge=1,
        le=10
    )

class Source(BaseModel):
    text: str = Field(..., description="The relevant text from the document")
    document: str = Field(..., description="The source document name")
    page: Optional[int] = Field(None, description="Page number in the document")
    metadata: Optional[Dict[str, Any]] = Field(
        default={},
        description="Additional metadata about the source"
    )

class QueryResponse(BaseModel):
    answer: str = Field(..., description="The generated answer")
    sources: List[Source] = Field(
        ..., 
        description="List of sources used to generate the answer"
    )