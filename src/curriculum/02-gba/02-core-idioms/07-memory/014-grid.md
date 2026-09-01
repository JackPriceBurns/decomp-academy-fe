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
  - The `add` that folds in the second index splits the listing in two. Work
    out what multiple of the row index the register holds when you reach it.
  - A `u8 *` and two `s32` indices in, a `u32` out. There is no shift after
    the column is added, so the entire ladder in front of it is the row width.
---

# A row is a multiply

A two-dimensional array flattened into one allocation is indexed as
`row * width + col`, and the compiler has to build that expression before it
can touch memory. The row index gets multiplied by the width, the column is
added, and then the whole thing is scaled by the element size — two separate
multiplications, in that order, with an `add` between them.

When the width is not a power of two the first multiplication is the
strength-reduced ladder from the arithmetic chapter. Here is a grid of 32-bit
elements, six per row:

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

Follow the multiple in `r3`. After line 0 it holds two rows; after line 2,
three; after line 4, six. That is the width, built as 3 × 2 because gcc reaches
odd factors with one shift and one add. Line 6 adds the column, so from there
`r3` is an element count. Line 8 multiplies by four to turn elements into
bytes, line 10 adds the base, and the load finishes the job.

The `add` of the second index is the boundary between the two scalings, and
finding it is how you read a grid access. Everything in front of it is the row
width; the single shift behind it is the element size. Put the boundary in the
wrong place and the width you recover is off by exactly a factor of the element
size.

There is one case where the split is invisible. If the elements are single
bytes there is no shift behind the `add` at all, and the whole ladder belongs
to the width — including the trailing shift you might have been ready to read
as an element scale.

Your target has nothing between the column and the base.

## Your task

Write `func_0822f450` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_0822f450(u8 *g, s32 row, s32 col) {
    return g[row * 20 + col];
}
```
