"""Connections router — database connection management."""
import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from connectors.postgres_connector import PostgresConnector
from connectors.sqlite_connector import SQLiteConnector
from ai.chart_suggester import suggest_charts
from ai.nl_query import generate_insight

router = APIRouter()
_connections: dict = {}

class PostgresConfig(BaseModel):
    host: str; port: int = 5432; database: str; username: str; password: str

class SQLiteConfig(BaseModel):
    db_path: str

@router.post("/postgres")
async def connect_postgres(config: PostgresConfig):
    c = PostgresConnector(config.host, config.port, config.database, config.username, config.password)
    try: await c.connect()
    except Exception as e: raise HTTPException(400, f"Connection failed: {e}")
    cid = str(uuid.uuid4()); _connections[cid] = c
    return {"connection_id": cid, "tables": await c.list_tables(), "type": "postgres"}

@router.post("/sqlite")
async def connect_sqlite(config: SQLiteConfig):
    c = SQLiteConnector(db_path=config.db_path)
    try: await c.connect()
    except Exception as e: raise HTTPException(400, f"Connection failed: {e}")
    cid = str(uuid.uuid4()); _connections[cid] = c
    return {"connection_id": cid, "tables": await c.list_tables(), "type": "sqlite"}

@router.get("/{cid}/tables")
async def list_tables(cid: str):
    if cid not in _connections: raise HTTPException(404, "Not found")
    return {"tables": await _connections[cid].list_tables()}

@router.get("/{cid}/profile/{table}")
async def get_profile(cid: str, table: str):
    if cid not in _connections: raise HTTPException(404, "Not found")
    p = await _connections[cid].get_table_profile(table)
    return {"profile": {"name":p.name,"row_count":p.row_count,"column_count":p.column_count,"columns":[vars(c) for c in p.columns]},
            "suggestions": await suggest_charts(p), "insight": await generate_insight(p)}

@router.delete("/{cid}")
async def disconnect(cid: str):
    if cid not in _connections: raise HTTPException(404, "Not found")
    await _connections[cid].disconnect(); del _connections[cid]
    return {"status": "disconnected"}
