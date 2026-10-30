---
id: fceb5d0f-1056-42c1-9523-3d86390a55c5
slug: gba-memory-grid
title: A Two-Dimensional Index
difficulty: 4
concepts:
  - pointers
  - arrays
  - strength-reduction
symbol: func_0822f450
hints:
  - The `add` of the second index splits the listing in two. Work out what
    multiple of the row index the register holds at that point.
  - It takes a `u8 *` and two `s32` indices, and returns a `u32`. There is no
    shift after the column is added, so the whole ladder before it is the row
    width.
---

# A row is a multiply

A two-dimensional array stored in one flat block of memory is indexed as
`row * width + col`. The compiler has to build that expression before it can
access memory. The row index is multiplied by the width, the column is added,
and then the result is scaled by the element size. That makes two separate
multiplications, in that order, with an `add` between them.

When the width is not a power of two, the first multiplication is the
strength-reduced ladder from the arithmetic chapter. Here is a grid of 32-bit
elements, with six elements per row:

```asm
0        lsl       r3, r1, #1
2        add       r3, r1
4        lsl       r3, #1
6        add       r3, r2
8        lsl       r3, #2
10       add       r3, r0
12       ldr       r0, [r3, #0]
14       bx        lr
```

Follow the multiple in `r3`. After line 0 it holds two rows. After line 2 it
holds three, and after line 4 it holds six. That is the width, built as 3 × 2,
because gcc makes odd factors with one shift and one add. Line 6 adds the
column, so from that point `r3` is an element count. Line 8 multiplies by four
to turn elements into bytes, line 10 adds the base, and the load reads the
element.

The `add` of the second index is the boundary between the two scalings. To read
a grid access, find that boundary. Everything before it is the row width. The
single shift after it is the element size. If you put the boundary in the wrong
place, the width you get is wrong by exactly a factor of the element size.

In one case you cannot see the split. If the elements are single bytes, there
is no shift after the `add` at all, and the whole ladder belongs to the width.
That includes the final shift, which you might otherwise read as an element
scale.

Your target has nothing between the column and the base.

## Your task

Write `func_0822f450` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_0822f450(u8 *g, s32 row, s32 col) {
    return g[row * 20 + col];
}
```
