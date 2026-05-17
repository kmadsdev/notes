# notes

A VSCode-inspired browser text editor. One HTML file. No backend.

**Live → [kmads.dev/notes](https://kmads.dev/notes)**

---

## What it does

Open, edit, and save text files directly in your browser — including markdown, YAML, JSON, Swagger, and PlantUML diagrams. Files sync back to disk automatically when you use the native file picker (Chrome/Edge). No uploads, no accounts, no server.

## Features

- **Multi-file tabs** — open as many files as you want, switch between them like VSCode
- **Monaco editor** — same engine as VSCode; syntax highlighting, keybindings, minimap
- **File sync** — open a file once, edits write back to disk automatically (File System Access API)
- **Download** — save any file locally without the system picker (Firefox/Safari fallback)
- **Preview tab** — rendered preview for Markdown, YAML, JSON, Swagger/OpenAPI, PlantUML
- **Fully offline** — works with no network after first load (CDN assets can be cached)

## Browser support

| Feature | Chrome/Edge | Firefox | Safari |
|---|---|---|---|
| Edit & download | ✅ | ✅ | ✅ |
| File sync (autosave) | ✅ | ❌ | ❌ |
| Open file → tab | ✅ | ✅ | ✅ |

File sync uses the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API), which is Chromium-only. On other browsers, the **Download** button is the fallback.

## Development

No build step. Just open `index.html` in Chrome:

```sh
google-chrome index.html
# or on Linux
xdg-open index.html
```

Everything is inline — HTML structure, CSS variables, and JS — in a single `index.html` file. Edit it, refresh the browser, done.

## Project files

| File | Purpose |
|---|---|
| `index.html` | The entire application |
| `prototype.svg` | Figma design export — reference for layout and colors |
| `init.md` | Detailed feature spec and UI documentation |
| `CLAUDE.md` | AI coding assistant guidance |

## Design

Color palette and layout are derived from `prototype.svg`. The editor uses the [Monego](https://github.com/cseelus/monego) font — a Monaspace-based free monospace typeface.

Key colors: `#101010` (title bar) · `#242424` (editor/surface) · `#2DAAE4` (accent blue) · `#FF014F` (active tab line) · `#C16D51` (accent rust)

## Privacy

Files never leave your device. PlantUML previews are the only exception — diagram source is sent to the public [PlantUML render server](https://www.plantuml.com) to generate SVG output.
