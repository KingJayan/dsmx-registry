# Author Card

Puts your name on a graph, so an exported PNG says who made it.

## Setting it up

Open the plugins sidebar with **⌘7** and type your handle once. It goes into the macOS
keychain under this plugin's own name — not into a settings file, and not anywhere a
share link can carry it. No other plugin can read it, and this one cannot read the
app's API keys.

## Signing a file

Press **sign this file**, `Alt+A`, or right-click the editor. It writes one line:

```
text author_card = "your name" at (-9, -9) as { color grey fontSize 14 }
```

That is ordinary DSL. Move it, restyle it or delete it like anything else you wrote.

## Options

| option | what it does |
| --- | --- |
| placement | corner, title across the top, or footer along the bottom |
| colour | the label colour |
| add the date | stamps today's date beside your handle |

The three are remembered and follow you to another machine. The handle does not — a
secret stays on the machine it was typed on.

## Forgetting it

**forget my handle** takes it back out of the keychain.
