"""Datasets router — file upload endpoints."""
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from connectors.file_connector import FileConnector, SUPPORTED_EXTENSIONS
from ai.chart_suggester import suggest_charts
from ai.nl_query import generate_insight

router = APIRouter()
_sessions: dict[str, FileConnector] = {}

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    ext = "." + file.filename.split(".")[-1].lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file. Supported: {list(SUPPORTED_EXTENSIONS.keys())}")
    contents = await file.read()
    connector = FileConnector(file_bytes=contents, filename=file.filename)
    await connector.connect()
    session_id = str(uuid.uuid4())
    _sessions[session_id] = connector
    tables = await connector.list_tables()
    profiles, suggestions, insights = {}, {}, {}
    for table in tables:
        p = await connector.get_table_profile(table)
        profiles[table] = p
        try: suggestions[table] = await suggest_charts(p); insights[table] = await generate_insight(p)
        except Exception as e: suggestions[table] = []; insights[table] = f"AI unavailable: {e}"
    return {"session_id": session_id, "filename": file.filename, "tables": tables,
        "profiles": {k: {"name":v.name,"row_count":v.row_count,"column_count":v.column_count,
            "columns":[{"name":c.name,"dtype":c.dtype,"semantic_type":c.semantic_type,"nullable":c.nullable,
                "null_pct":c.null_pct,"unique_count":c.unique_count,"cardinality":c.cardinality,
                "sample_values":c.sample_values,"min_value":c.min_value,"max_value":c.max_value,"mean_value":c.mean_value}
            for c in v.columns]} for k,v in profiles.items()},
        "suggestions": suggestions, "insights": insights}

@router.get("/{session_id}/preview/{table_name}")
async def preview_table(session_id: str, table_name: str, limit: int = 100):
    if session_id not in _sessions: raise HTTPException(404, "Session not found")
    df = await _sessions[session_id].preview(table_name, limit=limit)
    return {"columns": list(df.columns), "rows": df.fillna("").values.tolist()}
