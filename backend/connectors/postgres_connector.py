"""PostgreSQL connector using SQLAlchemy."""
import pandas as pd
from sqlalchemy import create_engine, text, inspect
from .base_connector import BaseConnector, TableProfile
from profiler.schema_profiler import profile_dataframe

class PostgresConnector(BaseConnector):
    def __init__(self, host, port, database, username, password):
        self.url = f"postgresql+psycopg2://{username}:{password}@{host}:{port}/{database}"
        self._engine = None
    async def connect(self):
        self._engine = create_engine(self.url, pool_pre_ping=True)
        with self._engine.connect() as conn: conn.execute(text("SELECT 1"))
    async def disconnect(self):
        if self._engine: self._engine.dispose(); self._engine = None
    async def list_tables(self):
        i = inspect(self._engine)
        return sorted(i.get_table_names(schema="public") + i.get_view_names(schema="public"))
    async def get_table_profile(self, name):
        return profile_dataframe(await self.preview(name, 5000), name)
    async def query(self, query, limit=10_000):
        with self._engine.connect() as conn:
            return pd.read_sql(text(f"SELECT * FROM ({query}) AS _q LIMIT {limit}"), conn)
    async def preview(self, name, limit=100):
        with self._engine.connect() as conn:
            return pd.read_sql(text(f'SELECT * FROM "{name}" LIMIT :limit'), conn, params={"limit":limit})
