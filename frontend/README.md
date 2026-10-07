# Frontend

Angular 22 single-page app. All conventions, commands, and agent guidance live in
[`AGENTS.md`](AGENTS.md) — read that first.

Quick start (package manager is **pnpm**, provisioned via Corepack — never npm or yarn):

```bash
pnpm install
pnpm start        # dev server on http://localhost:4200/
pnpm test         # unit tests (Vitest), single run
pnpm test:watch   # unit tests in watch mode, re-run on file changes
pnpm test:coverage # unit tests with coverage report in coverage/frontend/index.html
pnpm lint         # ESLint
pnpm build        # production build
```
