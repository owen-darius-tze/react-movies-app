# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Command
- `npm run dev` = Vite dev server
- `npm start` = Run compiled backend

## Important
- Run test suite every time after you finished creating / working on a feature.

## Repository status

This repository contains a React-based movie database application (`react-movies-app`) as part of a Flyrank AI internship project. It includes:
- A microfilm-style movie database UI
- A job application form component
- Tailwind CSS configuration
- Mock data and image registry
- Brand identity kit assets

Recent work includes scaffolding the movie database app, building a distinct job application form, and associated registration form components.

## Project context

This is a learning/trial workspace for AI-assisted Claude development as part of a Flyrank AI internship. It is exploratory and incremental in nature, with features being added iteratively.

## Environment hints

- `.gitignore` follows the standard Node.js template (covers `node_modules/`, `.env` files, Vite output, etc.)
- Stack is Node/JavaScript/TypeScript with React, Vite, and Tailwind CSS
- `.env` files are ignored; `.env.example` is allowed into git — follow that convention for any new environment variable files
- Common framework output dirs (`dist`, `.vite/`, etc.) are ignored; don't commit build artifacts
- `tailwind.config.ts` is committed — keep Tailwind config in sync with any component changes
- `data/image-registry.ts` and `data/mock-db.json` provide mock data and image mappings

## Licensing

MIT, copyright 2026 Darius Owen Tse. New files should keep the same license posture unless told otherwise.