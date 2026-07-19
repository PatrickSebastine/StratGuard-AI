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


def test_completed_run_can_export_a_codex_review_packet() -> None:
    created = client.post("/api/backtests", json={"strategy": {}})
    run_id = created.json()["run_id"]

    response = client.get(f"/api/backtests/{run_id}/codex-review-packet")

    assert response.status_code == 200
    assert "# StratGuard AI Codex Review Packet" in response.text
    assert "does not prove" in response.text
