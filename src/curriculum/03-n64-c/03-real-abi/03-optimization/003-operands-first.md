---
id: ab488423-928f-4958-96d4-6166b4d3553e
slug: opt-operands-first
title: Feeding the Multiplier
difficulty: 2
concepts:
  - optimizer
  - scheduling
  - multiply
  - hi-lo
symbol: func_802d2210
hints:
  - "Two setup instructions, then the multiply of their results. Identify which pair of arguments feeds each one."
  - "Both `nop`s are compiler padding — the C is a single return expression."
---

# The multiply comes last

When a multiply's operands are themselves expressions, the scheduler has no
choice about the big picture: both operands must be *finished* before `multu`
can start. So the listing reads inside-out — setup first, multiply after.
Here's `blend(a, b, c, d)`, which returns `(a + b) * (c - d)`:

```asm
addu   t6, a0, a1   # left factor
subu   t7, a2, a3   # right factor
multu  t6, t7       # only now can the multiply begin
mflo   v0
nop                 # the two-slot window —
nop                 #   and nothing can fill it
jr     ra
nop
```

Note what happened to the window from last lesson. There are two free slots
after `mflo`, and this function has instructions to spare — but every one of
them *feeds the product*, so none may move below it. Dependent work can't fill
the window, and both slots go to `nop`. When you see a fully-padded `mflo` in
a nontrivial function, that's what it's telling you: everything else in the
function happens *before* the multiply.

Reading a shape like this, work backwards: start at `mflo`, find the `multu`,
then trace each of its two operand registers up to the instruction that
produced it. The C falls out as one expression with two parenthesized halves.

The target is the same skeleton with different operations in the two setup
slots. Trace which arguments each one combines, and how.

## Your task

Write `func_802d2210` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_802d2210(s32 a, s32 b, s32 c, s32 d) {
    return (a ^ b) * (c + d);
}
```
