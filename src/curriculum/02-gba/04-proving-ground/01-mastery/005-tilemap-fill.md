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
  - "There are two loops. The inner one has lost its index completely. It runs
    backwards over its entries and keeps only a countdown. The outer one still
    has its index, because the row address is calculated again from it on
    every pass."
  - "`lsl #5` is a row of 32 map entries, and the `lsl #1` after it converts
    entries to bytes. The `add r0, #6` is the offset of the last entry in a
    run. Use it to count how wide the run is."
  - "A `u16 *` map, two `s32` coordinates and a `u16` tile go in, and nothing
    comes out. The rectangle is four by four and the map is 32 entries wide,
    so an entry's index is `(y + row) * 32 + x + col`."
symbol: func_0840c6cc
---

# A rectangle of tiles

A GBA background map is a flat array of halfwords, one for each 8x8 tile, with
32 entries in each row. To stamp a shape into it, such as a door, a platform or
a piece of scenery, the code uses a nested loop over rows and columns. This is
the most common loop in a 2D game's code.

gcc 2.9 changes these loops a lot. Suppose the address moves by more than one
byte on each pass, and the index is used only for addressing. Then the compiler
deletes the index and steps the pointer instead. It also reverses the counter
that is left, so that it counts down toward zero. If the trip count is also a
constant, the compiler can calculate the address of the *last* element before
the loop starts. Then the whole loop runs **backwards** through memory:

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

That fills eight consecutive entries. `lsl r1, #6` multiplies a row index by
64, which is 32 entries of two bytes each. `add r1, #14` moves to the *eighth*
entry before any store happens. The body then stores and subtracts 2 on each
pass, so the writes happen in reverse order. The `mov r3, #7` sets up a
countdown of eight iterations. The loop ends with `bge`, and exits once the
counter drops below zero. The `cmp r3, #0` before that branch is not needed,
because `sub r3, #1` already set the flags. gcc 2.9 emits it every time anyway.

Now give the loop a reason to keep its index (here the body stores it), and a
bound the compiler cannot see. Then the structure stays close to the source:

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

Here the counter stays because the loop body stores it. The pointer moves
forward by the element stride. gcc also adds a test before the loop in case the
count is zero, because with a variable bound it cannot know whether the body
runs at all. So two loops over an array can compile to two structures that look
completely different.

Your target puts one loop inside the other. The inner run is the reversed kind,
and it moves down from its last entry. The outer loop keeps its index, because
the row address is calculated again from it on every pass. That is why the row
arithmetic is inside the loop body and has not been moved above it. The outer
trip count is a constant, so there is no guard before it. Find the inner run's
width from the offset it starts at. Then work out the row stride from the
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
