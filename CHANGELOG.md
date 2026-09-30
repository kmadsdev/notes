# Changelog

All notable changes to notes are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- New files ask for a name first, so the right language and preview apply from the start. Leave it empty to get `Untitled-N`.
- Rename a file by double-clicking its tab or its Explorer entry, or by clicking its name in the breadcrumbs. Names are validated as you type. Files opened from disk are renamed on disk too where the browser supports it.
- GitHub link in the activity bar, above Settings.
- Launch videos (desktop and iPhone), workflow GIFs and screenshots in `assets/`.
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, issue forms and a pull request template.

### Changed

- Previews update in place while you type instead of reloading the frame. Markdown with diagrams updates about 7x faster, Swagger UI receives spec updates live, and Mermaid output is cached.
- Each preview type has its own debounce, so fast renderers feel instant and heavy ones don't stall typing.
- Preview libraries warm up in idle time after startup.
- README rewritten.

### Fixed

- Monaco's stylesheet could be skipped when it was preloaded, which broke line numbers and scrollbars. It's no longer preloaded.

## 2026-09-30: VS Code-style refresh

### Added

- New VS Code-style layout: title bar with menus and a command center, activity bar, Explorer / Search / Settings side bar, tabs, breadcrumbs and status bar.
- Workaholic Design System themes (dark and light) with Geist type and Lucide icons.
- Previews for OpenAPI / Swagger (Swagger UI), Mermaid, CSV / TSV, HTML and SVG, alongside Markdown, YAML, JSON and PlantUML.
- Search across open files, a settings page and session restore.
- Configurable indentation, defaulting to 4 spaces, with per-language rules and a status bar override.
- Responsive layout with a drawer side bar and touch-sized targets on phones.

[Unreleased]: https://github.com/kmadsdev/notes/compare/main...HEAD
