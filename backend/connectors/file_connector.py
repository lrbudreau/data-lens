"""File connector — handles CSV, JSON, Parquet, and Excel uploads."""
import io, pandas as pd
from pathlib import Path
from .base_connector import BaseConnector, TableProfile
from profiler.schema_profiler import profile_dataframe

SUPPORTED_EXTENSIONS = {".csv":"CSV",".json":"JSON",".parquet":"Parquet",".xlsx":"Excel",".xls":"Excel"}

class FileConnector(BaseConnector):
    def __init__(self, file_bytes: bytes, filename: str):
        self.file_bytes = file_bytes; self.filename = filename
        self.extension = Path(filename).suffix.lower(); self._dataframes = {}
    async def connect(self):
        if self.extension not in SUPPORTED_EXTENSIONS: raise ValueError(f"Unsupported: {self.extension}")
        self._dataframes = self._load_file()
    async def disconnect(self): self._dataframes = {}
    async def list_tables(self): return list(self._dataframes.keys())
    async def get_table_profile(self, name): return profile_dataframe(self._dataframes[name], name)
    async def query(self, query, limit=10_000):
        df = self._dataframes[list(self._dataframes.keys())[0]]
        try: return df.query(query).head(limit)
        except: return df.head(limit)
    async def preview(self, name, limit=100): return self._dataframes[name].head(limit)
    def _load_file(self):
        buf = io.BytesIO(self.file_bytes)
        stem = Path(self.filename).stem
        if self.extension == ".csv": return {stem: pd.read_csv(buf, low_memory=False)}
        if self.extension == ".json": return {stem: pd.read_json(buf)}
        if self.extension == ".parquet": return {stem: pd.read_parquet(buf)}
        if self.extension in (".xlsx",".xls"):
            xl = pd.ExcelFile(buf); return {s: xl.parse(s) for s in xl.sheet_names}
        raise ValueError(f"Unsupported: {self.extension}")
