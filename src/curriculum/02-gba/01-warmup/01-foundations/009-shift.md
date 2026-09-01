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
  - A left shift by n multiplies by 2 to the power n — read the shift amount off
    the target to recover the factor.
  - The three-operand form means the source and the destination are different
    registers, so the value being shifted is not the one being returned into.
---

# Powers of two never reach a multiply

Multiplying by a power of two is the same operation as shifting the bits left,
and shifting is cheaper, so the compiler never emits a multiply for one. `lsl` —
**l**ogical **s**hift **l**eft — does the job, and the shift amount is the
exponent: `lsl #1` doubles, `lsl #2` quadruples, `lsl #3` multiplies by eight.

Here is a function that returns its **first** argument times four:

```asm
0        lsl       r0, #2
2        bx        lr
```

Two-operand form, because the value being shifted is already in the register the
result has to end up in. `r0` goes in, `r0` comes out, nothing else is touched.

Now watch what changes when the value starts somewhere else — this one scales its
**third** argument:

```asm
0        lsl       r0, r2, #4
2        bx        lr
```

Three operands: read `r2`, write `r0`. The compiler needs a shape that can take
its input from one register and put its answer in another, and `lsl` has one.
The two forms are the same instruction doing the same job — the operand count is
telling you where the value came from.

Your target uses the three-operand form. Read which register it takes its input
from and what the shift amount is.

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
