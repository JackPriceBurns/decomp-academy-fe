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
  - The function takes three `s32` parameters and returns an `s32`. The
    expression starts with the third parameter minus the first. The remaining
    two lines are applied in the order they appear.
---

# Reading the order of a subtraction

If you swap the operands of an addition, the answer stays the same. A
subtraction gives a different answer, so the encoding gcc picks tells you more.

In the two-operand form, the destination is the left side. Here is `x - y`:

```asm
0        sub       r0, r1
2        bx        lr
```

This means `r0 = r0 - r1`, as you would expect. Now the other direction,
`y - x`:

```asm
0        sub       r0, r1, r0
2        bx        lr
```

This means `r0 = r1 - r0`. The full ARM instruction set has a reverse subtract,
`rsb`, for this case. Thumb dropped it, so gcc uses the three-operand `sub`
instead, with the destination repeated as the right-hand source.

This gives you a rule you will use all the time:

- **`sub rD, rN, rM`** subtracts `rM` **from** `rN`. The middle register is the
  minuend (the value being subtracted from).
- When `rD` and `rM` are the same register, the compiler is subtracting the
  value it has been building **from** something else. Whatever is in the middle
  register came from further left in the source expression.

You can read it the same way when one side is a partial result instead of an
argument. `sub r1, r3, r1` takes the value `r1` has built up so far and
subtracts it from the value in `r3`. Every instruction after it works on that
difference.

Work through your target one line at a time. Keep track of what `r0` holds after
each line, and you will get the expression back in source order.

## Your task

Write `func_08037a44` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08037a44(s32 a, s32 b, s32 c) {
    return c - a + b - 7;
}
```
