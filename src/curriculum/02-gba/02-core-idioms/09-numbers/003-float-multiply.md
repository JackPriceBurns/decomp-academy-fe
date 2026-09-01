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
  - Two `ldr`s with different offsets feed the one call. A word offset of 8 is
    two elements along when each element is four bytes wide.
  - "One `f32 *` in, an `f32` out. The elements are at index 0 and index 2."
---

# The name carries the types

`__mulsf3` reads as a sentence:

- `mul` — the operation.
- `sf` — **s**ingle **f**loat, the type it works in. `df` would be double.
- `3` — how many values the operation touches, counting the result. Binary
  operators are `3`; unary `__negsf2` is `2`.

So a single `bl __mulsf3` tells you the operator is `*`, both operands are
32-bit floats in `r0` and `r1`, and the product comes back in `r0` as a
32-bit float. That is the entire type signature of the operation, written on
the branch.

Here is a multiply where both operands are the same value:

```asm
0        push      {lr}
2        mov       r1, r0
4        bl        __mulsf3-4
8        pop       {r1}
10       bx        r1
```

The helper always wants two arguments, so squaring costs an extra `mov` to give
it a second copy. There is no way to tell `__mulsf3` that both operands are the
same value; it reads `r0` and `r1` either way.

That `mov r1, r0` is worth remembering as a shape. When you see an argument
duplicated into the second operand register just before a helper call, the
source used one value twice.

In your target the operands are fetched before the call rather than handed
straight in. Read the two `ldr` offsets and work out what they are counting.

## Your task

Write `func_08288960` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_08288960(f32 *p) {
    return p[0] * p[2];
}
```
