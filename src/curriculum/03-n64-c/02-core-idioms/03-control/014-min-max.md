---
id: 1ea6fbb2-b21c-423e-ba2f-60fbeceb894d
slug: control-min-max
title: Min and Max
difficulty: 3
concepts:
  - control-flow
  - compare
  - branches
symbol: func_803a9bec
hints:
  - "Same diamond as min — the difference is entirely inside the `slt`'s operand order. Read it literally, left to right."
  - "Ask which argument wins when the branch is taken vs not; that tells you whether the ternary keeps the larger or the smaller."
---

# The diamond grows a compare

`min` and `max` are ternaries — `(a < b) ? a : b` — so they compile to the
diamond you just learned, with one addition on top: the condition is an
ordered compare of two variables, which (as you saw with `sltu`) can't fuse
into a branch. So an `slt` feeds a `beqz`. Here's min:

```asm
 0:  slt  at, a0, a1     # a < b?
 4:  beqz at, 0x14       # no — b is the answer
 8:  or   v1, a1, zero   # (delay slot) v1 = b
 c:  b    0x14
10:  or   v1, a0, zero   # yes — v1 = a
14:  or   v0, v1, zero   # join
18:  jr   ra
1c:  nop
```

Every piece is familiar: compare into `at`, branch on the boolean (flipped),
both arms into `v1`, join into `v0`. The function keeps whichever argument
is *smaller* — `a` when `a < b` held, `b` otherwise. That's
`return (a < b) ? a : b;`, the canonical min.

Now the key detail: **max compiles to the *identical* skeleton.** Same
five-line diamond, same registers — the only line that changes is the
`slt`'s operand order, because `a > b` becomes "b < a" with swapped
operands, exactly as in the `slt` lesson. One pair of operands transposed is
the entire difference between "keep the smaller" and "keep the larger".

So a min/max diamond gets decoded in two reads:

1. **The `slt`, literally.** `slt at, x, y` asks `x < y` — in operand
   order, no exceptions.
2. **The slots.** Which argument rides out when the compare *holds* (the
   `b`-arm), and which when it fails (the branch-arm)?

The target is one of the two. Read carefully — a transposed guess compiles
perfectly and matches the other function.

## Your task

Write `func_803a9bec` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_803a9bec(s32 a, s32 b) {
    return (a > b) ? a : b;
}
```
