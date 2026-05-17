# notes — Browser Text Editor

A VSCode-inspired text editor that runs entirely in the browser. One HTML file, no backend.

- **Repo:** https://github.com/kmadsdev/notes
- **Live:** https://kmads.dev/notes
- **Stack:** HTML + CSS + JS (inline, single file `index.html`)
- **Design reference:** `prototype.svg` (Figma export, 1748 × 1340 px)

---

## Features

### Typography
- **Font:** Monego (https://github.com/cseelus/monego) — a Monaspace-based monospace variant.
  Fallback chain: `"Monego", "Cascadia Code", "JetBrains Mono", monospace`
- Load via `@font-face` from a CDN or self-hosted base64 embed to stay single-file.

### Tab system (multi-file)
- One tab per open file, modelled exactly on VSCode.
- **Active tab:** `#242424` background + 2 px `#FF014F` bottom border + file-type icon + filename.
- **Inactive tabs:** `#101010` background, same height (50 px).
- Tabs scroll horizontally when they overflow — no wrapping.
- Each tab carries state: `{ id, name, content, handle, dirty, language }`.
  - `handle` = `FileSystemFileHandle | null` (null for untitled/new files).
  - `dirty` = unsaved changes indicator (dot prefix on the tab label, like VSCode).

### File operations
| Action | Mechanism |
|---|---|
| New file | Create blank tab with generated name (`Untitled-1`, etc.) |
| Open file | `window.showOpenFilePicker()` → new tab, `handle` stored |
| Save | `handle.createWritable()` → write back to disk |
| Save As | `window.showSaveFilePicker()` → new handle, replace tab's handle |
| Download | `<a download>` with `URL.createObjectURL(Blob)` — fallback with no handle |
| Autosave | Debounced (~1 s after last keystroke), writes through `handle` if present |

Wrap all picker calls in try/catch — user cancellation throws `AbortError`.

### Editor core
- **Monaco Editor 0.52** loaded via AMD CDN loader (jsdelivr).
  ```
  https://cdn.jsdelivr.net/npm/monaco-editor@0.52/min/vs/loader.js
  ```
- One shared `monaco.editor.IStandaloneCodeEditor` instance; swap model on tab switch.
- Language auto-detected from file extension (Monaco has built-in mappings for most types).
- Custom theme (`monaco.editor.defineTheme`) using the palette below.
- `automaticLayout: true` — editor resizes with the window.

### Preview tab
Triggered by a "Preview" button in the tab bar or a split-pane icon. Opens a sandboxed `<iframe srcdoc="...">` next to the editor.

| File type | Detection | Renderer |
|---|---|---|
| Markdown | `.md` | `marked` (CDN) |
| YAML | `.yaml`, `.yml` | `js-yaml` (CDN) → pretty JSON tree |
| JSON | `.json` | built-in collapsible tree (no lib) |
| Swagger / OpenAPI | `.yaml`/`.json` with `openapi:` key | Redoc (CDN) |
| PlantUML | `.puml`, `.plantuml` | encode → `https://www.plantuml.com/plantuml/svg/<encoded>` |
| Other | fallback | syntax-highlighted code view |

### Responsive layout
Three breakpoints, zero framework:

| Breakpoint | Behaviour |
|---|---|
| Desktop ≥ 1024 px | Full layout: activity bar + tab bar + editor |
| Tablet 640–1023 px | Same layout; tab labels shortened; sidebar collapsible |
| Mobile < 640 px | Tab bar scrolls horizontally; 44 px min tap targets; activity bar hidden by default |

---

## UI Layout (from `prototype.svg`)

The canvas is **1748 × 1340 px** — treat this as the reference desktop viewport.

```
┌────────────────────────────────── Title / Tab bar (h=50, #101010) ──────────────────────────────────┐
│  [Logo/branding 316px]  [Active tab 402px ─ #242424 + 2px #FF014F line]  [Inactive tabs]  [⬜ 72px] │
├──────────┬──────────────────────────────────────────────────────────────────────────────────────────┤
│ Activity │                                                                                           │
│   bar    │                        Editor area (#242424)                                              │
│ (w=60px) │                     Monaco Editor fills this region                                       │
│ #242424  │                                                                                           │
│          │                                                                                           │
├──────────┴──────────────────────────────── Status bar (h=23, border-left #9D9D9D) ──────────────────┤
```

### Regions (pixel-exact from prototype)

| Region | x | y | w | h | Color |
|---|---|---|---|---|---|
| Background | 0 | 0 | 1748 | 1340 | `#242424` |
| Title bar | 0 | 0 | 1748 | 50 | `#101010` |
| Branding block | 0 | 0 | 316 | 50 | `#101010` |
| Active tab bg | 316 | 0 | 402 | 50 | `#242424` |
| Active tab line | 316 | 0 | 402 | 2 | `#FF014F` |
| Tab file icon | 335 | 16 | 17 | 19 | (PNG sprite) |
| Window controls | 1676 | 13 | 24 | 24 | — |
| Activity bar | 0 | 50 | 60 | 1293 | `#242424` |
| Editor content | 60 | 53 | 1678 | 1274 | `#242424` |
| Status bar | 60 | 1302 | 1676 | 23 | — |
| Scrollbar thumb | 60 | 1302 | 2 | 25 | `#9D9D9D` |

---

## Color Palette (from `prototype.svg`)

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#101010` | Title bar, inactive tab backgrounds |
| `--surface` | `#242424` | Editor, active tab, activity bar, main canvas |
| `--border-mid` | `#505050` | Dividers, borders |
| `--tab-inactive` | `#515151` / `#565656` | Inactive tab hover states |
| `--text-dim-4` | `#9D9D9D` | Muted text, scrollbar, status bar |
| `--text-dim-3` | `#B2B2B2` | Secondary labels |
| `--text-dim-2` | `#C4C4C4` | Normal body text |
| `--text-dim-1` | `#D9D9D9` | Active / emphasis text |
| `--accent-blue` | `#2DAAE4` | Links, highlights, cursor, selection |
| `--accent-rust` | `#C16D51` | Strings, warm highlights |
| `--accent-danger` | `#FF014F` | Active tab indicator, close buttons, errors |

---

## Technical constraints

- **No backend, ever.** All state is in-memory + File System Access API.
- **Single file.** `index.html` must be self-contained and openable by double-click.
- **CDN only** for external libs. No npm, no bundler.
- File System Access API requires Chrome/Edge (Chromium). Firefox/Safari get the download-only fallback silently.
- PlantUML preview sends diagram source to a public server — document this to users.
