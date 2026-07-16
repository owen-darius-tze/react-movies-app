# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

This repository is freshly initialized and contains no application code yet — only a README, a `.gitignore`, and a LICENSE. There is currently no build system, package manifest, source tree, or test suite to document. Update this file as real code and commands are introduced.

## Project context

Per the README, this repo is for **AI-assisted Claude development as part of a Flyrank AI internship project**. It is a learning/trial workspace, not a production application. Expect work to be exploratory and incremental.

## Environment hints

`.gitignore` is the standard Node.js template (covers `node_modules/`, `.env` files, Next.js/Nuxt/Gatsby/SvelteKit/Vitepress output, etc.). This suggests a **Node/JavaScript/TypeScript** stack is intended, but no `package.json`, lockfile, or framework choice has been committed yet — confirm the actual stack before assuming tooling.

- `.env` files are ignored but `.env.example` is allowed into git — follow that convention for any new environment variable files.
- Common framework output dirs (`dist`, `.next`, `.nuxt`, `build/Release`, `.vite/`) are ignored; don't commit build artifacts.

## Licensing

MIT, copyright 2026 Darius Owen Tse. New files should keep the same license posture unless told otherwise.
