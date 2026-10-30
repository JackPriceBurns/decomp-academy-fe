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
  - "Same diamond as min. The only difference is the `slt`'s operand order. Read it literally, left to right."
  - "Ask which argument wins when the branch is taken vs not; that tells you whether the ternary keeps the larger or the smaller."
---

# The diamond gets a compare

`min` and `max` are ternaries, `(a < b) ? a : b`, so they compile to the
diamond you just learned, with one addition at the top. The condition is an
ordered compare of two variables, and (as you saw with `sltu`) that can't be
built into a branch. So an `slt` feeds a `beqz`. Here is min:

```asm
 0:  slt  at, a0, a1     # a < b?
 4:  beqz at, 0x14       # no: b is the answer
 8:  or   v1, a1, zero   # (delay slot) v1 = b
 c:  b    0x14
10:  or   v1, a0, zero   # yes: v1 = a
14:  or   v0, v1, zero   # join
18:  jr   ra
1c:  nop
```

Every piece is familiar: compare into `at`, branch on the boolean (flipped),
both arms into `v1`, join into `v0`. The function keeps whichever argument is
*smaller*: `a` when `a < b` held, and `b` otherwise. That is
`return (a < b) ? a : b;`, the standard min.

Now the important detail: **max compiles to the *identical* structure.** It
has the same five-line diamond and the same registers. The only line that
changes is the `slt`'s operand order, because `a > b` becomes "b < a" with
swapped operands, exactly as in the `slt` lesson. Swapping one pair of
operands is the whole difference between "keep the smaller" and "keep the
larger".

So you decode a min/max diamond in two reads:

1. **The `slt`, literally.** `slt at, x, y` asks `x < y`, in operand order,
   with no exceptions.
2. **The slots.** Which argument is returned when the compare *holds* (the
   `b`-arm), and which when it fails (the branch-arm)?

The target is one of the two. Read carefully. A swapped guess compiles without
errors and matches the other function.

## Your task

Write `func_803a9bec` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_803a9bec(s32 a, s32 b) {
    return (a > b) ? a : b;
}
```
