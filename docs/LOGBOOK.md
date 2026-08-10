# MicroFilm — AI Assistance Logbook

A short, running explanation of **how AI (Claude Code) assisted the development process** for the MicroFilm movie-database website, plus the manual improvements made after reviewing AI-generated code. Companion files: `PROMPTS.md` (verbatim prompts), `MANUAL-EDITS.md` (corrections/refactors), `DECISIONS.md` (architecture choices + user answers).

---

## How AI is used in this process

MicroFilm is being built as part of a Flyrank AI internship exploring **AI-assisted development**. Claude Code's role:

1. **Research & analysis** — fetched live `tvinsider.com` and `rottentomatoes.com` to extract their information architecture (nav, card/rail patterns, score system) rather than guessing from memory. Read TMDB API docs to choose the data source. Recorded the findings in `DECISIONS.md`.
2. **Prompt-driven, gated execution** — per the user's instruction ("ask me questions before executing something"), non-trivial decisions (data source/key, tech stack, score model, scope) were presented as structured questions and only acted on after the user answered. Decisions + answers are logged in `DECISIONS.md`.
3. **Scaffolding** — generating the TypeScript data layer, React components, routes, and CSS design tokens from the agreed design.
4. **Iterative review** — after AI generates code, the human reviews it and performs corrections/refactors (logged in `MANUAL-EDITS.md`).

## Entries

### 2026-07-26 — Project kickoff & plan
- Cleaned the repo of unrelated job-application-form code (see prior cleanup commit); kept the Vite+React+TS scaffold per user choice.
- Live-fetched TV Insider and Rotten Tomatoes IA; researched TMDB API.
- Drafted plan, asked 4 gating questions, recorded answers in `DECISIONS.md` (D2–D5).
- Phase 1 build begins: data layer, design system, Home + TitleDetail routes.

(Future entries appended here as work proceeds.)
