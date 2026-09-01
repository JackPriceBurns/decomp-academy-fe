---
id: 86adfb1f-d1cb-48ef-b7ee-e0517a98dac6
slug: gba-mastery-tilemap-fill
title: Filling a Tilemap Rectangle
difficulty: 4
concepts:
  - loops
  - pointers
  - strength-reduction
hints:
  - Two loops. The inner one has lost its index entirely and runs backwards
    over its entries, keeping only a countdown; the outer one still has its
    index because the row address is rebuilt from it every pass.
  - "`lsl #5` is a row of 32 map entries and the `lsl #1` after it turns entries
    into bytes. The `add r0, #6` is the offset of the last entry in a run - use
    it to count how wide the run is."
  - "A `u16 *` map, two `s32` coordinates and a `u16` tile going in, nothing
    coming out. The rectangle is four by four and the map is 32 entries wide,
    so an entry's index is `(y + row) * 32 + x + col`."
symbol: func_0840c6cc
---

# A rectangle of tiles

A GBA background map is a flat array of halfwords, one per 8x8 tile, laid out 32
entries to a row. Stamping a shape into it - a door, a platform, a chunk of
scenery - is a nested loop over rows and columns, and it is the single most
common loop in a 2D game's code.

gcc 2.9 rewrites those loops hard. When the address moves by more than one byte
a pass and the index is used for nothing except addressing, it deletes the
index and walks the pointer instead, then flips the counter left behind to run
down toward zero. When the trip count is a constant on top of that, it can work
out the address of the *last* element up front, and the whole traversal runs
**backwards** over memory:

```asm
0        lsl       r2, #16
2        lsr       r2, #16
4        mov       r3, #7
6        lsl       r1, #6
8        add       r1, r0
10       add       r1, #14
12     ~>strh      r2, [r1, #0]
14       sub       r1, #2
16       sub       r3, #1
18       cmp       r3, #0
20       bge       12 ~>
22       bx        lr
```

That fills eight consecutive entries. `lsl r1, #6` is a row index times 64 - 32
entries of two bytes each - and `add r1, #14` moves to the *eighth* entry
before a single store happens. The body then stores and subtracts 2 each pass,
so the writes land in reverse order. The `mov r3, #7` seeds a countdown of
eight iterations and the loop closes on `bge`, falling out once the counter
drops below zero. The `cmp r3, #0` in front of that branch is dead weight -
`sub r3, #1` set the flags already - and gcc 2.9 emits it every time.

Give the loop a reason to keep its index - here the body stores it - and a
bound the compiler cannot see, and the skeleton stays close to the source:

```asm
0        mov       r2, #0
2        cmp       r2, r1
4        bge       16 ~>
6      ~>strb      r2, [r0, #0]
8        add       r0, #3
10       add       r2, #1
12       cmp       r2, r1
14       blt       6 ~>
16     ~>bx        lr
```

Here the counter survives because the loop body stores it, the pointer walks
forward by the element stride, and gcc adds a test before the loop in case the
count is zero, because with a variable bound it cannot know the body runs at
all. Two loops over an array, two skeletons with nothing in common.

Your target nests one inside the other. The inner run is the reversed kind,
walking down from its last entry; the outer keeps its index, because the row
address is rebuilt from it every pass - which is why you find the row
arithmetic inside the loop body rather than hoisted above it. The outer trip
count is a constant, so it gets no guard in front of it. Find the inner run's
width from the offset it starts at, then work out the row stride from the
shifts.

## Your task

Write `func_0840c6cc` to reproduce the target assembly.

<!-- solution -->
```c
void func_0840c6cc(u16 *map, s32 x, s32 y, u16 tile)
{
    s32 row;
    s32 col;

    for (row = 0; row < 4; row++) {
        for (col = 0; col < 4; col++) {
            map[(y + row) * 32 + x + col] = tile;
        }
    }
}
```
