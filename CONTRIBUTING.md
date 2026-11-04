# Contributing to notes

Thanks for helping make notes better. This guide covers how to run it, how the code is laid out and what we look for in a pull request.

## Ways to help

- **Report a bug** with the [bug report form](https://github.com/kmadsdev/notes/issues/new?template=bug_report.yml). Include your browser, your OS and a file that reproduces it if you can.
- **Suggest a feature** with the [feature request form](https://github.com/kmadsdev/notes/issues/new?template=feature_request.yml). Say what you're trying to do, not only what you'd add.
- **Pick up an issue.** Issues labelled `good first issue` are small and well scoped. Comment on one before you start so two people don't build the same thing.
- **Improve the docs.** Typos, unclear steps and missing shortcuts are all fair game.

## Running notes locally

There's no build step and nothing to install.

```sh
git clone https://github.com/kmadsdev/notes.git
cd notes
npx http-server .        # or: python3 -m http.server 8080
```

Open `http://localhost:8080` in Chrome, Edge or Firefox. Saving back to disk (the File System Access API) needs `localhost` or `https://`, and only works in Chromium browsers.

Edit `index.html`, save and reload. That's the whole loop.

## Ground rules

notes stays small on purpose. These rules keep it that way:

1. **One file.** The app lives in `index.html`: markup, CSS and JavaScript inline. No bundler, no npm dependencies, no server.
2. **Pinned CDN libraries only.** External code loads from jsDelivr at an exact version (`monaco-editor@0.52.2`, not `@latest`). Only Monaco loads at startup; anything else loads when a preview first needs it.
3. **Load UMD libraries through Monaco's AMD loader** under a path alias, never with a plain `<script>` tag (it would register as an anonymous AMD module and never become a global). See `amd()`.
4. **No tracking.** No analytics, no third-party requests except the pinned libraries and the user-configurable PlantUML server.
5. **Wrap storage calls.** `localStorage` and IndexedDB can throw in private windows. Use the existing `load()` / `store()` / `IDB` helpers.
6. **Works on phones.** Check new UI at 390 px wide. Touch targets are 40–44 px under `pointer: coarse`, and inputs use 16 px text so iOS doesn't zoom.
7. **Use the design tokens.** Colors come from the `--wh-color-*` variables at the top of the `<style>` block. Brand red (`#FF014F`) is for focus, selection and the active indicator only, with dark text on red. Icons are Lucide paths in the inline sprite (`#i-*`).

[`CLAUDE.md`](CLAUDE.md) is the map of the code: tabs, languages, previews, commands and persistence.

## Adding things

**A command.** Add an entry to `COMMANDS` (`id`, `label`, `category`, `run`). Put it in `MENUS` if it belongs in a menu and in `KEYS` if it needs a shortcut. The palette picks it up automatically.

**A language.** Map the extension in `EXT_LANG` (or a file name in `NAME_LANG`). If Monaco has no grammar, add a Monarch tokenizer in `registerExtraLanguages()` and colors in `SYNTAX`. If the language requires tabs or spaces, add it to `LANG_INDENT`.

**A preview.** Teach `previewKindFor()` to recognize the file, add a label to `PREVIEW_LABEL` and a debounce to `PREVIEW_DELAY`, then return a document from `renderPreviewDoc()` with `previewShell()`. Previews run in a sandboxed iframe with no same-origin access, so they can't reach the app. If a preview can update in place, pass `patchable: true` so typing patches the open frame instead of reloading it.

## Before you open a pull request

Please check these by hand. There's no automated test suite yet (adding a Playwright smoke test would be a welcome PR):

- [ ] The app loads with no console errors in Chrome and Firefox.
- [ ] Dark and light themes both look right.
- [ ] The layout holds at 1440 px, 900 px (compact menu) and 390 px (phone drawer).
- [ ] Every preview you touched still renders, and typing doesn't make it flicker.
- [ ] New, Open, Save, Save As and Download still work, and reloading restores the session.
- [ ] Docs are updated if behavior changed (`README.md`, `CLAUDE.md`, `CHANGELOG.md`).

Keep pull requests focused: one fix or feature each. Explain *why* in the description and add a screenshot or GIF for anything visual. Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `perf:`, `refactor:`).

## Code style

Match what's around you: 2-space indentation, `const` by default, small named functions, and comments that explain *why* rather than *what*. The code avoids frameworks and classes except where state really needs them (`PreviewDoc`, `IDB`).

## Code of Conduct

By taking part you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

Contributions are released under the [MIT License](LICENSE), the same license as the project.
