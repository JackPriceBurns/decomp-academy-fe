---
id: 044ed5e2-638f-4f33-bc40-74d2a72f3e8c
slug: gba-control-clamp-range
title: Both Ends
difficulty: 3
concepts:
  - branches
  - control-flow
  - comparisons
symbol: func_0814b834
hints:
  - The two halves are independent guarded statements laid down in source order.
    The second `cmp` reads whatever the first half left in `r0`.
  - Three `s32` arguments and an `s32` result — the value, then the two bounds
    it is squeezed between. The lower bound is applied first.
---

# Two clamps in a row, and the order is readable

A two-sided clamp is not a single construct to the compiler. It is two guarded
statements, compiled one after the other, sharing nothing but the register the
value lives in:

```asm
0        cmp       r0, #100
2        ble       6 ~>
4        mov       r0, #100
6      ~>cmp       r0, #0
8        bge       12 ~>
10       mov       r0, #0
12     ~>bx        lr
```

Seven instructions, and the seam is at address 6. The `ble` at 2 skips the first
clamp and lands exactly on the second compare, so that label is doing double
duty: it is the end of the first `if` and the start of the next statement. When
you see a `~>` target that is itself a `cmp`, you are usually looking at the
join between two consecutive statements rather than anything structural.

The second compare reads `r0`, and `r0` may have just been rewritten by the
first clamp. The two halves are therefore not independent in behaviour even
though they are independent in shape — swapping them changes what the function
computes when the bounds cross, and changes the object either way. Read them in
listing order and write them in that order.

Notice too that there is no branch *between* the halves. The first clamp does
not jump around the second; it falls into it. A construct that produced an
unconditional `b` here would be something else — an `else`, or a `return`.

Your target does the same two clamps in the same style. Find the seam first,
then read each half's compare and `mov` in the order the listing lays them down.

## Your task

Write `func_0814b834` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0814b834(s32 x, s32 lo, s32 hi) {
    if (x < lo) x = lo;
    if (x > hi) x = hi;
    return x;
}
```
