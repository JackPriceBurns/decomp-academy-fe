---
id: foundations-subtract
title: Subtraction Reverses Its Operands
difficulty: 1
concepts:
  - arithmetic
  - operand-order
symbol: sub2
hints:
  - There's no plain `sub`; subtraction uses `subf`, the subtract-from
    instruction.
  - "`subf r3, r4, r3` computes r3 - r4, i.e. a - b."
---

# The quirk of `subf`

PowerPC has no plain `sub`. Instead it provides **`subf`** — *subtract from* —
with a twist: `subf rD, rA, rB` computes `rD = rB - rA`. The operands are
**reversed** compared to what you might expect.

Consider a different example: `subf r3, r3, r4` — here `rA = r3` and `rB = r4`,
so the result is `r4 - r3`:

```asm
subf r3, r3, r4   # r3 = r4 - r3
blr
```

The target assembly uses a different register arrangement. Apply the same
formula — `rD = rB - rA` — to figure out which C expression matches it.

## Your task

Write `sub2`, taking two `int`s, to reproduce the target assembly.

<!-- starter -->
```c
int sub2(int a, int b) {
    return 0;
}
```

<!-- solution -->
```c
int sub2(int a, int b) {
    return a - b;
}
```
