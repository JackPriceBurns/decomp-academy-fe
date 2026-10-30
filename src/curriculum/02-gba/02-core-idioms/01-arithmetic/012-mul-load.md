---
id: 710fcbb1-07c0-443d-9c5b-e1835f46bd12
slug: gba-arithmetic-mul-load
title: When gcc Gives Up and Uses mul
difficulty: 3
concepts:
  - multiply
  - strength-reduction
  - constants
symbol: func_08065bf4
hints:
  - The constant is right there in the `mov`. It goes into the destination
    register because `mul` has no immediate form to hold it.
  - The function takes three `s32` parameters and returns an `s32`. The first
    parameter is unused. The third is multiplied by the constant, and the second
    is subtracted from the product.
---

# Constants gcc does not split up

gcc tries to build every multiply by a constant from shifts, adds and
subtracts. If the shortest chain it can find still costs too much, it stops
trying. It puts the constant in a register and uses the multiplier instead.

Here is `y * 13`:

```asm
0        mov       r0, #13
2        mul       r0, r1
4        bx        lr
```

That is two instructions, and the constant appears in the listing, so you can
read it directly.

Notice where the constant went. `mul` has no immediate form, so the constant
has to be put in a register first. `mul` is also two-operand, so one of its two
registers is the destination too. Here the variable was in `r1` and the answer
belongs in `r0`. So the constant goes into `r0`, and the product overwrites it.
If the variable had already been in `r0`, the constant would have gone to a
scratch register, and the `mul` would read it from there. In both cases the
pair means the same thing. A `mov rD, #k` that feeds a `mul` is a multiply by
k. Which register holds which operand depends on where the variable started.

Now here is `x * 19`, a constant where gcc chose the chain:

```asm
0        mov       r1, r0
2        lsl       r0, r1, #2
4        add       r0, r1
6        lsl       r0, #2
8        sub       r0, r1
10       bx        lr
```

That is five instructions, and one of them is the copy that keeps the
multiplicand. The chain works like this: four times `x` plus `x` is five times,
multiplied by four is twenty times, and minus `x` is nineteen times. The
**larger** constant got the chain, and the smaller one got the multiply.

This is not a mistake, and you cannot predict it from the size of the number.
What decides it is how well the constant breaks down into shifts, adds and
subtracts. 45 is 3 × 16 − 3, which agbcc builds as a triple, a shift and one
subtraction. 43 is prime and cannot be broken down like that, so it keeps the
multiplier. The results do not follow a simple pattern: 11 and 13 use `mul`, 15
and 19 use chains, 22 uses `mul`, and 43 uses `mul` while 45, next to it, uses
a chain. There is no simple rule to learn. You have to read the listing in
front of you.

This matters when you match. If your target has `mov rD, #k / mul`, write the
multiply by k and keep it that way. If you replace it with arithmetic you think
is equivalent, you will get a chain and a diff. If the target is a chain, the
constant is whatever the chain works out to, and writing that constant directly
may give you a `mul` instead.

## Your task

Write `func_08065bf4` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08065bf4(s32 a, s32 b, s32 c) {
    return c * 44 - b;
}
```
