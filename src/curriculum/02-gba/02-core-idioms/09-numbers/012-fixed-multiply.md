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
  - "Two `s32` in, an `s32` out. Both are Q8 and both are squared. Each product
    is shifted back to Q8 before the two are added."
---

# The product has twice the fraction bits

If you multiply two Q8 numbers as plain integers, the answer is correct, but it
is no longer Q8. Each operand was scaled by 256, so the product is scaled by
65536, which makes it Q16. Shifting right by 8 puts the binary point back
where you want it:

```asm
0        mul       r0, r1
2        asr       r0, #12
4        bx        lr
```

That example is Q12. The two operands are scaled by 4096, the product is
scaled by 16777216, and an `asr #12` brings it back to Q12. **`mul` followed
by an arithmetic right shift is the fixed-point multiply**, and the shift
amount tells you the format. Learn that pair as well as you learned
`bl __mulsf3`.

The weak point of fixed point is the intermediate product. That Q24 product
has to fit in 32 bits before the shift removes the low twelve bits. So two Q12
values of 12.0 each are already enough to overflow. Real code handles this in
one of three ways. It keeps its ranges small, it uses a format with fewer
fractional bits for values that get large, or it computes the product in 64
bits and shifts that. You can see the shift in the assembly. The range
planning happened in the original programmer's head, so you cannot see it.

If you make the operands narrower, gcc does something worth studying closely:

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

The four shifts at the top sign-extend two 16-bit parameters, because this
chip has no `sxth`. The end of the function does not use the `asr #12` you
might expect, followed by another pair of extension shifts. gcc saw that
shifting right by 12 and then sign-extending from 16 bits is the same as
shifting **left by 4** and then right by 16. So it did the work in two
instructions instead of three. When a fixed-point shift amount does not match
the format you expected, check whether a narrowing conversion has been
combined with it.

Your target does the same job twice and adds the results. Notice how `mul`
forces a copy each time.

## Your task

Write `func_082b0c74` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_082b0c74(s32 x, s32 y) {
    return ((x * x) >> 8) + ((y * y) >> 8);
}
```
