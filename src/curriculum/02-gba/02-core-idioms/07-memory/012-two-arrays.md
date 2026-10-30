---
id: 84a39554-1b7a-4f0f-ab00-a8540f142e68
slug: gba-memory-two-arrays
title: Reading From Two Arrays
difficulty: 3
concepts:
  - pointers
  - arrays
  - register-allocation
symbol: func_08226568
hints:
  - One `lsl` and two `add`s means one index shared between two bases. The
    scaled index is built once and kept.
  - It takes two `s32 *` arguments and an `s32` index, and returns an `s32`.
    `mul` has only two operands, so its operand order does not tell you the
    order in the C.
---

# One index, two bases

When two arrays are read at the same position, the index is scaled once and
then added to each base in turn. There is no reason to do the shift twice, and
gcc does not.

The scaled index must stay live across both adds, so gcc uses the
three-operand form of `add`. The two-operand `add rD, rS` writes over one of
its sources, so it would overwrite the index:

```asm
0        lsl       r3, #2
2        add       r0, r3, r0
4        add       r1, r3, r1
6        ldr       r0, [r0, #0]
8        ldr       r1, [r1, #0]
10       add       r0, r1
12       add       r3, r2
14       ldr       r1, [r3, #0]
16       add       r0, r1
18       bx        lr
```

This example reads three arrays with one index. `lsl r3, #2` scales the index.
Then `add r0, r3, r0` and `add r1, r3, r1` form two addresses without changing
`r3`. Both write into base registers whose original values are no longer
needed.

The last add is different. `add r3, r2` is the two-operand form, and it
destroys the scaled index, because nothing needs it after that. This choice
tells you something. A three-operand `add` says the source is still needed
later. The two-operand form says this was its last use. When you want to count
the array accesses in a listing, counting the adds onto a preserved index
register is more reliable than counting loads.

Your target scales its index once and then uses it twice.

## Your task

Write `func_08226568` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08226568(s32 *a, s32 *b, s32 i) {
    return a[i] * b[i];
}
```
