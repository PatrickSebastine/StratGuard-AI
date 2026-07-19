# StratGuard AI Build Sequence

This is the single execution checklist for the judge-ready release. Check an item only after its evidence is saved or linked below it.

## 1. Offline judge flow

- [x] Start the FastAPI backend locally.
- [x] Start the Vite frontend locally.
- [x] Run the bundled deterministic backtest.
- [x] Confirm metrics and credibility findings render.
- [x] Open the Markdown report.
- [x] Open the Codex review packet.
- [x] Record the exact local verification result and commit SHA.

## 2. Submission assets

- [ ] Save the landing screen screenshot in `docs/screenshots/`.
- [ ] Save the metrics and findings screenshot in `docs/screenshots/`.
- [ ] Save the Markdown report or Codex packet screenshot in `docs/screenshots/`.
- [ ] Record the 2 to 3 minute demo video using `docs/demo-script.md`.
- [ ] Upload the demo video as unlisted and save its URL.

## 3. Public deployment

- [ ] Select and authorize a hosting provider.
- [ ] Deploy the FastAPI backend with the API audit disabled unless an API key is deliberately configured.
- [ ] Deploy the Vite frontend with `VITE_API_URL` set to the public backend URL.
- [ ] Run the complete no-key judge flow on the public URL.
- [ ] Save the public frontend and backend URLs.

## 4. Devpost submission

- [ ] Create the Devpost project draft.
- [ ] Paste `docs/devpost-description.md` and verify the rendered copy.
- [ ] Add the GitHub repository, public demo URL, video URL, and screenshots.
- [ ] Add contributors and tags.
- [ ] Review every field against the challenge rules, then submit.

## 5. Release evidence

- [x] Add `docs/verification-2026-07-19.md` with commands, results, URLs, screenshots, and commit SHA.
- [x] Run backend tests, frontend tests, and production build.
- [ ] Commit and push the release evidence.
