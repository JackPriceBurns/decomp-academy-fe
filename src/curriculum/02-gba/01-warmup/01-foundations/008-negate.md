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
  - There is a dedicated negate instruction. You do not need to build it from a
    subtract from zero.
  - "`neg rD, rS` computes `rD = -rS`, and here both are the same register."
---

# A dedicated instruction for a common job

Many processors negate a number by subtracting it from zero, so they first have
to put a zero into a register. Thumb avoids that with `neg rD, rS`. It computes
`rD = -rS` in one instruction and never needs a zero in a register.

Here is a function that returns the negation of its **second** argument:

```asm
0        neg       r0, r1
2        bx        lr
```

`rS` is `r1`, the second argument, and the negated result goes into `r0`, ready
to return. Notice that `neg` behaves like a three-operand form, even though it
has only two operands. It always names its source and destination separately,
so it can read one register and write a different one.

You will see this pattern throughout the course. When a dedicated instruction
exists, the compiler uses it instead of building the operation from smaller
steps. Most of the work of reading Thumb is learning to recognise these
single instructions quickly.

Apply `rD = -rS` to the registers in your target to find the C.

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
