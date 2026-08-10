# MicroFilm — Prompts Log

A verbatim record of prompts the user sent to Claude Code during development, with the date and outcome of each. Companion files: `LOGBOOK.md`, `MANUAL-EDITS.md`, `DECISIONS.md`.

---

## P1 — 2026-07-26 (exact): cleanup request

> "I'm deciding to create a react frontend Movie database website similar to rottentomatoes and imdb and tv insider. Before I explain the huge details and more prompts, I want you to clean the folder first, removing REACT related files that don't correlate with the movie database, DO not remove claude md or readme and anything necessary, ask me if unsure"

**Outcome:** Removed `dist/`, `src/App.tsx`, `src/App.css`, `src/lib/positions.ts`, `src/lib/validations.ts`, and the now-empty `src/lib/`. Kept the Vite+React+TS scaffold (`package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`, `src/main.tsx`, `src/vite-env.d.ts`) plus `CLAUDE.md`, `README.md`, `.gitignore`, `LICENSE`, `.claude/`. Added placeholder `App.tsx`/`App.css` so the scaffold builds (verified `npm run build` ✓). Choices confirmed via AskUserQuestion.

---

## P2 — 2026-07-26 (exact): main build brief

> "Look at Rottentomatoes, imdb, and insider tv, create a movie database website that uses celebrity thumbnail photos from insider tv, and then during the development ask me questions before executing something. Also create a logbook or use existing reasonable files to write a short explanation of how AI is assisted through the process, prompts used during development, Examples of manual improvements, corrections, or refactoring performed after reviewing AI-generated code. But the current objective is: Build a workable movie database website modeled after tv insider and the brand I am thinking now is: MicroFilm. Also, since imdb is seen as outdated, use real-time data and also make the website aesthetically modern in a way that 2026 can comprehend and functionally intuitive that it can be used for all ages. Extract information from databases (real-ones) if necessary."

**Outcome:** Researched TV Insider + Rotten Tomatoes IA live and TMDB API docs. Wrote a plan in `docs/`. Asked 4 gating questions (data source/key, tech stack, score model, scope). Decisions recorded in `DECISIONS.md`. Phase 1 build (Home + TitleDetail) executed.

---

## P3 — 2026-07-26 (exact): write plan into repo docs

> "Please write out a plan in a writable document in the react movies app as well as the questions and so on based on this answer"

**Outcome:** Created `docs/LOGBOOK.md`, `docs/DECISIONS.md`, `docs/PROMPTS.md`, `docs/MANUAL-EDITS.md`, and `.env.example`. This is that work.

---

## P4 — 2026-08-08 (exact): brand identity brief

> "Brief:
> 1. Montserrat as the default font(keep them the same)
> 2. Background must be near white to keep white page and rest user's eyes, main color is navy blue, near black text on white background and if dark background, near white text, use the MicroFilm logo, and create a favicon related to the moviedb
> 3. Note: Ask me questions whenever you execute a high stakes task so i can review, also ask me multiple choice questions, and remember that for this task for now, the Deliverable is The identity kit on one page, fonts named, palette with hex codes, the logo/favicon, and the two-line style note, posted to MY track thread."

**Outcome:** Asked 4 multiple-choice questions (navy hex, near-white hex, logo concept, deliverable packaging). Answers: navy `#1F3A68`, near-white `#FAFAFB`, film-aperture mark, write `docs/IDENTITY.md`. Created `public/logo.svg` + `public/favicon.svg`, wired Montserrat + favicon into `index.html`, pivoted `tokens.css` palette to navy/near-white, swapped the `●` dot for the real logo in `App.tsx`, wrote `docs/IDENTITY.md`. Decisions in `DECISIONS.md` (D7–D9), manual edits in `MANUAL-EDITS.md` (M3).
