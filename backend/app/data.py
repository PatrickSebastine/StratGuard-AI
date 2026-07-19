from pathlib import Path

import pandas as pd

from .models import Candle, Dataset


REQUIRED_COLUMNS = ("timestamp", "open", "high", "low", "close", "volume")


def load_dataset(path: Path) -> Dataset:
    frame = pd.read_csv(path)
    missing = set(REQUIRED_COLUMNS).difference(frame.columns)
    if missing:
        raise ValueError(f"missing columns: {', '.join(sorted(missing))}")
    frame = frame.loc[:, REQUIRED_COLUMNS].copy()
    frame["timestamp"] = pd.to_datetime(frame["timestamp"], utc=True, errors="coerce")
    if frame["timestamp"].isna().any():
        raise ValueError("invalid timestamp")
    if frame["timestamp"].duplicated().any():
        raise ValueError("duplicate timestamp")
    if not frame["timestamp"].is_monotonic_increasing:
        raise ValueError("timestamps must be ascending")
    for column in REQUIRED_COLUMNS[1:]:
        frame[column] = pd.to_numeric(frame[column], errors="coerce")
    if frame[list(REQUIRED_COLUMNS[1:])].isna().any().any() or (frame[list(REQUIRED_COLUMNS[1:])] <= 0).any().any():
        raise ValueError("OHLCV values must be positive")
    if ((frame["low"] > frame[["open", "close"]].min(axis=1)) | (frame["high"] < frame[["open", "close"]].max(axis=1))).any():
        raise ValueError("invalid OHLC relationship")
    candles = [Candle(**row) for row in frame.to_dict(orient="records")]
    return Dataset(name=path.name, candles=candles)
