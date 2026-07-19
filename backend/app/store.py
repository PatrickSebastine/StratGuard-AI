import json
import sqlite3
from pathlib import Path


class RunStore:
    def __init__(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        self.path = path
        with self._connect() as connection:
            connection.execute(
                "CREATE TABLE IF NOT EXISTS runs (id TEXT PRIMARY KEY, payload TEXT NOT NULL)"
            )

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self.path)

    def save(self, run_id: str, payload: dict) -> None:
        with self._connect() as connection:
            connection.execute(
                "INSERT OR REPLACE INTO runs (id, payload) VALUES (?, ?)",
                (run_id, json.dumps(payload)),
            )

    def get(self, run_id: str) -> dict | None:
        with self._connect() as connection:
            row = connection.execute("SELECT payload FROM runs WHERE id = ?", (run_id,)).fetchone()
        return json.loads(row[0]) if row else None
