---
id: 9c7b9387-0295-45e1-8c3b-b4ed987ffdcb
slug: gba-numbers-fixed-multiply
title: A Fixed-Point Multiply
difficulty: 3
concepts:
  - fixed-point
  - arithmetic
  - shifts
symbol: func_082b0c74
hints:
  - "`mov r2, r0` followed by `mul r2, r0` multiplies a register by itself, so
    that operand appears twice in the source. The `mov`s are there because
    `mul` overwrites its own first operand."
  - "Two `s32` in, an `s32` out. Both are Q8, both get squared, and each
    product is brought back to Q8 before they are added."
---

# The product carries twice the fraction

Multiply two Q8 numbers as plain integers and the answer is correct, but it is
not Q8 any more. Each operand was scaled by 256, so the product is scaled by
65536 — it is Q16. Shifting right by 8 puts the binary point back where you
want it:

```asm
0        mul       r0, r1
2        asr       r0, #12
4        bx        lr
```

That one is Q12: two operands scaled by 4096, a product scaled by 16777216, and
an `asr #12` to bring it home. **`mul` followed by an arithmetic right shift is
the fixed-point multiply**, and the shift amount tells you the format. Learn
that pair the way you learned `bl __mulsf3`.

The intermediate is where fixed point bites. That Q24 product has to fit in 32
bits before the shift throws the low twelve away, so two Q12 values of 12.0
each already overflow. Real code either keeps its ranges small, picks a format
with fewer fractional bits for the values that get large, or computes the
product in 64 bits and shifts that. The shift is the visible part; the range
analysis is the part the original programmer did in their head.

Narrow the operands and gcc does something worth staring at:

```asm
0        lsl       r0, #16
2        asr       r0, #16
4        lsl       r1, #16
6        asr       r1, #16
8        mul       r0, r1
10       lsl       r0, #4
12       asr       r0, #16
14       bx        lr
```

The four shifts at the top are the sign-extension of two 16-bit parameters —
this chip has no `sxth`. But the tail is not the `asr #12` you would predict
followed by another extension pair. gcc noticed that shifting right by 12 and
then re-extending 16 bits is the same as shifting **left by 4** and then right
by 16, and did it in two instructions instead of three. When a fixed-point shift
amount does not match the format you expected, check whether a narrowing
conversion has been folded into it.

Your target does the same job twice and adds the results. Watch how `mul`
forces a copy each time.

## Your task

Write `func_082b0c74` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_082b0c74(s32 x, s32 y) {
    return ((x * x) >> 8) + ((y * y) >> 8);
}
```
