# dsmx registry

The plugin marketplace for [desmos-ide](https://github.com/KingJayan/desmos-ide).

`index.json` is the whole marketplace. The app reads it to fill the plugin sidebar, and
the docs site reads it to build the marketplace page. Each entry names a folder under
`plugins/`, and that folder holds what actually installs.

## What a plugin is

A plugin is a manifest and up to three parts, all of them optional:

| file | what it does |
| --- | --- |
| `plugin.json` | the manifest. Required |
| `lib.dsmx` | DSL the app folds into every compile, so its `fn` declarations are callable anywhere |
| `main.js` | javascript that adds generators and commands. It runs in a worker with no network and no DOM |
| `README.md` | what the extension page shows |

Plugins are client-side only. A share link carries the file, not the plugin, so
anything you send someone must compile without it.

## The manifest

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

`id` must be lowercase letters, digits and hyphens, and must match the folder name.
`version` must be semver.

## Writing main.js

The file is handed one global, `dsmx`. There is nothing else: no `fetch`, no
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

A macro is called when the user writes `@stars(120, 6)` on a line of its own. Arguments
are numbers and quoted strings. Whatever the macro returns is compiled in place of that
line, so an error in the generated DSL is reported against the line the user wrote.

A command returns `{ insert }`, `{ replace }` or `{ status }`, or nothing.

Macros run on every keystroke that touches one. A macro that takes longer than a second
and a half is stopped, and its plugin is reloaded.

## Writing lib.dsmx

Only `fn` and `alias` declarations. Anything that would draw is ignored, because a
plugin must not put expressions on a graph the user did not ask for. If the library
does not compile on its own, the whole of it is dropped rather than reporting an error
against the user's file.

## Submitting

1. Fork this repo.
2. Add `plugins/<your-id>/`.
3. Add the entry to `index.json`, keeping the list in the order plugins were added.
4. Open a pull request.

Every plugin here is reviewed by hand before it merges. `main.js` is read line by line,
so keep it short and keep it clear.
