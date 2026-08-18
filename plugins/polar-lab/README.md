# Polar Lab

Four polar families — roses, spirals, epicycloids and hypocycloids — as generators you
call from a line, plus a panel that shapes one before you write it down.

## Generators

```
@polar("rose", 5, 4)              // one curve: family, k, size
@polar_stack("rose", 5, 3)        // three of them, nested and fading
@polar_grid(3, 5)                 // a 3x3 sampler of every family
```

`k` is the petal count for a rose, the turn count for a spiral and the cusp count for
the two cycloids. A rose with an even `k` draws `2k` petals, which is the curve being
honest rather than the plugin getting it wrong.

## The panel

Open the plugins sidebar with **⌘7**. Polar Lab puts a shaper at the top: pick a family,
drag `k`, `size` and `layers`, then press **insert**. The line it writes is the line
shown above the button, so nothing happens that you cannot read first.

Your last setting is kept between sessions and follows you to another machine.

## Keys and menus

| where | what |
| --- | --- |
| `Alt+P` | insert the shape in the panel |
| `Alt+Shift+P` | switch to the next family |
| right-click the editor | Insert polar curve |
| right-click the graph | Insert a polar sampler |
| status bar | the current family, click to insert |

## Writing one by hand

The library ships the same maths as plain functions, for when a generator is more than
you want:

```
fn rose_x(t, k, a)
fn rose_y(t, k, a)
fn spiral_x(t, a, b)
fn spiral_y(t, a, b)
fn epi_x(t, r, k)     fn epi_y(t, r, k)
fn hypo_x(t, r, k)    fn hypo_y(t, r, k)
```

```
use "polar-lab"
curve r (t in 0..6.2832) { (rose_x(t, 5, 4), rose_y(t, 5, 4)) }
```
