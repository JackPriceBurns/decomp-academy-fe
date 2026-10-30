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
  - "Both `nop`s are compiler padding. The C is a single return expression."
---

# The multiply comes last

When a multiply's operands are themselves expressions, the scheduler has no
freedom over the overall order: both operands must be *finished* before `multu`
can start. So the listing works from the inside out, with the setup first and
the multiply after it. Here is `blend(a, b, c, d)`, which returns
`(a + b) * (c - d)`:

```asm
addu   t6, a0, a1   # left factor
subu   t7, a2, a3   # right factor
multu  t6, t7       # only now can the multiply begin
mflo   v0
nop                 # the two-slot window,
nop                 #   and nothing can fill it
jr     ra
nop
```

Look at what happened to the window from the last lesson. There are two free
slots after `mflo`, and this function has other instructions. But every one of
them *feeds the product*, so none of them can move below it. Work that the
product depends on can't fill the window, so both slots get a `nop`. When you
see an `mflo` followed by two `nop`s in a function with other work in it, this
is what it tells you: everything else in the function happens *before* the
multiply.

To read a shape like this, work backwards. Start at `mflo` and find the
`multu`. Then trace each of its two operand registers up to the instruction
that produced it. The C is one expression with two halves in parentheses.

The target has the same structure, with different operations in the two setup
slots. Trace which arguments each one combines, and how.

## Your task

Write `func_802d2210` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_802d2210(s32 a, s32 b, s32 c, s32 d) {
    return (a ^ b) * (c + d);
}
```
