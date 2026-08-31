---
id: 5bdf860e-656f-5f67-8e06-0041f2a7427f
slug: foundations-negate
title: Negation and the Zero Register
difficulty: 1
concepts:
  - arithmetic
  - registers
symbol: negate
hints:
  - There is a dedicated negate instruction — you don't build it from a
    subtract-from-zero.
  - The same principle applies to bitwise NOT — look for `not` rather than an
    `xor` with -1.
---

# One instruction, no zero needed

Plenty of ISAs negate a number by subtracting it from zero. PowerPC doesn't
bother — there's `neg rD, rA`, meaning `rD = -rA`, one instruction that flips
the sign without touching a zero register.

Negating the second of two `int` arguments:

```asm
neg  r3, r4
blr
```

`rA` is `r4`, the second argument, and the result settles into `r3`, ready to
hand back.

You'll see this habit everywhere: where a dedicated instruction exists, MWCC
uses it rather than building the operation from smaller pieces. Learning to
recognize those idioms is most of the job.

The target gives you `rD = -rA`; the C expression follows from that.

## Your task

Write `negate`, taking an `int x`, to match the target assembly.

<!-- starter -->
```c
int negate(int x) {
    return 0;
}
```

<!-- solution -->
```c
int negate(int x) {
    return -x;
}
```
