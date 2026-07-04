---
id: bbc15c8c-9a57-5356-a866-cd75402f093e
slug: arithmetic-div-pow2-unsigned
title: Unsigned Divide by a Power of Two
difficulty: 2
concepts:
  - strength-reduction
  - shifts
  - unsigned
symbol: divPow2U
hints:
  - Unsigned divide by 4 is a logical right shift by 2.
  - Since the type is unsigned, it's a logical right shift with no rounding
    correction.
---

# Dividing unsigned is just a shift

On an **unsigned** value, dividing by a power of two collapses to a logical
right shift, `srwi`, which is yet another face of `rlwinm`. No rounding fix is
required, since unsigned division truncates toward zero anyway and the shift just
discards the low bits that would have been the remainder.

Run `udiv8(n) = n / 8` through the compiler and you get:

```asm
srwi r3, r3, 3    # n >> 3  ==  n / 8 (unsigned)
blr
```

The shift count is log base 2 of the divisor, so `2^3 = 8` lands on a shift of 3 —
a target that shifts right by `N` is dividing by `2^N`, which means the shift
count alone tells you the divisor.

**Signed** division by a power of two is a different beast. It has to round
toward zero for negative inputs, so instead of one clean shift MWCC produces a
`srawi`/`addze` correction pair. That's the next lesson.

## Your task

(`u32` is the GameCube SDK's typedef for `unsigned int` — it's pre-declared for
you here, not a built-in C type.)

Write `divPow2U` taking a `u32 x` to reproduce the assembly above.

<!-- starter -->
```c
u32 divPow2U(u32 x) {
    return 0;
}
```

<!-- solution -->
```c
u32 divPow2U(u32 x) {
    return x / 4;
}
```
