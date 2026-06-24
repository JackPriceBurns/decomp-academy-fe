---
id: arithmetic-div-pow2-unsigned
title: Unsigned Divide by a Power of Two
difficulty: 2
concepts:
  - strength-reduction
  - shifts
  - unsigned
symbol: udiv4
hints:
  - Unsigned divide by 4 is a logical right shift by 2.
  - Since the type is unsigned, it's a logical right shift with no rounding
    correction.
---

# Dividing unsigned is just a shift

For an **unsigned** value, dividing by a power of two is a logical right shift —
`srwi`, again an extended form of `rlwinm`. No rounding correction is needed
because unsigned division truncates toward zero and the high bits are simply
discarded.

For example, `udiv8(n) = n / 8` compiles to:

```asm
srwi r3, r3, 3    # n >> 3  ==  n / 8 (unsigned)
blr
```

The shift amount is the base-2 logarithm of the divisor: `2^3 = 8`, so the
shift is 3. Look at the shift amount in the target assembly and work backwards:
`2^N` gives you the divisor.

**Signed** division by a power of two is much trickier — it has to round toward
zero for negatives, so MWCC emits a `srawi`/`addze` correction pair rather than
a plain shift, which the next lesson walks through.

## Your task

(`u32` is the GameCube SDK's typedef for `unsigned int` — it's pre-declared for
you here, not a built-in C type.)

Write `udiv4` taking a `u32 x` to reproduce the assembly above.

<!-- starter -->
```c
u32 udiv4(u32 x) {
    return 0;
}
```

<!-- solution -->
```c
u32 udiv4(u32 x) {
    return x / 4;
}
```
