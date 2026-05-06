"""
Base connector — all data source adapters inherit from this.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any
import pandas as pd

@dataclass
class ColumnProfile:
    name: str
    dtype: str
    semantic_type: str
    nullable: bool
    null_count: int
    null_pct: float
    unique_count: int
    cardinality: str
    sample_values: list[Any]
    min_value: Any | None
    max_value: Any | None
    mean_value: float | None

@dataclass
class TableProfile:
    name: str
    row_count: int
    column_count: int
    columns: list[ColumnProfile]
    size_bytes: int | None = None

class BaseConnector(ABC):
    @abstractmethod
    async def connect(self) -> None: pass
    @abstractmethod
    async def disconnect(self) -> None: pass
    @abstractmethod
    async def list_tables(self) -> list[str]: pass
    @abstractmethod
    async def get_table_profile(self, table_name: str) -> TableProfile: pass
    @abstractmethod
    async def query(self, query: str, limit: int = 10_000) -> pd.DataFrame: pass
    @abstractmethod
    async def preview(self, table_name: str, limit: int = 100) -> pd.DataFrame: pass
