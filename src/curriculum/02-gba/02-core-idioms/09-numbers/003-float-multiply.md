---
id: eff8d1b1-bf21-4521-aa58-777a68d45bc9
slug: gba-numbers-float-multiply
title: Multiplying Floats
difficulty: 2
concepts:
  - floating-point
  - soft-float
  - memory
symbol: func_08288960
hints:
  - Two `ldr`s with different offsets load the operands for the one call. An
    offset of 8 in a word load is two elements along when each element is four
    bytes wide.
  - "One `f32 *` in, an `f32` out. The elements are at index 0 and index 2."
---

# The name gives the types

You can read `__mulsf3` in parts:

- `mul`: the operation.
- `sf`: **s**ingle **f**loat, the type it works on. `df` would be double.
- `3`: how many values the operation uses, counting the result. Binary
  operators have `3`. Unary `__negsf2` has `2`.

So one `bl __mulsf3` tells you that the operator is `*`, that both operands
are 32-bit floats in `r0` and `r1`, and that the product comes back in `r0` as
a 32-bit float. That is the whole type signature of the operation, written in
the branch.

Here is a multiply where both operands are the same value:

```asm
0        push      {lr}
2        mov       r1, r0
4        bl        __mulsf3-4
8        pop       {r1}
10       bx        r1
```

The helper always takes two arguments, so squaring needs an extra `mov` to
give it a second copy. You cannot tell `__mulsf3` that both operands are the
same value. It reads `r0` and `r1` either way.

Remember the pattern of that `mov r1, r0`. If an argument is copied into the
second operand register just before a helper call, the source used one value
twice.

In your target, the function loads the operands before the call instead of
receiving them directly. Read the two `ldr` offsets and work out what they
count.

## Your task

Write `func_08288960` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_08288960(f32 *p) {
    return p[0] * p[2];
}
```
