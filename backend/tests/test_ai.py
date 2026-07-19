from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_audit_reports_configuration_error_without_openai_key(monkeypatch) -> None:
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    created = client.post("/api/backtests", json={"strategy": {}})
    run_id = created.json()["run_id"]

    response = client.post(f"/api/backtests/{run_id}/audit")

    assert response.status_code == 503
    assert response.json()["code"] == "openai_not_configured"


def test_audit_rejects_unknown_backtest_run() -> None:
    response = client.post("/api/backtests/not-a-run/audit")

    assert response.status_code == 404
