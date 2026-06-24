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

Some architectures negate a value by subtracting it from zero. PowerPC instead
provides a dedicated **`neg rD, rA`** instruction (`rD = -rA`). It does the job
in one step without a zero register.

For example, a function that takes two `int`s and returns the negation of the
second one compiles to:

```asm
neg  r3, r4
blr
```

Here `rA = r4` (the second argument) and the result `rD = -rA` lands in `r3`
ready to return.

This is your first taste of a recurring theme: MWCC almost always reaches for
the **single dedicated instruction** when one exists, rather than composing the
operation from smaller pieces. Recognizing those idioms is most of the game.

Apply the formula — `rD = -rA` — to the target assembly to work out which C
expression matches it.

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
