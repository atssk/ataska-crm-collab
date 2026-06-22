# Batcave CRM — Frontend

Frontend-only working copy. React 19 + Vite SPA. The backend (Supabase) is
configured separately and is not part of this repository.

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:5173
```

Without valid Supabase credentials the UI still builds and runs; login and
data features require a backend connection (ask the project owner, or use your
own Supabase project).

## Stack

- React 19 + Vite
- Inline styles only — no CSS files, no UI libraries
- No router — views are switched via state
- Supabase JS client for auth/data, configured via `VITE_SUPABASE_*` env vars

## Commands

```bash
npm run dev      # dev server
npm run build    # production build
npm run preview  # preview build
npm run lint     # eslint
```

## Contributing workflow

- Work on the `dev` branch, or a feature branch created off `dev`.
- Open a Pull Request into `main` — it will be reviewed before merge.
- Direct pushes to `main` are blocked by branch protection.
