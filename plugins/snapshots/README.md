# Snapshots

Keep a copy of the file before you change something you might regret, and go back to it
in one click. Snapshots belong to the folder the file sits in, so every `.dsmx` beside
it sees the same list.

## Taking one

Open the plugins sidebar with **⌘7**, type a name and press **take a snapshot** — or
press `Alt+S` and let it name itself. The panel lists what you have, newest first, with
the time and the line count.

## Going back

Click a row to load it into the editor. Whatever was in the editor is kept first, under
*before restore*, so a restore is never the thing that loses your work. `Alt+Shift+S`
goes straight back to the newest one.

## Keys and menus

| where | what |
| --- | --- |
| `Alt+S` | take a snapshot |
| `Alt+Shift+S` | back to the newest one |
| right-click the editor | both of the above |

## What it keeps, and where

The last 12 snapshots per folder, as text, in the plugin's own store. Nothing leaves
your machine, and a share link never carries them. Run **snapshots: where they are
kept** from the palette to see the folder.

A file with no folder yet — a buffer you have not saved — has nowhere to keep a list.
Save it first.
