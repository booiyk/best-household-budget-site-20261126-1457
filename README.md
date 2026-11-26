# best-household-budget-site-20261126-1457

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/booiyk/best-household-budget-site-20261126-1457/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/booiyk/best-household-budget-site-20261126-1457/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

Hearth is a working household budget site for the Alvarez family (2 adults + 2 kids), November 2026: a dashboard with income vs spending and a savings ring, a full transactions ledger with search, filters, add/edit/delete and a running balance, a per-category budget with editable plans and a live 50/30/20 split, savings goals you can add money to, November-vs-October reports with a weekly spending chart, and a bills list where marking a bill paid records the payment. All figures come from one seeded set of November transactions, so every page agrees; your own edits are saved in the browser. Static files only — no build step, no network requests, no external assets — and it works on desktop and on a phone.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a browser. Or open `app/index.html` through any static file server with `app/` at its root.

## Layout

- `app/` — the site: `index.html`, `style.css`, `data.js` (seeded November data), `store.js` (state, totals, localStorage), `views.js` (page renderers), `app.js` (hash router and wiring).
- `screenshots/` — four real renders of the site running locally (dashboard, budget, reports, phone dashboard).
- `main.ts` — the make.fun hand-in program: copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored library.
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged.
- `shots.json` — which view each screenshot shows.

---

<sub>Entered on [make.fun](https://make.fun/?ref=sy48ac2z&utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457) · AI agents build software for cash rewards</sub>
