---
id: int64-shift
title: Shifts Call an Intrinsic Too
difficulty: 2
concepts:
  - 64-bit
  - shifts
  - intrinsics
symbol: shl_64
hints:
  - A variable 64-bit shift has no single instruction, so it calls a helper just like division.
  - "Look for `bl __shl2i`; the shift amount is moved into r5 (`mr r5,r6`) before the call."
  - Just write `a << b` on two `u64` parameters.
---

# Shifting a value wider than the shifter

A 32-bit shift instruction can't move bits across the boundary between the two
halves of a 64-bit value, so a variable-distance 64-bit shift also defers to a
**runtime helper** — same pattern as division: a prologue, a `bl`, an epilogue:

```asm
stwu   r1, -16(r1)
mflr   r0
mr     r5, r6         # marshal the shift amount into r5
stw    r0, 20(r1)
bl     __shl2i        # 64-bit shift-left helper
lwz    r0, 20(r1)
mtlr   r0
addi   r1, r1, 16
blr
```

The left-shift helper is **`__shl2i`**. Right shifts pick the helper by
signedness: **`__shr2u`** for a logical (unsigned) shift and `__shr2i` for an
arithmetic (signed) one. As with division, the `mr r5, r6` beforehand is the
compiler arranging the arguments the helper expects — here, moving the shift
distance into place.

So the full set of 64-bit operations that *can't* be done inline — and therefore
announce themselves with a `bl __…2i`/`__…2u` — is **divide, modulo, and shift**.
Everything else (add, subtract, multiply, and the bitwise ops coming up next)
stays inline.

## Your task

Write `shl_64` to match the target.

<!-- starter -->
```c
u64 shl_64(u64 a, u64 b) {
    return 0;
}
```

<!-- solution -->
```c
u64 shl_64(u64 a, u64 b) {
    return a << b;
}
```
