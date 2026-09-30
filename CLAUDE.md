# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A browser-based text editor inspired by VSCode — single HTML file, no backend, no build step.

- Live: <https://kmads.dev/notes>
- GitHub: <https://github.com/kmadsdev/notes>
- Design reference: `prototype.svg`
- Feature spec: `init.md`

## Stack constraints

**Everything lives in `index.html`.** There's no bundler, npm or server. Only inline HTML, CSS and JS.

External libraries come from jsDelivr at **pinned versions** and are never checked in. Only Monaco loads at startup; the rest load on demand:

| Purpose | Library |
|---|---|
| Editor | `monaco-editor@0.52.2` (AMD build, `min/vs/loader.js`) |
| Markdown preview | `marked@15.0.12` + `dompurify@3.4.16` |
| YAML preview / OpenAPI parsing | `js-yaml@4.3.2` |
| OpenAPI / Swagger preview | `swagger-ui-dist@5.33.0` (inside the preview iframe) |
| Mermaid | `mermaid@11.17.2` (inside the preview iframe) |
| PlantUML | PlantUML server (`/svg/<encoded>`), configurable in Settings |
| Fonts | Geist + Geist Mono (Google Fonts); Monego / JetBrains Mono / Fira Code are optional |

Parent-page libraries load through Monaco's AMD loader under path aliases (`marked`, `dompurify`, `js-yaml`, `pako`). Never add a plain `<script>` for a UMD library: it would see `define.amd` and register as an AMD module instead of a global. `marked` also defines a *named* module, so it must be requested by its alias.

## Development

There's no build step. Serve the folder (`npx http-server .`) and open it in Chrome. File sync (`showOpenFilePicker` / `showSaveFilePicker`) needs a secure context (https or localhost).

## Architecture (all in `index.html`)

- **Tabs**: `{ id, name, handle, model, language, langOverride, savedVersion, indentSource, viewState, … }`, one Monaco model per tab. The model URI is `file:///<id>/<name>` so the TS/JS workers see the extension (JSX/TSX). A tab is dirty when `model.getAlternativeVersionId() !== savedVersion`, so undoing back to the saved state clears the dirty flag.
- **Indentation**: `applyIndentation()` applies `settings.tabSize` (default **4**) and `insertSpaces`, or detects indentation from content when `detectIndentation` is on. `LANG_INDENT` forces tabs for Makefile and Go and spaces for YAML. A user choice from the status bar (`indentSource: 'user'`) is never overwritten.
- **Languages**: `detectLang()` checks `NAME_LANG` (Dockerfile, Makefile, dotfiles), then `EXT_LANG` overrides, then Monaco's own registry. Untitled files are content-sniffed (`sniffLang`). Extra Monarch grammars live in `registerExtraLanguages()`.
- **Themes**: `wh-dark` / `wh-light` in `defineThemes()`, built from the Workaholic tokens plus the `SYNTAX` palette. The shell uses the DS CSS tokens (`--wh-color-*`) with `[data-theme]`.
- **Preview**: `previewKind(tab)` picks the renderer. Output goes into one of two sandboxed iframes (`allow-scripts allow-popups`, no same-origin) that are double-buffered: the hidden frame renders, then posts `{__notes:1,type:'ready'}` and the frames swap, so updates don't flicker. Scroll position is kept per tab, and Markdown scroll follows the editor.
- **Commands**: `COMMANDS` is the single registry for the palette, menus (`MENUS`) and keybindings (`KEYS`, captured on `window` before Monaco).
- **Persistence**: settings in `localStorage['notes.settings.v2']` (only values that differ from the defaults), session text in `localStorage['notes.session.v2']`, `FileSystemFileHandle`s in IndexedDB `notes/handles`. Wrap every storage call; private mode can throw.

## Design

The app uses the Workaholic Design System (kmadsdev/ruph `packages/ds`): tokens are copied into `:root` at the top of the `<style>` block. Brand red `#FF014F` is for focus, selection and the active indicator, with dark text on red (never white). Green means synced or on. Icons are Lucide paths in the inline `<svg>` sprite (`#i-*`); add new ones there. The radii are intentionally rounder than the design system's (the product asks for a non-square, current VS Code look).

## Responsive layout

- ≥ 1024 px: full layout with menubar, activity bar, side bar and split preview.
- 768–1023 px: the menubar collapses into one menu button.
- < 768 px: the side bar becomes a drawer (hamburger), the preview replaces the editor (eye button in the status bar), and there are no breadcrumbs or minimap.
- `pointer: coarse`: 40–44 px touch targets. Inputs use 16 px text so iOS doesn't zoom on focus.
