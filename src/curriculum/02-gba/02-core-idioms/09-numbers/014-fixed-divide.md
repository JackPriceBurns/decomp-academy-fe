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
  - "Everything before the `bl` builds the numerator. `asr r2, r1, #1` is half
    of the divisor, added so the quotient rounds to nearest instead of
    truncating."
  - "Two `s32` in, an `s32` out. The first argument is converted to Q8 before
    the divide. The second is the divisor and is not scaled at all."
---

# Scale up before you divide

Dividing a Q8 value by a plain integer works as it is: the quotient keeps the
same eight fractional bits. Dividing a Q8 value by another Q8 value cancels the
scale completely, so the answer is a plain integer. To get a Q8 result, you
have to put the scale back in **before** the division.

This is why the order of the shift and the call matters so much:

```asm
0        push      {lr}
2        bl        __divsi3-4
6        lsl       r0, #8
8        pop       {r1}
10       bx        r1
```

Here the shift comes after the call, so the fraction is already lost. The
divide truncated the result to a whole number, and the `lsl #8` then multiplied
that by 256. A quotient of 0.9 becomes zero and stays zero. If you put the
shift before the call instead, the divide has 8 extra bits of numerator to
work with, so the quotient keeps the fraction.

The same rule applies to a constant numerator. This example also uses the way
of building constants that you saw in the arithmetic chapter:

```asm
0        push      {lr}
2        mov       r1, r0
4        mov       r0, #128
6        lsl       r0, #5
8        bl        __divsi3-4
12       pop       {r1}
14       bx        r1
```

This is 4096 divided by the argument, which gives a reciprocal in Q12. The `mov
r1, r0` moves the argument out of `r0`, because `__divsi3` divides `r0` by
`r1`. The value 4096 is built with `mov #128` plus `lsl #5`, because it does
not fit in an 8-bit immediate.

You will often see one more refinement. `__divsi3` truncates, just like the
shift did. So a fixed-point divide that needs rounding adds half the divisor
to the numerator first. This is the same rounding idea as in the previous
lesson, but here there is no shift, so the bias goes on the numerator.

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
