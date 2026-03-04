# AGENTS.md

This file defines repository rules for AI coding agents and automation tools.
Unless the user explicitly says otherwise, follow these rules for every change.

## 1) Scope and intent
- Keep changes tightly scoped to the user request.
- Prefer small, reviewable commits over large mixed refactors.
- Do not introduce unrelated dependency, formatting, or architectural changes.

## 2) Code quality baseline
- Preserve existing behavior unless the task explicitly changes behavior.
- Match existing TypeScript, React, and CSS patterns used in this repo.
- Avoid dead code, commented-out code blocks, and placeholder TODOs without context.
- If a change adds non-obvious logic, add a short, useful comment.

## 3) Testing and validation
- Run the smallest meaningful test set for the touched surface before opening a PR:
  - `npm test` for unit/integration logic changes.
  - `npm run test:e2e` for user-flow/UI behavior changes.
  - `npm run build` for build-impacting changes.
- If any required check cannot run locally, state this clearly in the PR description.

## 4) Pull request requirements (mandatory)
- Every PR must include a clear, high-signal description with:
  - What changed.
  - Why it changed.
  - How it was validated (commands run + results).
  - Risks, tradeoffs, or follow-ups (if any).
- Keep PRs focused: avoid combining unrelated fixes/features.
- Include screenshots or short recordings for meaningful UI changes.

## 5) README and docs requirements (mandatory)
- Update `README.md` in the same PR whenever user-facing behavior, setup steps, scripts, or workflows change.
- Update any other nearby docs when they become inaccurate due to the change.
- If no docs update is needed, explicitly note that in the PR description.

## 6) Data, privacy, and secrets
- Never commit API keys, tokens, `.env` files, or sensitive user data.
- Keep this project local-only by default; do not add remote telemetry/services unless requested.
- Do not log secrets or sensitive payloads in source, tests, or fixtures.

## 7) Dependency and config changes
- Do not add or upgrade dependencies unless required for the task.
- When dependencies/configs change, explain necessity and impact in the PR description.
- Keep lockfile changes intentional and minimal.

## 8) Safety rules for edits
- Do not commit directly to `main`.
- Create and work from a feature branch for every change; open a PR to merge into `main`.
- Do not delete or rewrite large sections without clear need tied to the task.
- Do not make destructive git operations (`reset --hard`, history rewrites) unless explicitly requested.
- If you discover unexpected unrelated local changes, pause and call them out before proceeding.

## 9) Definition of done
A task is done only when all are true:
- Requested code changes are implemented.
- Relevant tests/build were run (or inability is clearly documented).
- Docs (`README.md` when needed) are updated.
- PR description is complete and actionable for reviewers.
