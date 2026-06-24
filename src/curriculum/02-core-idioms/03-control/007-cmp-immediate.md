---
id: control-cmp-immediate
title: "Comparing Against a Constant: cmpwi vs cmplwi"
difficulty: 3
concepts:
  - comparison
  - immediates
  - signed
  - unsigned
  - types
symbol: over_five
hints:
  - Comparing against a constant uses an immediate compare.
  - A signed `int` gives `cmpwi r3, 5`; a `u32` would give `cmplwi`.
---

# Constant compares get the immediate forms

Comparing against a literal folds the constant into the instruction, just like
arithmetic immediates. And the signed/unsigned split persists: a signed `int`
gives **`cmpwi`**, an unsigned operand gives **`cmplwi`**.

A signed `if (a > 5)` returning two values:

```asm
cmpwi r3, 5       # signed immediate compare
li    r3, 9
blelr-            # a <= 5 -> return 9
li    r3, 7
blr
```

The unsigned twin (`u32 a`) is the same shape with **`cmplwi r3, 5`** in line
one. Same rule as the register compares: the operand's type, not the constant,
chooses the opcode. Keep typing your locals and fields to the real field width
and the right immediate compare falls out automatically.

## Your task

Write `over_five` taking a signed `int`: return `7` if `a > 5`, otherwise `9`.

<!-- starter -->
```c
int over_five(int a) {
    return 0;
}
```

<!-- solution -->
```c
int over_five(int a) {
    if (a > 5) return 7;
    return 9;
}
```
