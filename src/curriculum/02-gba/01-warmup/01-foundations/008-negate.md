---
id: 37ce40dd-4b17-5b14-b2e2-498c4550c47b
slug: gba-foundations-negate
title: One Instruction Flips the Sign
difficulty: 1
concepts:
  - arithmetic
  - registers
symbol: negate
hints:
  - There is a dedicated negate instruction; you do not build it out of a
    subtract from zero.
  - "`neg rD, rS` computes `rD = -rS`, and here both are the same register."
---

# A dedicated instruction for a common job

Plenty of processors negate a number by subtracting it from zero, which means
first getting a zero into a register. Thumb skips that with `neg rD, rS`,
computing `rD = -rS` in one instruction and never materialising the zero.

Here is a function that returns the negation of its **second** argument:

```asm
0        neg       r0, r1
2        bx        lr
```

`rS` is `r1`, the second argument, and the flipped result lands in `r0` ready to
return. Notice this one is a three-operand-style form even though it only has two
operands — `neg` always names its source and destination separately, so it can
read one register and write another.

You will meet this habit throughout the course: where a dedicated instruction
exists, the compiler reaches for it instead of assembling the operation out of
smaller pieces. Learning to recognise those one-instruction idioms on sight is
most of the work of reading Thumb.

Run `rD = -rS` against your target and the C falls out.

## Your task

Write `negate`, taking an `s32 x`, to reproduce the target assembly.

<!-- starter -->
```c
s32 negate(s32 x) {
    return 0;
}
```

<!-- solution -->
```c
s32 negate(s32 x) {
    return -x;
}
```
