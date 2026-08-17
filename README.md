# dsmx registry

plugin marketplace for [desmos-ide](https://github.com/KingJayan/desmos-ide).


## Plugins

A plugin contains three, optional parts:

| file | purpose |
| --- | --- |
| `plugin.json` | the manifest; Required |
| `lib.dsmx` | `.dsmx` baked into compilation, like a library class file |
| `main.js` | js for generators and commands (runs in a sandbox) |
| `README.md` | what the extension page shows |

Plugins are client-side only. A share link contains the file, so plugins that compile dsmx work sort of like python libraries

## plugin.json

```json
{
  "id": "starfield",
  "name": "Starfield",
  "version": "1.0.0",
  "description": "One sentence about what it draws.",
  "author": "your name",
  "license": "Apache-2.0",
  "keywords": ["generator"],
  "main": "main.js",
  "lib": "lib.dsmx",
  "icon": "✦"
}
```

`id` must be lowercase letters, digits and hyphens, and **must match the folder name**.
`version` must use SemVer.

## main.js

The file gets `dsmx` as its sole global. There is nothing else: no `fetch`, no
`localStorage`, no `window`, no way to reach the file the user has open.

```js
dsmx.macro('stars', (count, radius) => {
  // returns DSL text. one statement per line
  return `point p (0, 0)`;
});

dsmx.command('insert', 'starfield: insert 120 stars', () => ({
  insert: '@stars(120, 6)\n',
}));
```
In this case, the starfield macro is called when user writes `@stars(120,6)` on its own line.
Arguments can be numbers and quoted strings. macro timeout is a 90 seconds.

A command returns `{ insert }`, `{ replace }`, `{ status }`, or nothing.

## lib.dsmx

Only `fn` and `alias` declarations. If a library has an error, it does not get loaded.

## Submitting

1. Fork this repo.
2. Add `plugins/<your-id>/`.
3. Add the entry to `index.json`, keeping the list in the order plugins were added.
4. Open a pull request and assign @KingJayan
