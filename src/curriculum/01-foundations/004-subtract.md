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

PowerPC has no plain `sub`. To compute `a - b` it uses **`subf`** — *subtract
from* — which computes `rD = rB - rA`. The operands are **reversed**:

```asm
subf r3, r4, r3   # r3 = r3 - r4  =  a - b
blr
```

So `subf r3, r4, r3` subtracts `r4` from `r3`, leaving `a - b` in `r3`. Once you
internalize that `subf rD, rA, rB` computes `rB - rA`, the disassembly stops
looking backwards.

## Your task

Write `sub2` to reproduce the `subf` assembly above.

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
