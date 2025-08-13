from pydantic import BaseModel, Field
from typing import List, Optional

class UploadResponse(BaseModel):
    upload_group_id: str = Field(..., description="Uploaded chunks group id")
    table_name: str = Field(..., description="Vector table used")
    num_chunks: int = Field(..., description="Number of chunks stored")
    files: List[str] = Field(..., description="Uploaded file names")

class UploadAskRequest(BaseModel):
    question: str = Field(..., description="Question to ask about uploaded doc")
    max_results: Optional[int] = Field(default=5, ge=1, le=10)
    upload_group_id: str = Field(..., description="Group id to filter uploaded chunks")