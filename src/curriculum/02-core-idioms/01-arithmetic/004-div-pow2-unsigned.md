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
`srwi`, again an extended form of `rlwinm`:

```asm
srwi r3, r3, 2    # x >> 2 == x / 4 (unsigned)
blr
```

No rounding correction is needed because unsigned division truncates toward zero
and the high bits are simply discarded. **Signed** division by a power of two is
much trickier — it has to round toward zero for negatives, so MWCC emits a
`srawi`/`addze` correction pair rather than a plain shift, which the next lesson
walks through.

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
