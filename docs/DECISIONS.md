# MicroFilm — Decisions Log

A running record of architecture, brand, and scope decisions, including the questions asked of the user during development and their answers. (Per the user's instruction: "during the development ask me questions before executing something.")

---

## D1 — Define the project (2026-07-26)

**Question framing:** The user wants a movie database front end modeled after TV Insider (brand), inspired by Rotten Tomatoes (scores) and IMDb (coverage, which they call "outdated"), with real-time data, modern 2026 aesthetics usable by all ages, and celebrity thumbnail photos.

**Decision:** Brand = **MicroFilm**. Primary IA reference = TV Insider. Score reference = Rotten Tomatoes (adapted honestly — see D4). Modernization directive from "imdb is outdated" = generous spacing, large imagery, mobile-first, low cognitive load.

---

## D2 — Data source & key handling (2026-07-26)

**Question asked:**
> "MicroFilm needs a real-time data source. I recommend the TMDB API … It needs an API key … How do you want to handle the key?"
Options: add key to .env now / build first add key later / hardcoded demo key.

**Answer:** "I'll create .env with my key now."

**Decision:** Use **TMDB API** as the sole data source. Read key from `import.meta.env.VITE_TMDB_API_KEY`. Provide `.env.example`. App must degrade gracefully (EmptyState) if the key is absent rather than crash. Key is exposed in the client bundle (acceptable for an internship demo; a dedicated read-only TMDB key is best).

**Why TMDB:** free, covers movies/TV/people, includes celebrity profile photos, has trending + now-playing endpoints (real-time-ish), image CDN via config endpoint.

---

## D3 — Tech stack additions (2026-07-26)

**Question asked:**
> "Which libraries to add to the scaffold?"
Options: minimal additive set / include Tailwind / fewest deps.

**Answer:** "Minimal additive set (recommended)."

**Decision:** Add **react-router-dom** (pages), **@tanstack/react-query** (caching/loading states), **lucide-react** (icons). Keep existing Vite + React + TS. Styling via **CSS variables + CSS Modules** (no Tailwind).

---

## D4 — Score model (2026-07-26)

**Question asked:**
> "Rotten Tomatoes shows a critic + audience score; TMDB only gives one vote_average. How should MicroFilm present scores?"
Options: single TMDB score / two chips (one derived) / no scores.

**Answer:** "Single TMDB score (recommended)."

**Decision:** Convert TMDB `vote_average` (0–10) to a percentage; show `vote_count` beside it; label **"Micro Meter"**. **No** fabricated critic-vs-audience split. Data honesty over Rotten-Tomatoes mimicry.

---

## D5 — Build scope / phasing (2026-07-26)

**Question asked:**
> "How much to build in the first pass?"
Options: phased (home + detail first) / full multi-page in one pass.

**Answer:** "Phased — home + detail first."

**Decision:**
- **Phase 1 (this pass):** Home page (hero + trending/now-playing/popular/top-rated/upcoming rails) + Title detail page (poster, scores, overview, cast thumbnails).
- **Phase 2 (next):** Search page, Person/celebrity detail page, network/genre rails, watchlist.

---

## D6 — Celebrity thumbnail photos (2026-07-26)

**Resolved without a question (legal + intent reasoning, documented for transparency):**

The user said "uses celebrity thumbnail photos from insider tv." TV Insider uses editorially-licensed/AP-style photos we cannot legally scrape or hotlink. To honor the *intent* (celebrity thumbnails in an editorial style) without IP infringement, MicroFilm uses **TMDB person/profile images** (licensed for API use) rendered in the **TV-Insider editorial thumbnail style** (card + caption + recency/timestamp styling). This is logged here so the deviation from the literal request is visible and reviewable.

---

## D7 — Brand identity: typeface (2026-08-08)

**Question asked:** none — directive from user: "Montserrat as the default font (keep them the same)."

**Decision:** Single typeface **Montserrat** for both body (`--font`) and display (`--font-display`). Loaded from Google Fonts (`wght 400/500/600/700/800`) in `index.html`; system-ui fallback stack retained. Replaced the prior Inter token.

## D8 — Brand identity: palette (2026-08-08)

**Question asked:**
> "Which navy blue should be the MicroFilm main/brand color?" / "Which 'near white' should the light-mode page background use?"

**Answers:** Navy `#1F3A68`. Near-white page `#FAFAFB`.

**Decision:**
- **Light (default):** page bg `#FAFAFB` (near white), cards `#FFFFFF` lift off it, brand navy `#1F3A68`, near-black text `#15181F`, near-white-on-navy `#FFFFFF`.
- **Dark:** deep navy-black bg `#0C1120`, lighter navy brand `#4F7CC4` (so navy still reads on dark), near-white text `#F3F5F8`.
- Text colors intentionally keep "near-black on white / near-white on dark" per the brief. The previous coral-red primary was dropped entirely.

## D9 — Brand identity: logo + favicon (2026-08-08)

**Question asked:** "Which logo concept should the MicroFilm mark use?"

**Answer:** "Film-aperture mark."

**Decision:** `public/logo.svg` = navy rounded tile with a white film frame (two sprocket strips + circular aperture). `public/favicon.svg` = 1:1 variant of the same mark. Wired into `index.html` (`<link rel="icon">` + `<meta name="theme-color" content="#1F3A68">`). Header `Brand` swaps the placeholder `●` dot for the real `<img src="/logo.svg">`.

## D10 — Identity-kit deliverable packaging (2026-08-08)

**Question asked:** "How should I package the identity kit so you can post it to your track thread?"

**Answer:** "Write to docs/IDENTITY.md."

**Decision:** The one-page kit (fonts named, palette hexes, logo/favicon, two-line style note) lives in `docs/IDENTITY.md`, copy-ready for the track thread.
