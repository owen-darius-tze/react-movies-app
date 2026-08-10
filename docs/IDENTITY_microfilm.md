# MicroFilm — Identity Kit

> One-page identity kit for the MicroFilm brand. Copy this whole page into your track thread.

![MicroFilm logo](../public/logo.svg)

## Fonts

- **Montserrat** — the single typeface for both body and display.
  - Loaded from Google Fonts (`Montserrat: wght 400/500/600/700/800`) in `index.html`.
  - CSS variable: `--font` and `--font-display` both resolve to `"Montserrat", system-ui, …`.
  - Fallback stack: `system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.

## Palette (hex codes)

| Role | Light | Dark | Token |
|---|---|---|---|
| **Main color / brand** (navy) | `#1F3A68` | `#4F7CC4` (lighter navy, reads on dark) | `--brand` |
| Page background (near white) | `#FAFAFB` | `#0C1120` | `--bg` |
| Card / surface | `#FFFFFF` | `#11172A` | `--surface` / `--bg-elev` |
| Text — primary (near-black on white / near-white on dark) | `#15181F` | `#F3F5F8` | `--text` |
| Text — muted | `#4B5563` | `#A3ADBF` | `--text-muted` |
| Text — faint | `#8B93A1` | `#68718A` | `--text-faint` |
| Border | `#E3E7EE` | `#232C44` | `--border` |

**Micro Meter** score bands:
- Fresh (≥75%): `#0F9D76` · Mid (50–74%): `#B8860B` · Rotten (<50%): `#D6273F`

## Logo

- **Concept:** film-aperture mark — a navy rounded tile containing a white film frame with two sprocket strips and a circular aperture hole.
- **Files:**
  - `public/logo.svg` — primary mark (used inline as `<img src="/logo.svg">` in the header).
  - `public/favicon.svg` — 1:1 favicon variant of the same mark.
- **Wordmark:** `MicroFilm` set in Montserrat 800, letter-spacing −0.02em, placed beside the mark.

## Favicon

- `public/favicon.svg` — same film-aperture mark, square, optimized for browser tabs.
- Wired in `index.html` via `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`.
- `<meta name="theme-color" content="#1F3A68" />` tints the browser chrome navy.

## Two-line style note

> **Line 1:** A near-white, eye-friendly canvas anchored by a single navy brand color, set entirely in Montserrat for one calm, coherent voice.
>
> **Line 2:** Editorial film-frame marking with generous spacing, rounded cards, and high-contrast near-black / near-white text keep the interface modern for 2026 and effortless for all ages.
