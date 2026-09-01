---
id: 51c42435-67f7-4ef4-aa4b-6e1138ad8f3c
slug: gba-numbers-fixed-divide
title: Dividing in Fixed Point
difficulty: 4
concepts:
  - fixed-point
  - division
  - rounding
symbol: func_082b9b5c
hints:
  - "Everything before the `bl` is building the numerator. `asr r2, r1, #1` is
    half of the divisor, added on so the quotient rounds to nearest instead of
    truncating."
  - "Two `s32` in, an `s32` out. The first argument is lifted into Q8 before
    the divide; the second is the divisor and is not scaled at all."
---

# Scale up before you divide, not after

Dividing a Q8 value by a plain integer already works: the quotient keeps the
same eight fractional bits. Dividing a Q8 value by another Q8 value cancels the
scale out completely, so the answer comes back as a plain integer, and getting
Q8 out again means putting the scale back in **before** the division.

Which is why the ordering of the shift and the call is the whole story:

```asm
0        push      {lr}
2        bl        __divsi3-4
6        lsl       r0, #8
8        pop       {r1}
10       bx        r1
```

Here the shift is after the call, and the fraction is already gone. The divide
truncated to a whole number and the `lsl #8` just multiplied that by 256; a
quotient of 0.9 arrives as zero and stays zero. Put the shift before the call
instead and the divide has 8 extra bits of numerator to work with, so the
quotient carries the fraction.

The same lesson applies to a constant numerator, and it brings in the
constant-building idiom from the arithmetic chapter:

```asm
0        push      {lr}
2        mov       r1, r0
4        mov       r0, #128
6        lsl       r0, #5
8        bl        __divsi3-4
12       pop       {r1}
14       bx        r1
```

That is 4096 divided by the argument, which is a reciprocal in Q12. The `mov
r1, r0` moves the argument out of the way because `__divsi3` divides `r0` by
`r1`, and 4096 is built with `mov #128` plus `lsl #5` because it will not fit
in an 8-bit immediate.

There is one more refinement you will meet constantly. `__divsi3` truncates,
just like the shift did, so a fixed-point divide that wants rounding adds half
the divisor to the numerator first — the same trick as the previous lesson, in
the one place where there is no shift to bias.

Your target scales its numerator and adjusts it before calling the helper.
Read the two instructions in between.

## Your task

Write `func_082b9b5c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_082b9b5c(s32 a, s32 b) {
    return ((a << 8) + (b >> 1)) / b;
}
```
