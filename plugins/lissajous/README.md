# Lissajous

A Lissajous figure is what you get when one sine drives x and another drives y. The
ratio of the two frequencies decides the shape, and the phase decides how open it is.

## Use

```
@lissajous(3, 2, 1.5708)
@lissajous_grid(4)
```

`@lissajous(a, b, delta)` draws one figure at the origin. `@lissajous_grid(n)` draws
the whole table, every x frequency from 1 to n against every y frequency, laid out in
a square.

Both put a call on a line of its own, and both become ordinary `curve` statements.

## Functions

The plugin also adds `liss_x(t, a, d)` and `liss_y(t, b)`, for writing a figure by hand:

```
curve mine (t in 0..6.28) { (liss_x(t, 5, 1.5708), liss_y(t, 4)) }
```
