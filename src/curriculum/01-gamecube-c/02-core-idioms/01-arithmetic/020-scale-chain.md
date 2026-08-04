---
id: f3036f0b-feb8-5b88-8359-d2c723c167d0
slug: arithmetic-scale-chain
title: A Shift Inside a Mixed Chain
difficulty: 2
concepts:
  - arithmetic
  - multiplication
  - strength-reduction
  - chaining
symbol: func_800c0dbc
hints:
  - A lone `slwi` early in a chain is a constant multiply; convert the shift
    amount to its power of two (`slwi rX, rX, 4` is `× 16`).
  - After the shift, the rest of the chain is ordinary add/subtract threading
    through the scratch register.
---

# A shift inside a mixed chain

This time the constant multiply lives partway down a longer chain. A `× 2ⁿ`
strength-reduces to `slwi`, so the opening instruction is a shift even though the
C says multiply; everything past it is the same add/subtract threading you've
been doing all along.

Take `offset(p, q, r)`, scaling the first argument by a power of two, adding the
second, and subtracting the third:

```asm
slwi r0, r3, 5    # r0 = p << 5  =  p * 32
add  r0, r4, r0   # r0 = q + (p * 32)
subf r3, r5, r0   # r3 = r0 - r5
blr
```

Read the `slwi` as a multiply: shifting by 5 is `× 32`. It leaves the scaled
value in `r0`, and `add` then `subf` carry the total down to `r3`. The shift only
looks unusual; it's the first arithmetic step and nothing more.

Same shape in your target, just a different shift amount. Turn the count back
into its multiplier, then trace the two operations that follow.

## Your task

Write `func_800c0dbc` to reproduce the assembly above.

<!-- solution -->
```c
int func_800c0dbc(int a, int b, int c) {
    return a * 8 + b - c;
}
```
