---
id: 3d8c45f0-825a-4cc8-a243-ff677112fcc4
slug: gba-foundations-shift
title: Shifting Is Multiplying
difficulty: 1
concepts:
  - arithmetic
  - shifts
symbol: doubleUp
hints:
  - A left shift by n multiplies by 2 to the power n. Read the shift amount from
    the target to find the factor.
  - The three-operand form means the source and the destination are different
    registers, so the value being shifted is not in the register that the
    result is returned in.
---

# Multiplying by a power of two

Multiplying by a power of two is the same operation as shifting the bits left.
Shifting is cheaper, so the compiler never emits a multiply for these values. It
uses `lsl` (**l**ogical **s**hift **l**eft) instead, and the shift amount is the
exponent: `lsl #1` doubles, `lsl #2` multiplies by four, and `lsl #3` multiplies
by eight.

Here is a function that returns its **first** argument times four:

```asm
0        lsl       r0, #2
2        bx        lr
```

This is the two-operand form, because the value being shifted is already in the
register where the result has to end up. The input is in `r0`, the result is in
`r0`, and no other register is used.

Now see what changes when the value starts in a different register. This
function scales its **third** argument:

```asm
0        lsl       r0, r2, #4
2        bx        lr
```

This has three operands: it reads `r2` and writes `r0`. The compiler needs a
form that takes its input from one register and puts the result in another, and
`lsl` has one. Both forms are the same instruction doing the same job. The
number of operands tells you where the value came from.

Your target uses the three-operand form. Find which register it reads its input
from, and what the shift amount is.

## Your task

Write `doubleUp`, taking two `s32`s, to reproduce the target assembly.

<!-- starter -->
```c
s32 doubleUp(s32 a, s32 b) {
    return 0;
}
```

<!-- solution -->
```c
s32 doubleUp(s32 a, s32 b) {
    return b * 2;
}
```
