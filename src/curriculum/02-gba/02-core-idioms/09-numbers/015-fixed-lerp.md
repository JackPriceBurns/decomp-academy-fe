---
id: 73a0ce78-dd06-4f3f-bc66-7f0c2448e4cc
slug: gba-numbers-fixed-lerp
title: Interpolating
difficulty: 3
concepts:
  - fixed-point
  - arithmetic
  - shifts
symbol: func_082be2d0
hints:
  - Work out what `r1` holds after each of the first three instructions, in
    terms of the arguments. Then read the final `add`.
  - "Three `s32` in, an `s32` out. Two of them are the endpoints, and the third
    is a Q8 weight. The result is in the same units as the endpoints."
---

# A blend found in almost every game

A camera following a target, a fade, a health bar moving toward a new value,
and a sprite sliding between two waypoints all use the same operation. Each is
a weighted blend of two endpoints by a fraction. In fixed point, the fraction
is a Q8 weight from 0 to 256, and the blend is a multiply, a shift and an add.

The most direct way to write it uses both weights:

```asm
0        mov       r3, #128
2        lsl       r3, #1
4        sub       r3, r2
6        mul       r0, r3
8        mul       r1, r2
10       add       r0, r1
12       asr       r0, #8
14       bx        lr
```

Read it from the top. The value 256 has to be built with `mov #128` and
`lsl #1`, because 255 is the largest immediate Thumb can encode. The `sub`
makes the complement weight. Then each endpoint is multiplied by its own
weight, the two Q8 products are added, and one `asr #8` brings the total back
to whole units. That is eight instructions, with no calls and no frame.

But it does two multiplies and needs the complement weight, and you can avoid
both. The blend has a second algebraic form that uses the weight only once.
That form needs one `mul` and never builds 256. gcc does not rewrite either
form into the other, so the listing shows which one the author wrote.

Your target uses the second form. Work out what value the first instruction
leaves in `r1`, and follow it through the multiply and the shift. The last
`add` tells you the rest.

The rounding from the last lesson applies here too, and it tells you something
when it is missing. If there is no bias before the `asr`, the original author
accepted a result that is always slightly too low. Plenty of real code does
this.

## Your task

Write `func_082be2d0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_082be2d0(s32 a, s32 b, s32 t) {
    return a + (((b - a) * t) >> 8);
}
```
