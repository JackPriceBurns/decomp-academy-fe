---
id: f009265c-f7e9-52b4-964b-ec41e7f0708f
slug: control-ne-bool
title: Not-Equal Is Its Own Idiom
difficulty: 2
concepts:
  - comparison
  - boolean
  - idiom
symbol: func_80002498
hints:
  - Inequality uses two subtractions ORed together.
  - The sign bit is harvested with `srwi r3, r0, 31`.
---

# Inequality flips the recipe

Last lesson, equality used `cntlzw` to spot a zero result. Inequality can use
a different trick: subtract in both directions, OR the differences, then keep
the sign bit (PowerPC bit 0).

For a worked example, compare `a` with `b + 4`. The addition happens first:

```asm
addi    r0,r4,4
subf    r4,r3,r0
subf    r0,r0,r3
or      r0,r4,r0
srwi    r3,r0,31
blr
```

If the compared values differ, at least one of the two differences has its
sign bit set. When they match, both differences are zero and so is the OR.
The closing `srwi r3, r0, 31` shifts the sign bit down into the low bit,
producing `0` or `1`.

The wraparound case works too: if one difference is `INT_MIN`, the other is
also `INT_MIN`. Their OR keeps the sign bit set, so the shift still produces
`1`.

## Your task

Write `func_80002498` to reproduce the target assembly.

<!-- solution -->
```c
int func_80002498(int a, int b) {
    return a != b;
}
```
