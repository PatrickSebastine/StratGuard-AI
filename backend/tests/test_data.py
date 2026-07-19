from pathlib import Path

import pytest

from app.data import load_dataset


def test_rejects_duplicate_timestamps(tmp_path: Path) -> None:
    path = tmp_path / "duplicate.csv"
    path.write_text(
        "timestamp,open,high,low,close,volume\n"
        "2025-01-01T00:00:00Z,1,2,0.5,1.5,1\n"
        "2025-01-01T00:00:00Z,1,2,0.5,1.5,1\n",
        encoding="utf-8",
    )

    with pytest.raises(ValueError, match="duplicate timestamp"):
        load_dataset(path)
