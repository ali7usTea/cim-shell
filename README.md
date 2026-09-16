# Customer360 — RBC Shell

React + Vite Root Business Container (RBC) Shell for the Genesys Cloud CX
agent workspace, built from `react_vite_microfrontend_proposal_v0_3.pdf` and
the Home360-in-Shell reference screenshot.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

`npm run build`, `npm run lint`, and `npm run preview` all work as-is; this
has been typechecked, linted, and built clean.

## What's here vs. what's still open

This is a **Phase 1/2 scaffold** (per the proposal's roadmap §8): the Shell
chrome, Search Context model, and MFE-loading plumbing are real and wired
up; the 14 MFEs themselves are **not** connected yet because no
`remoteEntry` URLs exist for them. Everything degrades gracefully: pick any
capability in the left rail and you'll see a "not connected yet" state
instead of a crash — that's `MainContent` doing its job, not a bug.

`home360` is the one exception: since the reference screenshot is Home360,
`MainContent` renders a local demo card grid for it (`src/mock/data.ts` /
`PlanCard.tsx`) so there's something real on screen. Swap it for the actual
federated remote the same way you'll do for the other 13 — just fill in its
`remoteEntry` in `public/mfe-registry.json`.

## The six regions you asked me to check against the screenshot

| # | Region | Where |
|---|---|---|
| 1 | Global Header | `src/shell/Header` — sidebar toggle, `Customer360` wordmark, search-context tab strip, global search, notification bell, layout/apps/external-link/settings icons, agent badge |
| 2 | Vertical navigation / application tabs | `src/shell/AppNav` — left icon rail, one entry per registry MFE, switches the active MFE for the active search |
| 3 | Customer context / left side panel | `src/shell/CustomerPanel` — read-only view of the active `SearchContext`'s identifiers (`customerId`, `accountNo`, `contractId`, `emiratedId`, `passport`, etc., per proposal §3.2) |
| 4 | Main business content area (body) | `src/shell/MainContent` — the Module Federation mount point + demo/fallback states |
| 5 | Floating interaction notification | `src/shell/FloatingNotification` — dismissible incoming-interaction toast; "Accept" is what actually creates a new Search Context/tab |
| 6 | Side sliding menu (right) | `src/shell/SlideMenu`, opened from `src/shell/RightRail`'s docked "MICRO APPS" strip or the Header's settings icon |

I read the docked right rail in the screenshot as the **collapsed** state of
the sliding menu (call controls / AI assist / notes), rather than a seventh
region — tell me if you had something else in mind there.

## Architecture, in code

- **Search Context** (`src/context/SearchContextProvider.tsx`) — Shell-owned
  state for up to 10 concurrent searches (`MAX_CONCURRENT_SEARCHES` in
  `src/types/index.ts`), matching proposal §3.2/3.3. `openSearch` is the hook
  point for step 4–5 of the end-to-end flow (Genesys search request → new
  tab); today it's called from the floating notification's "Accept" button
  as a stand-in for the real Genesys integration (Phase 3).
- **Runtime MFE registry** (`public/mfe-registry.json` +
  `src/registry/useMfeRegistry.ts`) — fetched at startup instead of
  hard-coding remote URLs anywhere in source, per proposal §5.2 / CLAUDE.md.
  Fill in a `remoteEntry` and flip `status` to `"ready"` as each MFE is
  actually deployed; the Shell picks it up without a rebuild.
- **Dynamic remote loading** (`src/registry/loadRemote.ts`) — uses
  `@originjs/vite-plugin-federation`'s dynamic-remote runtime APIs
  (`__federation_method_setRemote` / `__federation_method_getRemote`) so a
  remote never needs to be known at Shell build time. An entry with no
  `remoteEntry` resolves to `null` instead of throwing — that's the
  "controlled MFE error state" from proposal §5.2, not a bug.
- **Shell ↔ MFE contract** (`src/types/index.ts`) — kept intentionally small:
  `SearchContext`, `AgentSession`, and the `mount(el, ctx)` /
  `unmount(el)` pair every MFE is expected to expose. Nothing here is a
  shared app-wide store — proposal §4.2 and CLAUDE.md's guardrails are both
  explicit that each MFE keeps its own local/business state.
- **Module Federation host config** (`vite.config.mts`) — `remotes: {}` on
  purpose (see registry note above); `shared` pins `react`/`react-dom`/
  `react-router-dom` as singletons so the Shell and every MFE run one React
  instance, matching the pinned versions in `CLAUDE.md`.

## Before wiring up a real MFE

1. Confirm the MFE's own Vite config exposes `./App` (or whatever
   `exposedModule` you set) via `@originjs/vite-plugin-federation`'s
   `exposes`, with the **same** shared/singleton block as this Shell's
   `vite.config.mts`.
2. Have it implement the `FederatedMfeModule` contract
   (`mount(el, ctx)` / `unmount(el)`) from `src/types/index.ts`.
3. Add its `remoteEntry` URL and flip `status` to `"ready"` in
   `public/mfe-registry.json`.

## Known open items (flagging rather than guessing)

- **cim-ui-components isn't wired in.** `CLAUDE.md` names it as the shared
  design-system package (status badges, plan cards, etc.), but it's an
  internal package I don't have access to from here — `PlanCard.tsx` is a
  local stand-in built to match the screenshot. Swap it in once its React 19
  build is confirmed.
- **Genesys integration is mocked.** The floating notification's "Accept"
  simulates step 4–5 of the flow; real Genesys wiring is Phase 3 in the
  roadmap and needs its own contract.
- **The header's search-tab strip** — you mentioned wanting to discuss this
  further; the current tab strip (`src/shell/Header/SearchTabs.tsx`) covers
  live-call timers, close, capacity limiting, and scroll affordances, but
  I've kept it a self-contained component so it's easy to revise without
  touching the rest of the Header.
- **MFE count**: registry ships with 14 entries per `CLAUDE.md`'s stated
  build target; the proposal PDF itself says 14 in some places and "16 plus"
  in others — confirm the final count with the platform team as the doc
  itself suggests.
