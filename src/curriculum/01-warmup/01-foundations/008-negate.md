---
id: foundations-negate
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

Plenty of chips negate a number by subtracting it from zero. PowerPC skips all
that. There is `neg rD, rA`, which is `rD = -rA`, one instruction that flips the
sign without ever touching a zero register.

Say some function takes two `int`s and returns the negation of the second one. It
compiles down to this.

```asm
neg  r3, r4
blr
```

So `rA` is `r4`, the second argument, and `rD = -rA` settles into `r3`, ready to
hand back.

You will meet this habit again and again. Where a dedicated instruction exists,
MWCC grabs it rather than building the operation out of smaller pieces, and
learning to recognize those idioms is honestly most of the work.

Run `rD = -rA` against the target and the C expression you need falls right out.

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
