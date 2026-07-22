---
id: d956d5ae-0785-576d-87a3-649137d6cecd
slug: advanced-enum-jumptable
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

This lesson stacks two things you have already met. An `enum` is int-sized and
adds nothing of its own to the generated code, from lesson 5, and a dense
`switch` dispatches through a jump table, from lesson 1. Combine them into a
`switch` over an enum-typed argument with consecutive values and the two never
interfere. The enum is only renaming integers, so the dispatch matches what a
switch on a plain `int` would emit.

Take `paint(Brush b)`, which switches over an eight-value `Brush` enum
(`BRUSH_PEN`, `BRUSH_FILL`, and so on) and returns a pixel cost per tool.

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

That `cmplwi`/`lwzx`/`mtctr`/`bctr` shape is the lesson 1 `dispatch`, down to
the byte. What changed is the argument's type, and the enum type stays in the
source and never reaches the object file. Your C labels the cases with enum
names while the assembly works with their ordinals 0 through 7, and the
`li r3, N` in each arm is the value that case returns.

## Your task

Write `cost_of(Tile t)` to reproduce the assembly above. The `Tile` enum is
provided in context. Eight dense enum values land in table form — read the
`li r3, N` in each arm to recover what each tile costs.

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
