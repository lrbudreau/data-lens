"""AI router — natural language query endpoints."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class NLQueryRequest(BaseModel):
    session_id: str; table_name: str; question: str

@router.post("/query")
async def natural_language_query(req: NLQueryRequest):
    from routers.datasets import _sessions
    from ai.nl_query import nl_to_query
    if req.session_id not in _sessions: raise HTTPException(404, "Session not found")
    connector = _sessions[req.session_id]
    profile = await connector.get_table_profile(req.table_name)
    query = await nl_to_query(req.question, profile, source_type="file")
    try:
        df = await connector.query(query)
        return {"query": query, "columns": list(df.columns), "rows": df.fillna("").values.tolist(), "row_count": len(df)}
    except Exception as e: raise HTTPException(400, f"Query failed: {e}")
