"""
Schema profiler — analyses a DataFrame and produces a rich TableProfile.
"""
import pandas as pd
import numpy as np
from typing import Any
from connectors.base_connector import TableProfile, ColumnProfile

def detect_semantic_type(series: pd.Series, col_name: str) -> str:
    name = col_name.lower()
    if name in ("id","uuid","guid") or name.endswith("_id"): return "id"
    if pd.api.types.is_datetime64_any_dtype(series) or "date" in name or "time" in name:
        if series.dtype == object:
            try: pd.to_datetime(series.dropna().head(10)); return "temporal"
            except: pass
        else: return "temporal"
    if series.dtype == bool: return "boolean"
    if "lat" in name: return "geo_lat"
    if "lon" in name or "lng" in name: return "geo_lon"
    if pd.api.types.is_numeric_dtype(series):
        if series.nunique() <= 20 and series.nunique() / max(len(series),1) < 0.05: return "categorical"
        return "numeric"
    if series.dtype == object:
        avg_len = series.dropna().astype(str).str.len().mean() if len(series) > 0 else 0
        if avg_len > 80: return "text"
        if series.nunique() / max(len(series),1) < 0.15: return "categorical"
        return "text"
    return "categorical"

def cardinality_label(series: pd.Series) -> str:
    n, u = len(series), series.nunique()
    if u == n: return "unique"
    ratio = u / max(n, 1)
    if u <= 10: return "low"
    if ratio < 0.1: return "medium"
    return "high"

def profile_column(series: pd.Series, col_name: str) -> ColumnProfile:
    null_count = int(series.isna().sum())
    total = len(series)
    non_null = series.dropna()
    semantic = detect_semantic_type(series, col_name)
    sample = [v.item() if hasattr(v,"item") else v for v in non_null.head(5).tolist()]
    min_val = max_val = mean_val = None
    if pd.api.types.is_numeric_dtype(series) and len(non_null) > 0:
        min_val = float(non_null.min()); max_val = float(non_null.max()); mean_val = float(non_null.mean())
    return ColumnProfile(name=col_name, dtype=str(series.dtype), semantic_type=semantic,
        nullable=null_count>0, null_count=null_count, null_pct=round(null_count/max(total,1)*100,2),
        unique_count=int(series.nunique()), cardinality=cardinality_label(series),
        sample_values=sample, min_value=min_val, max_value=max_val, mean_value=mean_val)

def profile_dataframe(df: pd.DataFrame, name: str) -> TableProfile:
    columns = [profile_column(df[col], col) for col in df.columns]
    return TableProfile(name=name, row_count=len(df), column_count=len(df.columns), columns=columns)
