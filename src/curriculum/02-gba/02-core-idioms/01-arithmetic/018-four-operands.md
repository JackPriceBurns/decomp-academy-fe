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
  - Nothing is saved to memory here - every value stays in the register it
    arrived in until something consumes it. Work out which argument is consumed
    last and you have the reason for the final `mov`.
  - "Four `s32` parameters in, an `s32` out. The last two are summed, that sum is
    multiplied by the second, and the first is added at the end."
---

# No room to breathe

A leaf function's arguments arrive in `r0`–`r3`, and it has `r0`–`r7` to work
in — but `r4`–`r7` have to be saved before they can be touched, and gcc will bend
a long way to avoid paying for that. A wide expression therefore becomes a puzzle
of consuming values in an order that leaves nothing stranded.

Here is `z * (w - x) + y`, which lines up perfectly:

```asm
0        sub       r0, r1
2        mul       r0, r3
4        add       r0, r2
6        bx        lr
```

Three instructions, four arguments, zero copies. The first thing the source does
is consume `w`, which frees `r0` immediately, and from then on `r0` is the
accumulator and every other value is read exactly once, in the order it sits in
the registers.

Now `(x - w) * (z - y)`, where both operands of the multiply are computed:

```asm
0        sub       r1, r0
2        sub       r3, r2
4        mov       r0, r1
6        mul       r0, r3
8        bx        lr
```

Both differences are built in place — `r1` and `r3` are dead afterwards, so they
are safe destinations — and then one copy is needed, because `mul` writes only to
the register holding its left operand and the answer has to end up in `r0`.

The rule underneath both listings: **a two-operand instruction writes to the
register holding its left operand**, so the running total lives wherever that
operand happened to be. In the first, the source consumes `w` before anything
else, the difference lands in `r0`, and every step after it keeps the total
there. In the second, the first difference lands in `r1`, and the product has to
end up in `r0`, so the total is copied across before the multiply can run.

A `mov r0, rN` in the final position is that same copy with nothing after it: the
total never reached `r0` on its own, and the last instruction puts it where the
ABI wants it.

Everything in this chapter has stayed inside `r0`–`r3`. Push a leaf function
past what four registers can hold and the listing gains a `push` at the top and a
matching `pop` at the bottom to borrow more — the shape you will take apart in
the ABI chapter. Its absence here is itself information: no `push` means no more
than four values were ever live at once.

Your target ends with one of those deferred moves. Find the value that is
consumed last and the final two instructions explain themselves.

## Your task

Write `func_08081408` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08081408(s32 a, s32 b, s32 c, s32 d) {
    return (c + d) * b + a;
}
```
