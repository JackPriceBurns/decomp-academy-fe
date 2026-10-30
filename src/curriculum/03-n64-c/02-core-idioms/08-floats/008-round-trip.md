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
  - "Both conversions are here, in and out. Between them is one `mul.s` with a ladder constant. Decode the `lui`."
  - "The C is one line. You don't need an explicit `(f32)` cast on the way in, because mixing an `s32` into float math promotes it automatically."
---

# An integer goes through the FPU

Games often scale integers by fractions, for example damage percentages or
speed modifiers. The cheapest correct way to do this is a round trip through
the FPU. This is `quarterOf(n)`, which divides an `s32` by `4.0f` and returns
the whole part:

```asm
 0:  mtc1      a0, ft0        # n's bits move in…
 4:  lui       at, 0x3e80     # 0.25f (two ladder steps below 1.0f)
 8:  mtc1      at, ft2        # …the constant moves in too
 c:  cvt.s.w   ft1, ft0       # n becomes a float
10:  mul.s     ft3, ft1, ft2  # n * 0.25f
14:  trunc.w.s ft4, ft3       # back to a whole number
18:  mfc1      v0, ft4        # move the result out
1c:  nop
20:  jr        ra
24:  nop
```

Every part of this is something you have already learned: the three entry
instructions, a constant with clean bits, one `.s` operation and the exit
pair. Two things to note when you read it:

- **The scheduler filled the hazard slots.** There is no `nop` after either
  `mtc1`, because the second `mtc1` and the `cvt` were placed in those gaps.
  The *pattern* is still there when the padding is gone, so match the
  instructions and ignore the spacing.
- **A divide became a multiply.** The C says `/ 4.0f`, and the machine code
  says `* 0.25f`. Multiplying by the reciprocal gives an exact result when the
  divisor is a power of two, so IDO always makes this change. A `mul.s` by a
  ladder constant below 1.0 can often be *decompiled* as either a multiply or
  a divide, and you can choose which one to write.

The target is the same round trip with a different ladder constant. This one
is `1.0f`'s pattern with one extra bit set, `0x3F40`, and this time the C
really is a multiply. The C is one line, and the integer becomes a float on
the way in without an explicit cast.

## Your task

Write `func_8020b410` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8020b410(s32 n) {
    return (s32)(n * 0.75f);
}
```
