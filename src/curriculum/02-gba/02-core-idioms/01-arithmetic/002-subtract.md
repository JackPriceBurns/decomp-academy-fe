---
id: 07053565-6457-4c48-968a-1788e9efd0c8
slug: gba-arithmetic-subtract
title: Order Matters in a Subtract
difficulty: 2
concepts:
  - arithmetic
  - operand-order
  - registers
symbol: func_08037a44
hints:
  - In a three-operand `sub`, the middle register is the value being subtracted
    from and the last one is what gets taken away.
  - "Three `s32` parameters in, an `s32` out. The expression opens with the
    third parameter minus the first, and the remaining two lines fold on in the
    order they appear."
---

# Reading the direction off a subtract

An addition written the wrong way round still gives the right answer. A
subtraction does not, so the encoding gcc picks carries more information.

The two-operand form takes the destination as the left side. Here is `x - y`:

```asm
0        sub       r0, r1
2        bx        lr
```

`r0 = r0 - r1`. Nothing surprising. Now the other direction, `y - x`:

```asm
0        sub       r0, r1, r0
2        bx        lr
```

`r0 = r1 - r0`. ARM's full instruction set has a reverse subtract, `rsb`, for
exactly this case. Thumb dropped it, so gcc uses the three-operand `sub` instead
and lets the destination appear again as the right-hand source.

That gives you a rule you will use constantly:

- **`sub rD, rN, rM`** subtracts `rM` **from** `rN`. The middle register is the
  minuend.
- When `rD` and `rM` are the same register, the compiler is subtracting the
  value it has been building **from** something else. Whatever is in the middle
  came from further left in the source expression.

The same reading works when one side is a partial result rather than an
argument. `sub r1, r3, r1` takes whatever `r1` has been accumulating and
subtracts it from the value sitting in `r3`, and everything after it operates on
that difference.

Work through your target one line at a time, keeping track of what `r0` holds
after each, and the expression falls out in source order.

## Your task

Write `func_08037a44` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08037a44(s32 a, s32 b, s32 c) {
    return c - a + b - 7;
}
```
