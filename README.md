# Humyn Labs · Partner flow + dashboard

One repo, two entry points:

| Path | What | Source |
|---|---|---|
| `/` | Partner onboarding flow — website button → application → login email → partnership agreement → sites → recce → hardware custody → live. Static, fictional data, no backend. | `index.html` |
| `/dashboard/` | Partner Operations Dashboard v1 (React + TypeScript + Tailwind + Recharts, local state only). | `dashboard/index.html`, `src/` |

The flow's "Go to your dashboard" buttons link to `/dashboard/`.

## Run locally

```bash
npm install
npm run dev        # http://127.0.0.1:4173  (flow at /, dashboard at /dashboard/)
npm run build      # outputs dist/ with both entries
```

## Deploy

Import the repo in Vercel — framework preset **Vite**, build `npm run build`, output `dist`. `vercel.json` adds the `/dashboard` rewrite.

All names, sites and numbers are fictional. Nothing is wired to Humyn systems.
