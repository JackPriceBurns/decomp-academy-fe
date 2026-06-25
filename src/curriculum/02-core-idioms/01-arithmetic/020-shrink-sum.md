---
id: arithmetic-shrink-sum
title: When a Divide Is a Shift
difficulty: 2
concepts:
  - arithmetic
  - division
  - strength-reduction
  - chaining
symbol: shrink2
hints:
  - "`srwi rD, rA, n` shifts *right* by `n`, which for an unsigned value is
    dividing by 2ⁿ — so `srwi rX, rX, 3` is `/ 8`."
  - The two shifts are independent; each divides one argument before they're
    combined. These are `u32` arguments, so the shift is logical (`srwi`).
---

# When a divide is a shift

The mirror of the multiply-shift: dividing an **unsigned** value by a constant
power of two never needs `divw`. The compiler strength-reduces it to a logical
right shift — **`srwi rD, rA, n` computes `rA >> n`, which for an unsigned `rA`
is `rA ÷ 2ⁿ`**. (Signed division can't do this directly; that's why these are
`u32` arguments and the instruction is `srwi`, not `srawi`.)

Consider `ratio(p, q)`, which divides two unsigned values by different powers of
two and subtracts:

```asm
srwi r4, r4, 2    # r4 = q >> 2  =  q / 4
srwi r0, r3, 3    # r0 = p >> 3  =  p / 8
subf r3, r4, r0   # r3 = r0 - r4  =  (p / 8) - (q / 4)
blr
```

Each `srwi` divides one argument independently, then `subf` combines them
(`subf rD, rA, rB` is `rB − rA`). The shift *amount* is the exponent: shifting
right by 2 divides by 4, by 3 divides by 8.

The target assembly uses the same shift-as-divide idea, but with different shift
amounts and a different combining instruction. Read each `srwi`'s count, turn it
into a divisor, and see how the two results are joined.

## Your task

Write `shrink2`, taking two `u32`s, to reproduce the assembly above.

<!-- starter -->
```c
u32 shrink2(u32 a, u32 b) {
    return 0;
}
```

<!-- solution -->
```c
u32 shrink2(u32 a, u32 b) {
    return a / 4 + b / 2;
}
```
