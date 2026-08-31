---
id: e82d04e9-5fa8-4c37-be05-097ebd0e7fd4
slug: floats-round-trip
title: "In, Compute, Out: The Round Trip"
difficulty: 3
concepts:
  - floats
  - conversion
  - constants
symbol: func_8020b410
hints:
  - "Both border crossings are here, entrance and exit — between them, one `mul.s` with a ladder constant. Decode the `lui`."
  - "The C is one line, no explicit `(f32)` cast needed on the way in — mixing an `s32` into float math promotes it silently."
---

# An integer takes a float detour

Games constantly scale integers by fractional amounts — damage
percentages, speed modifiers — and the cheapest honest way is a
round trip through the FPU. Here's `quarterOf(n)`, which divides an
`s32` by `4.0f` and returns the whole part:

```asm
 0:  mtc1      a0, ft0        # n's bits ferry in…
 4:  lui       at, 0x3e80     # 0.25f (two rungs below 1.0f)
 8:  mtc1      at, ft2        # …the constant ferries in too
 c:  cvt.s.w   ft1, ft0       # n becomes a float
10:  mul.s     ft3, ft1, ft2  # n * 0.25f
14:  trunc.w.s ft4, ft3       # back to a whole number
18:  mfc1      v0, ft4        # exit ferry
1c:  nop
20:  jr        ra
24:  nop
```

Every piece is a lesson you've had, fused: the entrance trio, a
clean-bits constant, one `.s` op, the exit pair. Two reading notes:

- **The scheduler shuffled the hazards away.** No `nop` after either
  `mtc1` — the second ferry and the `cvt` slid into the gaps. The
  *pattern* survives even when the padding doesn't; match
  instructions, not spacing.
- **A divide became a multiply.** The C says `/ 4.0f`, the machine
  says `* 0.25f` — multiplying by the reciprocal is exact when the
  divisor is a power of two, and IDO takes that deal every time.
  A `mul.s` by a below-1.0 ladder constant often *decompiles* as
  either; the original programmer's spelling is yours to choose.

The target is the same round trip with a different ladder constant —
this one built from `1.0f`'s pattern with an extra bit, `0x3F40` —
and it really is a multiply this time. One line of C, and the
promotion into float happens without an explicit cast on the way in.

## Your task

Write `func_8020b410` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8020b410(s32 n) {
    return (s32)(n * 0.75f);
}
```
