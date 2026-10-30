---
id: 0c792e84-25ba-4a43-be05-a040bb6c6806
slug: arithmetic-chain-immediate
title: Mixing Registers and Constants
difficulty: 1
concepts:
  - arithmetic
  - immediates
symbol: func_8031e4b8
hints:
  - "The register instruction combines the two arguments, and the `addiu` applies the constant. Remember that a negative immediate means subtraction."
  - "The whole chain stays in `v0`, with no temporary. The compiler does this on its own, so you only need to write the expression."
---

# A constant added to a register chain

Real expressions often mix both kinds of math: register math between
variables, and immediate math for the constant. Here's `nudge(p, q)` returning
`p - q + 7`:

```asm
subu  v0, a0, a1    # v0 = p - q
addiu v0, v0, 7     # v0 = (p - q) + 7
jr    ra
nop
```

Decode it line by line as before. There is one new detail: this time the
partial result does not go through `t6`. The whole computation stays in `v0`
from the first instruction. The compiler makes these register choices itself,
and they differ from function to function. You never have to *predict* them.
The target shows you which registers IDO picked, and your C will use the same
ones as long as the operations match.

Also remember what the warmup taught: MIPS has no subtract-immediate
instruction. If the constant in a chain is being subtracted, you will see
`addiu` with a negative number. Flip its sign to get the value the C
subtracts.

## Your task

Write `func_8031e4b8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8031e4b8(s32 a, s32 b) {
    return a + b - 12;
}
```
