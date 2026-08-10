# MicroFilm — Manual Edits & Refactors

A record of manual improvements, corrections, and refactors performed by the human (or by Claude at the human's review request) **after reviewing AI-generated code**. Each entry captures what changed and why. Companion files: `LOGBOOK.md`, `PROMPTS.md`, `DECISIONS.md`.

> Convention: append new entries at the bottom. Distinguish clearly between (a) fixes to AI-generated code that was incorrect/suboptimal, and (b) deliberate human edits to shape direction.

---

## M1 — 2026-07-26: scaffold cleaned before AI build

Before any MicroFilm code was generated, the prior AI-built job-application form was removed so the new domain (movies) wouldn't inherit unrelated structure. The Vite+React+TS scaffold was retained; a placeholder `App.tsx`/`App.css` was hand-written to keep the build green. (This precedes the AI build but establishes the "review-then-edit" rhythm for the project.)

(Future manual edits appended here as work proceeds — e.g., corrections to the TMDB client, accessibility fixes, score-chip color adjustments after visual review, etc.)

## M2 — 2026-08-01: fix react-query v5 type inference in `useTmdb.ts`

The AI-generated hook helper `opts<T>(extra?: Partial<UseQueryOptions<T>>)` spread a generic `Partial<UseQueryOptions<T>>` into every `useQuery` call. react-query v5 infers the query result type from `queryFn`; when `queryFn` arrives via a separately-typed spread object the generic collapses to `() => never`, producing `ts(2769)` ("No overload matches") on all ~13 hooks plus cascading `ts(2783)` "queryKey specified more than once" noise. Build was red.

**Fix:** replaced the generic `opts()` with a `const defaults` holding only the **non-generic** shared fields (`enabled`, `staleTime`, `refetchOnWindowFocus`, `retry`) and spread `...defaults` into each hook *before* setting `queryKey`/`queryFn`. Each hook's `queryFn` is now an inline, strongly-typed arrow so v5 generics resolve. Hooks that gate on a route id override `enabled` explicitly after the spread. `build` is green again.

## M3 — 2026-08-08: brand-identity pivot (Montserrat + navy palette + real logo)

After the identity-kit brief, the AI-generated `tokens.css` still carried the pre-brief Inter typeface and a coral-red primary (`#ff3d57`/`#e0243e`), and `App.tsx` still rendered a placeholder `●` dot as the "logo." Reviewed against the approved identity kit and corrected:

- **Typeface:** `--font`/`--font-display` switched Inter → **Montserrat** (system-ui fallback kept); Montserrat `<link>` added to `index.html`.
- **Palette:** rewrote both `[data-theme]` blocks — light now near-white `#FAFAFB` page + pure-white cards + navy `#1F3A68` brand + near-black `#15181F` text; dark now deep navy-black `#0C1120` + lighter navy `#4F7CC4` brand + near-white text. Old coral values removed.
- **Logo/favicon:** created `public/logo.svg` + `public/favicon.svg` (film-aperture mark), wired favicon + `<meta name="theme-color">` into `index.html`, and replaced the `●` `.dot` in `App.tsx` `Brand` with `<img src="/logo.svg">`; updated `App.css` (dropped dead `.dot` rule, added `.site-header__brand-logo` sizing).
- **Deliverable:** wrote `docs/IDENTITY.md` (the one-page kit for the track thread).

`npm run build` is green (✓ built in 8.97s).
