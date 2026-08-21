# dsmx registry

plugin marketplace for [desmos-ide](https://github.com/KingJayan/desmos-ide).

[marketplace page](https://desmos-ide.vercel.app/marketplace) renders all plugins here.

## Plugins

plugins/[id].

| file | what it is |
| --- | --- |
| `plugin.json` | the manifest. required |
| `main.js` | sandboxed javascript: generators, commands, panels |
| `lib.dsmx` | DSL folded into every compile, like a library |
| `README.md` | what extension pages show |

Plugins are client-side, so shared links depend on the used plugins.

## plugin.json

```json
{
  "id": "polar-lab",
  "name": "Polar Lab",
  "version": "1.0.0",
  "description": "One sentence about what it does.",
  "author": "your name",
  "license": "Apache-2.0",
  "homepage": "https://example.dev",
  "keywords": ["generator"],
  "main": "main.js",
  "lib": "lib.dsmx",
  "icon": "icon.svg"
}
```

`id` is lowercase letters, digits and hyphens, and **must match the folder name**. `version` is
semver. `homepage` must be https.

`icon` is either one or two characters (`"✦"`) or a `.png`, `.svg` or `.webp` in the folder. Images are capped at 256 KB and shown at 18px in the list.

## Themes

in manifest.json:

```json
"theme": {
  "dark": true,
  "editor": { "editor.background": "#0d1117" },
  "tokens": { "keyword": "#7aa2f7", "number": "#f7c67a" }
}
```

Appears in settings under the editor theme (grouped as *from plugins*). [midnight-grid](plugins/midnight-grid) has the full token set.

## main.js

Only gets `dsmx`. No `fetch`, `localStorage`, `window`, or dom.

Always reference [api.d.ts](api.ds.ts) in your file for completion.
```js
/// <reference path="../../api.d.ts" />
```

### Macros

The user writing `@name(1, "two")` on a newline returns DSL text

```js
dsmx.macro('stars', (count, radius) => {
  const lines = [];
  for (let i = 0; i < count; i++) lines.push(`point s_${i} (${i}, ${radius})`);
  return lines.join('\n');
});
```

args are ONLY nums and quoted strings. A generator has **1.5s** until skipped.
Throwing is fine, and the message will show as a problem on the line

### Commands

```js
dsmx.commands.registerCommand('insert', 'polar lab: insert', () => ({ insert: '@polar("rose", 5)\n' }));
```

Return `{ insert }`, `{ replace }`, `{ status }` or nothing. Can be async, gets **3s** until skipped.

### Panels

```js
dsmx.window.registerView({
  id: 'shaper',
  title: 'polar lab',
  widgets: [
    { kind: 'slider', id: 'k', label: 'k', value: 5, min: 2, max: 24 },
    { kind: 'button', id: 'go', label: 'insert', primary: true },
  ],
}, (widget, value) => {
  if (widget === 'go') dsmx.editor.insert('@polar("rose", 5)\n');
});
```

widgets: `label` `button` `input` `slider` `checkbox` `select` `rows` `separator`.
`updateView(id, widgets)` swaps them to show a new state.

### Keys, menus

```js
dsmx.keybindings.register('Alt+P', 'insert');
dsmx.menus.register('editor', 'insert', 'Insert polar curve');
```

A plugin key **must use Alt**. Menu areas are `editor`,
`graph`, `expressions` and `plugins`; `editor` joins Monaco.

Plugin loading order matters during conflicts (dibs).

### State

`globalState` is per plugin.
`workspaceState` follows the open folder.
A read is immediate; a write returns a promise.

```js
let k = dsmx.globalState.get('k', 5);
await dsmx.globalState.update('k', 8);
```

`secrets` is the macOS keychain, under your plugin's name. No other plugin can read
it, and you cannot reach the app's own API keys. Use it for something personal, NOT for
settings.

`storageUri` and `globalStorageUri` are folders you may write files into.

### App

`dsmx.app.run(command)` runs one of the app's own commands, and only these:

`format` `compile` `save` `export.png` `export.svg` `export.link` `view.dsl`
`view.enhanced` `panel.optimizer` `panel.problems`

`dsmx.editor` reads and writes to open file: `getText` `getSelection` `insert`
`replace` `setText`.

`dsmx.window.showInformationMessage` (as well as warning and error) raise a toast.
`setStatusMessage` writes one line in the status bar, written over per compile.

## lib.dsmx

`fn` and `alias` declarations only (no graph writes).
Libraries that don't compile are silently dropped.
User declared names aren't accessible.

## Submitting

1. Fork this repo.
2. Add `plugins/<your-id>/`.
3. Add the entry to `index.json`, at the end of the list.
4. Run `node check.mjs`. It must print `ok`.
5. Open a pull request and assign @KingJayan.
