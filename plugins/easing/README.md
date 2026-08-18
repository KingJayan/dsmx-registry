# Easing

Every easing curve you would reach for, as plain DSL functions. No code runs — this is
a library file the compiler folds into yours.

## Using it

```
use "easing"

t = time(0, 3, loop)
u = t / 3

point ball (mix(-6, 6, ease_in_out_cubic(u)), 0) as { color blue pointSize 14 }
curve shape (x in 0..1) { (x, ease_out_bounce(x)) }
```

Every curve takes `u` from 0 to 1 and gives back 0 to 1. `in` starts slow, `out` ends
slow, `in_out` does both.

## The set

| family | what it looks like |
| --- | --- |
| `quad` `cubic` `quart` | gentle, then stronger, then stronger still |
| `sine` | the softest of them |
| `expo` | almost nothing, then all at once |
| `circ` | a quarter circle |
| `back` | overshoots the end and settles back |
| `elastic` | rings down to rest |
| `bounce` | lands, lifts, lands again |

Each comes as `ease_in_*`, `ease_out_*` and `ease_in_out_*`, except `bounce` and
`elastic`, which have `in` and `out` only.

`mix(a, b, u)` puts an eased 0-to-1 between two values, so you rarely write the
arithmetic yourself.

## Seeing them

```
use "easing"
curve a (x in 0..1) { (x, ease_out_bounce(x)) }   as { color red }
curve b (x in 0..1) { (x, ease_in_out_expo(x)) }  as { color blue }
curve c (x in 0..1) { (x, ease_out_elastic(x)) }  as { color green }
```
