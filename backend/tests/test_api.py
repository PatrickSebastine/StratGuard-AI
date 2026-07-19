from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_returns_product_identity() -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "product": "StratGuard AI"}


def test_demo_backtest_returns_metrics_findings_and_trades() -> None:
    response = client.post("/api/backtests", json={"strategy": {}})

    assert response.status_code == 201
    body = response.json()
    assert body["metrics"]["trade_count"] >= 0
    assert "findings" in body
    assert "trades" in body
    assert "equity_curve" in body


def test_allows_vite_frontend_origin() -> None:
    response = client.options(
        "/api/backtests",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
