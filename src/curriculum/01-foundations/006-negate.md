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

To negate a value PowerPC has a dedicated **`neg rD, rA`** (`rD = -rA`). It does
*not* subtract from a zero register the way some architectures would:

```asm
neg  r3, r3
blr
```

This is your first taste of a recurring theme: MWCC almost always reaches for the
**single dedicated instruction** when one exists, rather than composing the
operation from smaller pieces. Recognizing those idioms is most of the game.

## Your task

Write `negate` to match the target assembly.

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
