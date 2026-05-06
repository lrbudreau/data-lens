"""SQLite connector."""
import pandas as pd
from sqlalchemy import create_engine, text, inspect
from .base_connector import BaseConnector, TableProfile
from profiler.schema_profiler import profile_dataframe

class SQLiteConnector(BaseConnector):
    def __init__(self, db_path: str):
        self.url = f"sqlite:///{db_path}"; self._engine = None
    async def connect(self):
        self._engine = create_engine(self.url, connect_args={"check_same_thread": False})
    async def disconnect(self):
        if self._engine: self._engine.dispose(); self._engine = None
    async def list_tables(self):
        return sorted(inspect(self._engine).get_table_names())
    async def get_table_profile(self, name):
        return profile_dataframe(await self.preview(name, 5000), name)
    async def query(self, query, limit=10_000):
        with self._engine.connect() as conn: return pd.read_sql(text(query), conn).head(limit)
    async def preview(self, name, limit=100):
        with self._engine.connect() as conn:
            return pd.read_sql(text(f'SELECT * FROM "{name}" LIMIT :limit'), conn, params={"limit":limit})
