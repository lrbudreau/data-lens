"""AI chart suggester — uses Claude to recommend visualizations."""
import json, os, anthropic
from connectors.base_connector import TableProfile

SYSTEM = """You are DataLens, an expert data visualization assistant.
Return chart recommendations as a JSON array. Each object must have:
chart_type, title, description, x_column, y_column, color_column, aggregation, confidence.
Return ONLY valid JSON, no markdown."""

async def suggest_charts(profile: TableProfile) -> list[dict]:
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
    cols = "\n".join(f"  - {c.name}: {c.semantic_type} ({c.dtype}), cardinality={c.cardinality}, samples={c.sample_values[:3]}"
                      + (f", range=[{c.min_value},{c.max_value}]" if c.min_value is not None else "")
                      for c in profile.columns)
    msg = client.messages.create(model="claude-opus-4-6", max_tokens=2000, system=SYSTEM,
        messages=[{"role":"user","content":f"Dataset: {profile.name}\nRows: {profile.row_count:,}\nColumns:\n{cols}\n\nRecommend 3-6 charts as JSON array."}])
    raw = msg.content[0].text.strip()
    if raw.startswith("```"): raw = raw.split("\n",1)[1].rsplit("```",1)[0]
    return json.loads(raw)
