# Job Application Tracker (Local Only)

A local-only React + TypeScript app for tracking job applications with localStorage persistence and JSON export/import.

## Highlights
- No backend, no authentication.
- localStorage-only persistence (`jobTracker.v1.state`).
- Fixed status pipeline: `Wishlist`, `Applied`, `Interview`, `Offer`, `Rejected`, `Archived`.
- One-click sample seed dataset (`Load Sample Data`) for demos/interviews when the tracker is empty.
- Table-first desktop workflow with mobile card layout.
- Dashboard funnel metrics and in-app reminder counts.
- JSON export/import with schema versioning and conflict resolver.
- Optional AI-assisted job draft generation from pasted job descriptions (client-side OpenAI API calls).

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run in development:
   ```bash
   npm run dev
   ```
3. Build static assets:
   ```bash
   npm run build
   ```

## Local Static Usage (No Server Required)
After `npm run build`, open `dist/index.html` directly in Chrome.

The app uses hash routes (`#/...`) and Vite `base: "./"` so static file navigation works without a web server.

## Import/Export
- Export from the `Import / Export` panel as a JSON file.
- Import the JSON on another device and resolve record conflicts per matching `id`:
  - Keep Existing
  - Keep Incoming
  - Keep Both

## AI-Assisted Drafts (Optional)
- Open `AI Settings` in the header and save your OpenAI API key.
- Once a key is saved, `Add Job` becomes a dropdown with:
  - `Paste Job Description`
  - `Enter Manually`
- `Paste Job Description` sends pasted posting text to OpenAI and pre-fills the Add Job form for review before saving.
- AI settings are stored only in localStorage and are not included in app export/import JSON files.

## Test Commands
- Unit + integration tests:
  ```bash
  npm test
  ```
- E2E tests (desktop + mobile Chrome profile):
  ```bash
  npm run test:e2e
  ```
- Accessibility audit (Lighthouse CI):
  ```bash
  npm run test:a11y
  ```
  This builds the app, serves it locally, audits `/#/`, and fails if accessibility score drops below `0.90`.
  The script uses `npx @lhci/cli`, so internet access is required the first time it runs.
