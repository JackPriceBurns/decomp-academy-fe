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
  - The two halves are separate guarded statements, placed in source order. The
    second `cmp` reads whatever the first half left in `r0`.
  - There are three `s32` arguments and an `s32` result. The arguments are the
    value, then the two bounds it is clamped between. The lower bound is
    applied first.
---

# Two clamps in a row, and you can read their order

To the compiler, a two-sided clamp is two separate guarded statements. They are
compiled one after the other, and the only thing they share is the register
that holds the value:

```asm
0        cmp       r0, #100
2        ble       6 ~>
4        mov       r0, #100
6      ~>cmp       r0, #0
8        bge       12 ~>
10       mov       r0, #0
12     ~>bx        lr
```

There are seven instructions, and the boundary between the two clamps is at
address 6. The `ble` at 2 skips the first clamp and lands exactly on the second
compare. So that label has two roles: it is the end of the first `if` and the
start of the next statement. When a `~>` target is itself a `cmp`, it is usually
the join between two consecutive statements, with no larger structure behind
it.

The second compare reads `r0`, and the first clamp may have just changed `r0`.
So the two halves have independent shapes, but their behaviour depends on each
other. Swapping them changes what the function computes when the bounds cross,
and it always changes the compiled code. Read them in listing order and write
them in that order.

Notice also that there is no branch *between* the halves. The first clamp falls
through into the second and does not jump around it. If there were an
unconditional `b` here, the source would have something else, such as an
`else` or a `return`.

Your target does the same two clamps in the same way. Find the boundary first.
Then read each half's compare and `mov` in the order they appear in the
listing.

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
