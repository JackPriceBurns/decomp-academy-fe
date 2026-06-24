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
gives **`cmpwi`**, an unsigned operand gives **`cmplwi`**:

```asm
cmpwi r3, 5       # signed immediate compare against a literal
li    r3, 9       # speculative load
blelr-            # conditional return
li    r3, 7       # fall-through value
blr
```

The unsigned twin (`u32 a`) would use **`cmplwi r3, 5`** in line one, and
everything else is the same shape. Same rule as the register compares: the
operand's *type*, not the constant, chooses the opcode.

To read the pattern: the immediate in `cmpwi` is the comparison constant; the
branch mnemonic encodes the early-exit condition; and the two `li` values are
the two possible return values. The speculative load (before the branch)
corresponds to the arm that exits via the branch, and the fall-through `li`
corresponds to the opposite arm.

## Your task

Write `over_five`, taking a signed `int`, to reproduce the assembly above.

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
