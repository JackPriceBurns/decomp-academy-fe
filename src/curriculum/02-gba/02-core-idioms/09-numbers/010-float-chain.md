---
id: 89496350-cb3b-4b47-a934-63a7659d1174
slug: gba-numbers-float-chain
title: A Chain of Calls
difficulty: 4
concepts:
  - floating-point
  - soft-float
  - register-allocation
symbol: func_082a7d8c
hints:
  - Count the calls, then read the registers each one is given. Values are
    copied into `r5` and `r6` before the first call because the second call
    needs them afterwards.
  - "Four `f32` in, an `f32` out. The results of two calls to the same helper
    are the operands of the third, and `r4` keeps the first result safe during
    the second call."
---

# Values that must survive a call

One float operation is one call. Two float operations are two calls, and the
result of the first must stay alive while the second runs. The soft-float
helpers follow the ordinary calling convention, so they are free to overwrite
`r0` to `r3`. Any value that must last has to be in `r4` or higher, and those
registers must be pushed first.

That is why a float expression with three terms needs a frame:

```asm
0        push      {r4, lr}
2        mov       r4, r2
4        bl        __mulsf3-4
8        mov       r1, r4
10       bl        __addsf3-4
14       pop       {r4}
16       pop       {r1}
18       bx        r1
```

The third argument is saved in `r4` before anything else happens. The multiply
runs on `r0` and `r1` and returns the product in `r0`, which is already where
the add expects its first operand. One `mov` copies the saved value back out of
`r4`, and the second call is ready.

Now write the same arithmetic with the terms the other way round:

```asm
0        push      {r4, lr}
2        mov       r4, r2
4        bl        __mulsf3-4
8        mov       r1, r0
10       mov       r0, r4
12       bl        __addsf3-4
16       pop       {r4}
18       pop       {r1}
20       bx        r1
```

This version is two bytes longer. gcc still computes the product first,
because the add depends on it. But now the product belongs in the *second*
operand position, so it moves to `r1`, and the saved value has to come back
into `r0`. gcc does not swap the operands or regroup the terms. Floating-point
addition is not associative in IEEE-754, so gcc keeps the order you wrote.

So the register moves between calls give you real information. Two `mov`s
where one would be enough mean the operands were written in the more expensive
order. To reproduce the listing, you have to write them in that order too.

Your target pushes three callee-saved registers and makes three calls. Work
out which values each call receives, and that will show you where the brackets
go.

## Your task

Write `func_082a7d8c` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_082a7d8c(f32 a, f32 b, f32 c, f32 d) {
    return (a - b) * (c - d);
}
```
