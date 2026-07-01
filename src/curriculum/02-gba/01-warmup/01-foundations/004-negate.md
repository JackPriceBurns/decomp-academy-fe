---
id: gba-foundations-negate
title: Negation in One Instruction
difficulty: 1
concepts:
  - arithmetic
  - registers
symbol: negate
hints:
  - There is a dedicated negate instruction — you don't build it from a
    subtract-from-zero.
  - "`neg Rd, Rs` computes `Rd = -Rs` in a single Thumb instruction."
---

# One instruction flips the sign

Plenty of chips negate a number by subtracting it from zero. Thumb skips all that
with `neg Rd, Rs`, meaning `Rd = -Rs` — one instruction that flips the sign
without ever materializing a zero.

Say some function takes two `int`s and returns the negation of the **second** one.
It compiles down to this:

```asm
neg	r0, r1
bx	lr
```

So `Rs` is `r1`, the second argument, and `Rd = -Rs` settles into `r0`, ready to
hand back.

You will meet this habit constantly: where a dedicated instruction exists, agbcc
reaches for it rather than building the operation out of smaller pieces, and
learning to recognize those idioms is honestly most of the work.

Run `Rd = -Rs` against the target and the C expression you need falls right out.

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
