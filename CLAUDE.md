# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A browser-based text editor inspired by VSCode — single HTML file, no backend, no build step.

- Live: <https://kmads.dev/notes>
- GitHub: <https://github.com/kmadsdev/notes>
- Design reference: `prototype.svg`
- Feature spec: `init.md`

## Stack constraints

**Everything lives in `index.html`.** No bundler, no npm, no server. Inline HTML + CSS + JS only.

External dependencies loaded from CDN only — never checked in:

| Purpose | CDN |
|---|---|
| Editor | Monaco Editor 0.52 via `https://cdn.jsdelivr.net/npm/monaco-editor@0.52/min/vs/loader.js` |
| Markdown preview | `marked` (lightweight, no plugins needed) |
| YAML preview | `js-yaml` |
| PlantUML preview | PlantUML public render server (`https://www.plantuml.com/plantuml/svg/`) |

## Development

No build step. Open `index.html` directly in Chrome:

```
# Quick test
google-chrome index.html
# or
xdg-open index.html
```

Use Chrome DevTools — F12. The File System Access API (`showOpenFilePicker` / `showSaveFilePicker`) requires a browser context (not `file://` in Firefox). Test file sync in Chrome only.

## Architecture

### Tab system

Tabs mirror VSCode's mental model:

- Each open file = one tab entry `{ id, name, content, handle?, dirty, language }`
- `handle` is a `FileSystemFileHandle` when the file was opened or saved via the picker — `null` for untitled files
- Autosave writes back through `handle.createWritable()` on content change (debounced ~1 s)
- Preview tabs are ephemeral overlays, not file entries — they share the active file's content

### Monaco setup

Use the AMD loader pattern (not ESM) since the CDN ships the AMD build:

```js
require.config({ paths: { vs: 'https://cdn.jsdelivr.net/.../vs' } });
require(['vs/editor/editor.main'], () => {
  monaco.editor.create(container, {
    value: '',
    language: 'markdown',
    theme: 'vs-dark', // override with custom theme below
    fontFamily: 'Monego, "Cascadia Code", monospace',
    fontSize: 14,
    automaticLayout: true,
  });
});
```

Register a custom theme (`monaco.editor.defineTheme`) using the color palette below so the editor matches the shell chrome.

### Preview tab

Detect language from file extension. Render into a sandboxed `<iframe srcdoc="...">`:

- `.md` → `marked.parse(content)` wrapped in minimal CSS
- `.yaml` / `.yml` → `js-yaml.load(content)` pretty-printed as JSON tree
- `.json` → collapsible JSON tree (plain JS, no lib needed)
- `.puml` / `.plantuml` → encode via `plantuml-encoder` or manual deflate+base64, request `https://www.plantuml.com/plantuml/svg/<encoded>`
- Swagger/OpenAPI `.yaml` or `.json` with `openapi:` key → render with Redoc CDN

## Color palette (from `prototype.svg`)

| Role | Hex |
|---|---|
| Background | `#101010` |
| Surface / panel | `#242424` |
| Tab bar / sidebar | `#515151` / `#565656` |
| Border | `#505050` |
| Text muted | `#9D9D9D` → `#B2B2B2` → `#C4C4C4` → `#D9D9D9` |
| Primary accent (blue) | `#2DAAE4` |
| Secondary accent (rust) | `#C16D51` |
| Danger / close | `#FF014F` |

## Font

Monego (Monaspace-based, free). Load from a CDN or embed as base64 `@font-face`. Fallback chain: `"Monego", "Cascadia Code", "JetBrains Mono", monospace`.

## File System Access API patterns

```js
// Open
const [handle] = await window.showOpenFilePicker({ multiple: false });
const file = await handle.getFile();
const text = await file.text();

// Save / autosave
const writable = await handle.createWritable();
await writable.write(text);
await writable.close();

// Download (fallback — no handle)
const a = document.createElement('a');
a.href = URL.createObjectURL(new Blob([text]));
a.download = filename;
a.click();
```

Wrap all `showOpenFilePicker` / `showSaveFilePicker` calls in try/catch — user cancellation throws `AbortError`.

## Responsive layout

Three breakpoints, no framework:

- Desktop (≥ 1024 px): tab bar top, editor full height, optional sidebar
- Tablet (640–1023 px): same layout, smaller tab labels
- Mobile (< 640 px): tab bar scrolls horizontally, touch-friendly tap targets (≥ 44 px)
