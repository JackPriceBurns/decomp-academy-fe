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
  - The constant is sitting in plain sight in the `mov`. It lands in the
    destination register because `mul` has no immediate form to put it in.
  - "Three `s32` parameters in, an `s32` out, with the first unused. The third is
    multiplied by the constant and the second is subtracted from the product."
---

# The constant that was not worth taking apart

gcc tries to build every constant multiply out of shifts, adds and subtracts.
When the shortest chain it can find still looks expensive, it gives up, puts the
constant in a register and uses the multiplier instead.

Here is `y * 13`:

```asm
0        mov       r0, #13
2        mul       r0, r1
4        bx        lr
```

Two instructions, and the constant is written out in the listing where you can
read it directly.

Notice where the constant went. `mul` has no immediate form, so the constant has
to be materialised in a register first, and `mul` is two-operand, so one of those
two registers is also the destination. Here the variable was in `r1` and the
answer belongs in `r0`, so `r0` is what the constant lands in and the product
overwrites it. Had the variable arrived in `r0` already, the constant would have
gone to a scratch register and the `mul` would read it from there. Either way the
pair means the same thing: a `mov rD, #k` feeding a `mul` is a multiply by k, and
which register holds which operand follows from where the variable started.

Now here is `x * 19`, one of the constants that went the other way:

```asm
0        mov       r1, r0
2        lsl       r0, r1, #2
4        add       r0, r1
6        lsl       r0, #2
8        sub       r0, r1
10       bx        lr
```

Five instructions, one of them the copy that keeps the multiplicand alive: four
copies plus one is five, times four is twenty, minus one is nineteen. The
**larger** constant got the chain and the smaller one got the multiply.

That is not a mistake, and it is not something you can work out from the size of
the number. What decides it is how neatly the constant factors. 45 is 3 × 16 − 3,
which agbcc builds as a triple, a shift and one subtraction; 43 is prime and has
no such shape, so it keeps the multiplier. The outcome jumps around — 11 and 13 use
`mul`, 15 and 19 use chains, 22 uses `mul`, 43 uses `mul` while its neighbour 45
uses a chain. There is no rule of thumb to learn, only the listing in front of
you.

The practical consequence is a matching one. If your target says
`mov rD, #k / mul`, write the multiply by k and leave it alone — replacing it
with arithmetic you think is equivalent produces a chain and a diff. If the
target is a chain, the constant is whatever the chain works out to, and asking
for it directly may well give you a `mul` instead.

## Your task

Write `func_08065bf4` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08065bf4(s32 a, s32 b, s32 c) {
    return c * 44 - b;
}
```
