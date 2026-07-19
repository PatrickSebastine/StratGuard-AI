# StratGuard AI Verification Record

## Local judge-flow evidence

- Date: 2026-07-19
- Commit before deployment packaging: `321db30`
- Backend health: `GET http://127.0.0.1:8000/api/health` returned `{"status":"ok","product":"StratGuard AI"}`.
- Frontend: `http://127.0.0.1:5173` returned HTTP 200.
- Browser flow: the deterministic BTC/USDT demo completed, showed four metrics and two credibility findings, and exposed both Markdown report and Codex review-packet links.
- API flow: a created run returned HTTP 200 for both `/report?format=markdown` and `/codex-review-packet`.

## Automated verification

```text
backend:  9 passed, 1 upstream Starlette deprecation warning
frontend: 3 passed
build:    vite production build passed
```

## Deployment status

- Render Blueprint configuration: prepared in `render.yaml`.
- Docker local build: not run because Docker is not installed in this workspace.
- Public URL: pending Render account authorization and first deployment.
- API key: intentionally not configured. The no-key flow and Codex review-packet export remain available.

## Remaining media

- Save the browser screenshots in `docs/screenshots/`.
- Record and upload the demo video, then add its unlisted URL to the Devpost project.
