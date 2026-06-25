---
id: arithmetic-scale-sum
title: When a Multiply Is a Shift
difficulty: 2
concepts:
  - arithmetic
  - multiplication
  - strength-reduction
  - chaining
symbol: scale2
hints:
  - "`slwi rD, rA, n` shifts left by `n`, which is the same as multiplying by 2ⁿ
    — so `slwi rX, rX, 3` is `× 8`."
  - The two shifts are independent; each scales one argument before they're
    combined.
---

# When a multiply is a shift

Multiplying by a constant power of two never needs `mullw`. The compiler
strength-reduces it to a left shift: **`slwi rD, rA, n` computes `rA << n`, which
is `rA × 2ⁿ`**. A `slwi` sitting in a chain is a multiply in disguise — read the
shift amount and raise two to it.

Consider `blend(p, q)`, which scales two values by different powers of two and
subtracts one from the other:

```asm
slwi r4, r4, 2    # r4 = q << 2  =  q * 4
slwi r0, r3, 3    # r0 = p << 3  =  p * 8
subf r3, r4, r0   # r3 = r0 - r4  =  (p * 8) - (q * 4)
blr
```

Each `slwi` scales one argument independently, then `subf` combines them
(`subf rD, rA, rB` is `rB − rA`). The shift *amount* is the exponent: shifting by
2 multiplies by 4, shifting by 3 multiplies by 8.

The target assembly uses the same shift-as-multiply idea, but with different
shift amounts and a different combining instruction. Read each `slwi`'s count,
convert it to a multiplier, and see how the two scaled values are joined.

## Your task

Write `scale2`, taking two `int`s, to reproduce the assembly above.

<!-- starter -->
```c
int scale2(int a, int b) {
    return 0;
}
```

<!-- solution -->
```c
int scale2(int a, int b) {
    return a * 4 + b * 2;
}
```
