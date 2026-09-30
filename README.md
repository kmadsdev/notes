# notes

A VS Code-style text editor that runs in your browser. It's one HTML file with no backend.

**Live → [kmads.dev/notes](https://kmads.dev/notes)**

---

## What it does

Open, edit and save text files in the browser, with live previews for Markdown, YAML, JSON, OpenAPI/Swagger, PlantUML, Mermaid, CSV, HTML and SVG. In Chrome and Edge, files you open are written back to disk automatically. There are no uploads, accounts or servers.

## Features

- **VS Code layout**: title bar with menus and a command center, activity bar, side bar (Explorer, Search, Settings), tabs, breadcrumbs and a status bar
- **Monaco editor**: the editor engine VS Code uses, with syntax highlighting for 80+ languages, including added grammars for PlantUML, Mermaid, TOML, Makefile, diff, log and ignore files
- **Indentation**: new files use 4 spaces by default, and you can change that in Settings. Opened files keep the indentation they already use. Makefiles always use tabs and YAML always uses spaces. Change a single file's indentation from the status bar
- **Previews** (split view on desktop, full screen on phones):
  - Markdown: GitHub-style, with colored code blocks, task lists, tables, front matter and Mermaid blocks
  - YAML (including multi-document files) and JSON: collapsible trees
  - OpenAPI 3 / Swagger 2: Swagger UI
  - PlantUML, Mermaid, CSV/TSV tables, HTML (sandboxed) and SVG
- **Command palette** (`Ctrl/⌘ Shift P`, `F1`) and quick open (`Ctrl/⌘ P`)
- **Search** across open files, with case, whole-word and regex toggles
- **Session restore**: tabs and unsaved text come back after a reload (stored only in your browser)
- **File sync** through the File System Access API (Chromium). Other browsers get **Download**
- **Drag and drop** files anywhere to open them
- **Dark and light themes** from the Workaholic Design System; they can also follow the system setting
- **Responsive**: works on phones (drawer side bar, touch-sized targets, no horizontal scroll)

## Keyboard shortcuts

| Action | Shortcut |
|---|---|
| Command palette | `Ctrl/⌘ Shift P`, `F1` |
| Go to file | `Ctrl/⌘ P` |
| New file | `Alt N` |
| Open / Save / Save As | `Ctrl/⌘ O` / `Ctrl/⌘ S` / `Ctrl/⌘ Shift S` |
| Close editor | `Alt W` |
| Toggle preview | `Ctrl/⌘ Shift V` or `Ctrl/⌘ \` |
| Toggle side bar | `Ctrl/⌘ B` |
| Explorer / Search / Settings | `Ctrl/⌘ Shift E` / `Ctrl/⌘ Shift F` / `Ctrl/⌘ ,` |
| Format document | `Shift Alt F` |
| Word wrap | `Alt Z` |

Browsers reserve `Ctrl N` and `Ctrl W`, which is why the `Alt` versions exist.

## Browser support

| Feature | Chrome/Edge | Firefox | Safari (macOS/iOS) |
|---|---|---|---|
| Edit, preview, download | ✅ | ✅ | ✅ |
| File sync (autosave to disk) | ✅ | ❌ | ❌ |
| Session restore | ✅ | ✅ | ✅ |

## Development

There's no build step. Serve the folder and open it:

```sh
npx http-server .   # or: python3 -m http.server
```

Opening `index.html` directly also works. Everything (HTML, CSS and JS) is inline in `index.html`. Libraries load from jsDelivr at pinned versions: Monaco, and on demand marked, DOMPurify, js-yaml, Swagger UI and Mermaid.

## Project files

| File | Purpose |
|---|---|
| `index.html` | The entire application |
| `notes.svg` | Logo, which is also inlined as the favicon |
| `prototype.svg` | Original Figma layout reference |
| `init.md` | Feature spec and UI documentation |
| `CLAUDE.md` | Guidance for AI coding assistants |

## Design

The app uses the **Workaholic Design System** (`packages/ds` in [kmadsdev/ruph](https://github.com/kmadsdev/ruph)): a graphite ground (`#101010`), panels (`#161616` / `#1C1C1C`), hairlines (`#242424` / `#333333`), muted text `#909090`, brand red `#FF014F` for focus, selection and the active tab, green `#33B474` for "synced". The type is Geist for UI text and Geist Mono for code. Icons are Lucide line icons (ISC) in an inline SVG sprite.

The one deliberate departure from the design system is corner radius. The design system uses square 0–2px corners; notes uses rounded, floating panels (6–16px) to match the current VS Code look.

## Privacy

Files never leave your device. The one exception is PlantUML previews: the diagram source is sent to a PlantUML render server (by default the public [plantuml.com](https://www.plantuml.com) one). You can point it at your own server under **Settings → Preview → PlantUML server**.
