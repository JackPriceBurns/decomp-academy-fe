---
id: bcc4a979-8953-59c5-9855-55255db9bcfd
slug: foundations-subtract
title: Subtraction Reverses Its Operands
difficulty: 1
concepts:
  - arithmetic
  - operand-order
symbol: func_803312a4
hints:
  - There's no plain `sub`; subtraction uses `subf`, the subtract-from
    instruction.
  - "`subf r3, r4, r3` computes r3 - r4, i.e. a - b."
---

# The quirk of `subf`

There is no plain `sub` on PowerPC. What you get instead is `subf`, short for
*subtract from*, and the catch is this: `subf rD, rA, rB` computes
`rD = rB - rA`. The operands sit in the reverse order from what your gut expects.

Take `subf r3, r3, r4`. Here `rA` is `r3` and `rB` is `r4`, so the answer comes
out as `r4 - r3`:

```asm
subf r3, r3, r4   # r3 = r4 - r3
blr
```

Your target wires the registers up differently. Run that same `rD = rB - rA`
formula over it and you'll land on the C expression it wants.

## Your task

Write `func_803312a4` to reproduce the target assembly.

<!-- solution -->
```c
int func_803312a4(int a, int b) {
    return a - b;
}
```
