# Security Policy

## Supported versions

notes is a single page served from `main`. Only the latest version on [kmads.dev/notes](https://kmads.dev/notes) and the `main` branch get security fixes.

## Reporting a vulnerability

**Please don't open a public issue for security problems.**

Report them privately through GitHub's [private vulnerability reporting](https://github.com/kmadsdev/notes/security/advisories/new). Include:

- what the issue is and what an attacker could do with it,
- steps or a file that reproduces it,
- the browser and version you tested in.

You should get a first reply within a few days. Once a fix ships, we'll credit you in the advisory unless you'd rather stay anonymous.

## Security model

Useful context when you judge whether something is a vulnerability:

- **No backend.** notes has no server, accounts or database. Files are read and written in the browser.
- **Sandboxed previews.** Every preview (including HTML files and Markdown) renders in an iframe with `sandbox="allow-scripts allow-popups"` and **no** `allow-same-origin`, so preview content can't read the app, its storage or your file handles. Markdown output is also sanitized with DOMPurify.
- **Pinned dependencies.** Libraries load from jsDelivr at exact versions.
- **The one network call with your content** is the PlantUML preview, which sends the diagram source to the configured PlantUML server. Pointing that setting at a server you run keeps diagrams on your network.
- **Local storage.** Settings and the text of open tabs are kept in `localStorage` for session restore (you can turn that off), and file handles in IndexedDB. Anyone with access to your browser profile can read them.

Issues we're especially interested in: escaping the preview sandbox, script injection into the app itself (for example through file names or tab titles), and anything that writes to a file the user didn't choose.
