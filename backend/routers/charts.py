"""Charts router — chart data query endpoints."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class ChartDataRequest(BaseModel):
    session_id: str; table_name: str
    x_column: str | None = None; y_column: str | None = None
    color_column: str | None = None; aggregation: str | None = None
    filters: dict = {}; limit: int = 5000

@router.post("/data")
async def get_chart_data(req: ChartDataRequest):
    from routers.datasets import _sessions
    if req.session_id not in _sessions: raise HTTPException(404, "Session not found")
    df = await _sessions[req.session_id].preview(req.table_name, limit=req.limit)
    for col, val in req.filters.items():
        if col in df.columns: df = df[df[col] == val]
    if req.aggregation and req.x_column and req.y_column:
        func = {"sum":"sum","mean":"mean","count":"count","median":"median"}.get(req.aggregation,"sum")
        df = df.groupby(req.x_column)[req.y_column].agg(func).reset_index()
    cols = [c for c in [req.x_column, req.y_column, req.color_column] if c and c in df.columns]
    result = df[cols] if cols else df
    return {"columns": list(result.columns), "rows": result.fillna("").values.tolist()}
