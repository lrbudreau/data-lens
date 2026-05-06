"""Natural language query engine — converts questions to queries using Claude."""
import os, anthropic
from connectors.base_connector import TableProfile

NL_SYSTEM = """Convert natural language questions to pandas .query() expressions or SQL SELECT statements.
Return ONLY the query string, no explanation, no markdown."""

async def nl_to_query(question: str, profile: TableProfile, source_type: str = "file") -> str:
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
    cols = "\n".join(f"  - {c.name} ({c.semantic_type})" for c in profile.columns)
    msg = client.messages.create(model="claude-opus-4-6", max_tokens=500, system=NL_SYSTEM,
        messages=[{"role":"user","content":f"Dataset: {profile.name} ({profile.row_count} rows)\nSource: {source_type}\nColumns:\n{cols}\nQuestion: {question}\nQuery:"}])
    return msg.content[0].text.strip()

async def generate_insight(profile: TableProfile) -> str:
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
    cols = "\n".join(f"  - {c.name}: {c.semantic_type}, {c.unique_count} unique"
                      + (f", range {c.min_value}-{c.max_value}" if c.min_value is not None else "")
                      for c in profile.columns)
    msg = client.messages.create(model="claude-opus-4-6", max_tokens=300,
        messages=[{"role":"user","content":f"Describe this dataset in 2-3 sentences. What is interesting to explore?\n\nDataset: {profile.name}\nRows: {profile.row_count:,}\nColumns:\n{cols}"}])
    return msg.content[0].text.strip()
