# Humyn Labs · Partner flow + dashboard

One repo, two entry points:

| Path | What | Source |
|---|---|---|
| `/` | Partner onboarding flow — website button → application → login email → partnership agreement → sites → recce → hardware custody → live. Static, fictional data, no backend. | `index.html` |
| `/dashboard/` | Partner Dashboard v2 — four tabs (Payments, Sites, Performance, My Profile) with a breadcrumb drill-down Partner › Site › Operator › Worker › Recording. React + TypeScript, plain CSS, SVG charts, no other dependencies. | `dashboard/index.html`, `src/` |

The flow's "Go to your dashboard" buttons link to `/dashboard/`.

## Run locally

```bash
npm install
npm run dev        # http://127.0.0.1:4173  (flow at /, dashboard at /dashboard/)
npm run build      # outputs dist/ with both entries
```

## Deploy

Import the repo in Vercel — framework preset **Vite**, build `npm run build`, output `dist`. `vercel.json` adds the `/dashboard` rewrite.

## Dashboard structure

- `src/types.ts` — data model: Process → Step → Task, Person, Asset, Recording (three scores: Camera, Task, Coverage), Invoice with adjustments linked to recordings, Notice.
- `src/data.ts` — deterministic fictional sample, labelled "Sample data" in the header. Swap for an API response of the same shape.
- `src/derive.ts` — every number on screen is computed here; nothing is hard-coded.
- `src/router.tsx` — tiny path router; `src/App.tsx` — shell, breadcrumb, role scoping (View as: owner / supervisor / operator in My Profile).
- `src/pages/` — Payments, Sites (site → step task map, people, hardware, today), People (operator, worker), Recording, Performance (+ compare), Profile.

Rules baked in: every number is a door, nothing deeper than three taps, at most three big numbers per level-0 screen, expected hours = workers × 20 h per worker (editable per task), only three quality dimensions.

All names, sites and numbers are fictional. Nothing is wired to Humyn systems.
