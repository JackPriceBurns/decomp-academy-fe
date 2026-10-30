---
id: f7e48a32-90f1-49cf-9031-8dbec55a094e
slug: gba-arithmetic-four-operands
title: Running Out of Registers
difficulty: 4
concepts:
  - registers
  - expressions
  - multiply
symbol: func_08081408
hints:
  - Nothing is saved to memory here. Every value stays in the register it
    arrived in until an instruction uses it. Work out which argument is used
    last, and you have the reason for the final `mov`.
  - The function takes four `s32` parameters and returns an `s32`. The last two
    are added together, that sum is multiplied by the second, and the first is
    added at the end.
---

# Working with only four registers

A leaf function receives its arguments in `r0` to `r3`, and it can use `r0` to
`r7`. But `r4` to `r7` must be saved before the function can use them, and gcc
works hard to avoid that cost. So a wide expression becomes a puzzle: gcc has to
use the values in an order that keeps everything within those four registers.

Here is `z * (w - x) + y`, which uses the arguments in an order that needs no
copies:

```asm
0        sub       r0, r1
2        mul       r0, r3
4        add       r0, r2
6        bx        lr
```

That is three instructions for four arguments, with no copies. The first thing
the source does is use `w`, which frees `r0` straight away. From then on, `r0`
holds the running total, and every other value is read exactly once, from the
register it arrived in.

Now here is `(x - w) * (z - y)`, where both operands of the multiply are
computed:

```asm
0        sub       r1, r0
2        sub       r3, r2
4        mov       r0, r1
6        mul       r0, r3
8        bx        lr
```

Both differences are built in place. `r1` and `r3` are not needed afterwards
(they are dead), so they are safe destinations. Then one copy is needed,
because `mul` writes only to the register that holds its left operand, and the
answer has to end up in `r0`.

Both listings follow one rule: **a two-operand instruction writes to the
register holding its left operand**. So the running total stays in whichever
register that operand was in. In the first listing, the source uses `w` before
anything else. The difference goes into `r0`, and every later step keeps the
total there. In the second listing, the first difference goes into `r1`, but
the product has to end up in `r0`. So the total is copied across before the
multiply can run.

A `mov r0, rN` as the last instruction is the same copy with nothing after it.
The total never reached `r0` by itself, so the last instruction puts it where
the ABI expects it.

Everything in this chapter has stayed inside `r0` to `r3`. If a leaf function
needs more than four registers can hold, the listing gets a `push` at the top
and a matching `pop` at the bottom, so it can use more registers. You will
study that pattern in the ABI chapter. When there is no `push`, that also tells
you something: no more than four values were ever live at the same time.

Your target ends with one of those late moves. Find the value that is used
last, and the final two instructions will make sense.

## Your task

Write `func_08081408` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08081408(s32 a, s32 b, s32 c, s32 d) {
    return (c + d) * b + a;
}
```
