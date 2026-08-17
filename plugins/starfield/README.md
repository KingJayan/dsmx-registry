# Starfield

Puts points in a sunflower spiral. Each point sits one golden angle around from the
last one, so the field stays even and never shows spokes, however many you ask for.

## Use

```
@stars(120, 6)
@stars(40, 3, "blue")
```

- `count` — how many points. 400 at most.
- `radius` — how far the field goes out. 5 if you leave it out.
- `color` — any Desmos colour name. Yellow if you leave it out.

The call must sit on a line of its own. It becomes one `point` statement per star, so
everything after it is ordinary DSL you can read and edit.

## Commands

`starfield: insert 120 stars` puts a call at the cursor.
