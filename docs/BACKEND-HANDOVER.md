# Humyn Labs partner platform — backend handover

Two things in this file:

1. **How to run this with Claude Code** (read once, 2 minutes).
2. **The kickoff prompt** — copy everything below the line into Claude Code as your first message.

---

## 1. How to run this with Claude Code

- Make a new empty folder for the backend (e.g. `~/github/humyn-platform`), `git init`, and start Claude Code there with the strongest model and high effort: `claude --model opus --permission-mode plan`.
- Plan mode first. Claude reads, asks and writes plans but does not touch files until you approve. Approve the plan, then let it build. Switch modes with `Shift+Tab`.
- Keep this handover in the repo as `docs/HANDOVER.md`. After the first session, run `/init` so Claude writes a short `CLAUDE.md` (commands, conventions, gotchas) — keep that file short; the long context lives in `docs/`.
- One task per session. `/clear` between unrelated tasks. If you've corrected it twice on the same thing, `/clear` and re-prompt with what you learned.
- Always ask for evidence: tests that pass, a command's output, a screenshot. Don't accept "done".
- For anything big, let it interview you first (the prompt below does this), and have it write `SPEC.md` before any code.

---

## 2. Kickoff prompt (paste from here)

You are taking over as the backend and systems engineer for Humyn Labs' partner platform. Until now a product/design agent built the front end and worked out the operations with me; from here the work is code and systems. This message is the handover. Read all of it before doing anything.

### Who we are

Humyn Labs (humynlabs.ai, Bengaluru) is a real-world data provider for physical AI and frontier robotics labs. Labs tell us what data they need (video and multisensory recordings of real people doing real physical work); we collect it at factories, kitchens, warehouses, hospitals, farms and other sites; we validate it; we deliver it. Today we collect a lot of it ourselves with our own staff. The goal is to outsource collection entirely to **data collection partners** worldwide and become a data lab, not a data-collection company.

### What a data collection partner does, end to end

We provide the hardware (cameras, SD cards, power banks, mounts). The partner does everything on the ground: finds sites, gets the owner's consent, does the recce (documents the work as Site → Process → Step → Task, in real operational order — this is a firm rule from our founder), employs supervisors and operators, takes custody of our hardware, records workers every day, uploads, fixes what we reject, and reconciles and returns hardware. We review every recording, accept or reject it with a reason, and pay the partner only for accepted hours, on a 15-day cycle. We also pay the site. The partner is liable for lost or mishandled hardware at unit value.

The operations loop, which is what the backend has to model: apply → we review → selected partners get a login and sign the agreement → partner adds sites → we approve each site → partner does the recce → we approve tasks → we allocate and ship hardware, partner confirms receipt, we review the receipt, custody is confirmed → site goes live → daily recording, upload, our review (accept/reject with reason and a quality score) → partner raises invoices on accepted hours → we pay → hardware reconciliation → site closes and hardware comes back.

