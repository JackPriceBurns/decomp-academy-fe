---
id: advanced-enum-jumptable
title: "Chain: An Enum Switched Through the Table"
difficulty: 3
concepts:
  - enum
  - switch
  - jump-table
  - chaining
symbol: cost_of
hints:
  - The enum arrives as a plain 4-byte int in r3, so the dispatch is identical to
    a switch on an `int` — eight dense values cross the table threshold.
  - Look for `cmplwi r3, 7` then `lwzx`/`mtctr`/`bctr`; each case is a tiny
    `li r3, N` whose value you read straight out of the asm.
---

# Two idioms, zero new instructions

You've now seen both halves of this in isolation: an **enum** is int-sized and
contributes no codegen (lesson 5), and a **dense switch** dispatches through a
jump table (lesson 1). Put them together — a `switch` over an *enum-typed*
argument with enough consecutive values — and neither idiom interferes with the
other. The enum is purely a naming layer; the dispatch is exactly what a switch
on a bare `int` would produce.

Consider `paint(Brush b)`, switching over an eight-value `Brush` enum
(`BRUSH_PEN`, `BRUSH_FILL`, …) to return a pixel-cost per tool:

```asm
cmplwi r3, 7        # b arrives as a 4-byte int; bounds-check 0..7
bgt-   .default
lis    r4, table@ha
slwi   r0, r3, 2    # b * 4 -> table index
addi   r3, r4, table@lo
lwzx   r0, r3, r0
mtctr  r0
bctr                # jump straight to the case for this brush
.case0: li r3, 10  blr   # each arm is one li/blr...
.case1: li r3, 25  blr   # ...the enum names left no trace
```

The `cmplwi`/`lwzx`/`mtctr`/`bctr` shape is byte-identical to lesson 1's
`dispatch` — the only difference is that the argument's *type* is an enum, which
the object file never sees. The case labels in your C are enum names; the asm
only knows their ordinals 0..7, and each arm's `li r3, N` tells you what that
case returns.

## Your task

Write `cost_of(Tile t)` to reproduce the assembly above. The `Tile` enum is
provided in context. Eight dense enum values land in table form — read the
`li r3, N` in each arm to recover what each tile costs.

<!-- starter -->
```c
int cost_of(Tile t) {
    return 0;
}
```

<!-- solution -->
```c
int cost_of(Tile t) {
    switch (t) {
        case TILE_VOID:  return 0;
        case TILE_FLOOR: return 1;
        case TILE_WALL:  return 99;
        case TILE_WATER: return 4;
        case TILE_LAVA:  return 50;
        case TILE_ICE:   return 2;
        case TILE_DOOR:  return 3;
        case TILE_KEY:   return 0;
        default:         return -1;
    }
}
```

<!-- context -->
```c
typedef enum {
    TILE_VOID, TILE_FLOOR, TILE_WALL, TILE_WATER,
    TILE_LAVA, TILE_ICE, TILE_DOOR, TILE_KEY
} Tile;
```
