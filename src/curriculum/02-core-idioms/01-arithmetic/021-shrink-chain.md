---
id: arithmetic-shrink-chain
title: A Shift-Divide in a Chain
difficulty: 2
concepts:
  - arithmetic
  - division
  - strength-reduction
  - chaining
symbol: shrink3
hints:
  - An early `srwi` on an unsigned value is a constant divide; convert the shift
    amount to its power of two (`srwi rX, rX, 4` is `/ 16`).
  - After the shift, the rest of the chain is ordinary add/subtract threading
    through the scratch register.
---

# A shift-divide in a chain

Just as a constant multiply can hide as `slwi`, a constant **unsigned** divide
hides as `srwi` at the head of a chain. Read it as `÷ 2ⁿ`, then the rest of the
chain is the ordinary add/subtract threading you already know.

Consider `decay(p, q, r)`, which divides the first unsigned argument by a power
of two, adds the second, and subtracts the third:

```asm
srwi r0, r3, 5    # r0 = p >> 5  =  p / 32
add  r0, r0, r4   # r0 = (p / 32) + q
subf r3, r5, r0   # r3 = r0 - r5
blr
```

The `srwi` strength-reduces the constant divide (shift right by 5 is `÷ 32`),
parks the result in `r0`, and the `add`/`subf` carry the running total to `r3`.
The shift is just the first arithmetic step.

The target assembly follows the same shape — a constant-divide shift, then two
more operations — but with a different shift amount. Read the shift count to
recover the divisor, then trace the rest of the chain.

## Your task

Write `shrink3`, taking three `u32`s, to reproduce the assembly above.

<!-- starter -->
```c
u32 shrink3(u32 a, u32 b, u32 c) {
    return 0;
}
```

<!-- solution -->
```c
u32 shrink3(u32 a, u32 b, u32 c) {
    return a / 8 + b - c;
}
```
