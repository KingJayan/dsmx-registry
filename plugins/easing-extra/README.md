# Easing Extra

The DSL ships one `ease`. This adds the rest of the family, so an animation can start
sharp and finish soft, overshoot and settle, or ring down to rest.

Every function takes `u` from 0 to 1 and gives back 0 to 1.

## Functions

- `ease_in_quad`, `ease_out_quad`, `ease_in_out_quad`
- `ease_in_cubic`, `ease_out_cubic`, `ease_in_out_cubic`
- `ease_in_back`, `ease_out_back` — overshoot the end, then come back to it
- `ease_out_elastic` — ring down to rest

## Use

```
time T = 0..1 period 2000 loop

point p (ease_out_back(T) * 6, 0)
```

This plugin is DSL only. It runs no code of its own: the functions are inlined by the
compiler the same way your own `fn` declarations are.
