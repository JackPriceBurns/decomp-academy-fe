---
id: optimization-cse-strength
title: "Chaining: CSE Feeds Strength Reduction"
difficulty: 3
concepts:
  - cse
  - strength-reduction
  - chaining
symbol: cse_scale
hints:
  - One `divw` for two appearances of the same quotient is CSE; the multiply by a
    power of two that follows is strength-reduced to a `slwi`.
  - Write the quotient's two uses literally — don't pre-divide into a temporary if
    you want to *see* both transforms; either spelling collapses to one `divw`.
---

# Two transforms in one breath

You have met both halves of this separately. **CSE** (lesson 9) computes a
repeated subexpression once and reuses the register. **Strength reduction**
(lesson 8) rewrites a multiply by a power of two as a left shift. When the
*reused* value is then scaled by a power of two, both fire in the same short
sequence — and the target shrinks to three instructions where your C looked like
five operations.

Read it as a pipeline: CSE first decides "this quotient is computed once," then
strength reduction looks at what's done to that single result and turns the
`× 2ⁿ` into a shift.

Consider `twice(int x, int y)` — it forms `x / y`, scales that quotient by a
power of two, and subtracts the un-scaled quotient back off:

```asm
divw  r3, r3, r4    # q = x / y   — ONE divide for both uses (CSE)
slwi  r0, r3, 4     # q << 4  = q * 16   (the ×16 strength-reduced)
subf  r3, r3, r0    # (q * 16) - q
blr
```

The `divw` appears once even though `x / y` is written twice; that's CSE. The
`mulli` you might expect for the scale never shows up — `slwi r0,r3,4` is the
multiply by sixteen in shift form. Read the shift count to recover the
multiplier (shift by 4 is `× 16`), and read the final instruction to see how the
scaled and un-scaled quotients are combined (`subf rD,rA,rB` is `rB − rA`).

Your `cse_scale` has the same two-transform shape, but a **smaller** power of two
and the opposite combining instruction. Read the `slwi` count for the multiplier
and the last instruction for how the two copies of the quotient are joined.

## Your task

Write `cse_scale(int a, int b)` to reproduce the assembly above — one `divw`, one
`slwi`, one combining op.

<!-- starter -->
```c
int cse_scale(int a, int b) {
    return 0;
}
```

<!-- solution -->
```c
int cse_scale(int a, int b) {
    int q = a / b;
    return q * 8 + q;
}
```
