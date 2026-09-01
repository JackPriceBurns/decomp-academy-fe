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
  - Two `s32 *` and an `s32` index in, an `s32` out. `mul` is two-operand, so
    the operand order in it is not evidence of the order in the C.
---

# One index, two bases

When two arrays are read at the same position, the index is scaled once and
then added to each base in turn. There is no reason to do the shift twice, and
gcc does not.

Keeping the scaled index alive across both adds is what forces the
three-operand form of `add`. The destructive `add rD, rS` would overwrite it:

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

Three arrays, one index. `lsl r3, #2` scales it, then `add r0, r3, r0` and
`add r1, r3, r1` form two addresses without disturbing `r3`, both writing into
the base registers whose original values are finished with.

The last one is different: `add r3, r2` is the two-operand form, destroying the
scaled index, because by then nothing else needs it. That choice is readable
information. A three-operand `add` says the source is still wanted later; the
two-operand form says this was its last use. When you are trying to work out
how many array accesses a listing contains, counting adds onto a preserved
index register is more reliable than counting loads.

Your target scales its index once and then spends it twice.

## Your task

Write `func_08226568` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08226568(s32 *a, s32 *b, s32 i) {
    return a[i] * b[i];
}
```