Vocabulary that must be used exactly: **site, process, step, task, worker** (the person being recorded), **operator** (partner's person running the recording on the floor), **supervisor** (manages operators at a site), **recording**, **accepted / rejected** (never "lost"), **quality score**, **custody**, **asset** (one physical item with an asset ID), **allocation, dispatch, receipt, reconciliation**, **invoice**. The 20-hour rule: a worker's hours on one task count only up to 20; beyond that they aren't paid.

### What already exists (the front end you are building the backend for)

Repo `omjambhale/flow` on GitHub, deployed on Vercel. Two parts:

- `index.html` — the partner onboarding flow as a working static prototype: website button "Become a data collection partner" → application form → received → (selection) email with login link + agreement → sign → add sites (site identification form) → site approval → recce form (processes, then tasks per process) → hardware handover (allocation, dispute quantities, custody schedule signed, dispatch, confirm receipt, Humyn review, custody confirmed) → live. Every screen, field and state in it is a requirement.
- `/dashboard/` — React + TypeScript + Vite partner dashboard. **`src/types.ts` is the data contract the dashboard expects; `src/derive.ts` holds every computed number; `src/data.ts` is sample data in that shape.** Tabs: Sites, Payments, Performance, Hardware, Help & SOPs, plus Profile. The backend must serve real data in that shape (or a shape you propose and then update the dashboard to match — either way, one contract).

Read both thoroughly before proposing anything. They are the spec for what partners see. The dashboard was built as a mockup that goes directly to production, so treat it as the target, not a sketch.

Also existing internally (context only, do not build on them unless you conclude we should): Google Forms/Apps Script for site identification and recce, a Google Apps Script "Site Approvals" dashboard, Superset for internal validation dashboards, spreadsheets as process maps and inventory master, an operator app and a supervisor app (mobile) that log hardware In Site → In Use → In Site daily, and a generic website contact form whose leads land in a Google Sheet. These are fragmented and ad hoc — that is why we are building this.

### What we want from you

We are building from scratch and are not tied to any current tool or platform. First think about the **ideal operations model** for this loop — the entities, the state machines (partner, site, task, asset, recording, invoice), who can do what, what is an event and what is derived — and only then the system. Then design and build the backend: data model, API, auth and per-partner isolation, file/video intake, review workflow for our internal team, hardware custody ledger, payments and invoices, notifications (email/WhatsApp), and the internal admin side our own team needs (application review, site and task approval, recording review, hardware allocation, payouts). Propose the stack with reasons; we will pick together.

Hard requirements:

- Partners see only their own organisation's data. Never expose internal master inventory, approval logic or other partners.
- Every state change is an event with who/when/why; nothing is silently overwritten and **nothing is ever deleted** — archive or void, with history.
- The partner is the only dashboard viewer; supervisors and operators use the mobile apps. The partner controls operators, so all quality analysis rolls up to operators.
- Hardware: every asset has an ID; custody moves only on confirmed events (allocation → dispatch → receipt confirmed by partner → reviewed by Humyn → custody). Loss and damage are settled at unit value in the next payment cycle.
- Money: partners raise their own invoices on accepted hours; we approve and pay; every invoice shows the arithmetic.
- Simple and intuitive over clever. Our partners include small operators on phones in noisy factories.

### Links — strictly view only

Open these to understand the current state. **Do not edit, comment on, reorganise or delete anything in any of them, and do not create new files inside them.** Read only.

- Website: https://humynlabs.ai
- Front end (this is your contract): https://github.com/omjambhale/flow — flow at `index.html`, dashboard under `/dashboard/`
- v1 dashboard (older, for reference of what we moved away from): https://humyn-partner-dashboard.vercel.app/ and https://github.com/omjambhale/partner-
- Feedback log on the flow, with before/after per point: https://app.notion.com/p/Partner-Onboarding-and-Dashboard-Changes-3d5742cd1dc78030adeee64c4fc44814
- Partnership agreement (real template emailed to partners; SOW 1 has the validation criteria and the 20-hour rule): https://docs.google.com/document/d/1prrDtABw75Q3POsLV1MdQ12Fe0xAEi16/edit
- Process / workflow workbook (one-sheet overview of the ops): https://docs.google.com/spreadsheets/d/1IMlSWc79hiKmmPQmq2PaXmZ-v90L8cdQ_Q8mBhjurW0/edit?gid=1009320822
- Current Site Identification form: https://site-id.humynlabs.ai/ · current Recce form: https://site-recce.humynlabs.ai/
- Site Approvals dashboard (Apps Script): https://script.google.com/macros/s/AKfycbwEAQMjzF5bI23z93DufOFSQMq0x-zFPoHJZIHzzYwohDcqb0ADzPjIS3L5K8Yuzv2HxQ/exec
- Internal validation dashboards (Superset; the "Humyn Validation Final" Task tab shows task distribution, worker hours and the 20-hour view we want in the product): https://superset.humynlabs.io/dashboard/list/
- Website leads today (the "Leads" tab — partner leads are the rows typed "Supplier", mixed with customer and PR leads): https://docs.google.com/spreadsheets/d/10VLeXoDIwUQjMc0VoEkwLPpSWt7DlXm2YtXDl80bOKs/edit?gid=1640964993#gid=1640964993
- Brand kit (fonts Rethink Sans + Zilla Slab, coral #FF6E42, ink #161516): Drive folder `1VZb0sAaYRwJTB9fupC-VZzz3Ev1Ab5nv`

If a link needs a login you don't have, say so and move on; don't guess its contents.

### How to work with me

- Don't assume. When something is ambiguous or two sources conflict, ask me — one question at a time, in plain language, with a recommended answer.
- Explain concepts in one line. I'll ask if I want more.
- Never delete anything — in code, data, or any linked document. Ever.
- Show evidence, not claims: test output, the command and its result, a screenshot.
- Small commits with clear messages. Push only when I say.

### First session, in this order

1. Read this file, then read `omjambhale/flow` end to end: `index.html` (every `data-step` screen), `dashboard/src/types.ts`, `derive.ts`, `data.ts`, and the pages. Use subagents for the reading so the main context stays clean, and report back a summary of the entities, states and numbers the front end expects.
2. Open the view-only links and note what each system does today and what data it holds.
3. Interview me with the AskUserQuestion tool about the hard parts: review workflow and who on our team does what, video intake and storage volumes, payment approvals, hardware allocation rules, what the mobile apps must sync, hosting and budget, timeline. Don't ask obvious questions.
4. Write `docs/OPERATIONS.md` (the ideal ops model: entities, state machines, events, roles) and `docs/SPEC.md` (stack proposal with reasons, data model, API surface mapped to `types.ts`, auth and isolation, phased build plan with a verification step for each phase). Stop there and wait for my approval before writing any application code.
