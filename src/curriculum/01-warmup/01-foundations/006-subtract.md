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

There is no plain `sub` on PowerPC. What you get instead is `subf`, short for
*subtract from*, and it ships with a catch: `subf rD, rA, rB` computes
`rD = rB - rA`. The operands sit in the reverse order from what your gut expects.

Take a worked example, `subf r3, r3, r4`. Here `rA` is `r3` and `rB` is `r4`, so
the answer comes out as `r4 - r3`:

```asm
subf r3, r3, r4   # r3 = r4 - r3
blr
```

Your target wires the registers up differently. Run that same `rD = rB - rA`
formula over it and you will land on the C expression it wants.

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
