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
  - "The register instruction combines the two arguments; the `addiu` applies the constant. Remember a negative immediate means subtraction."
  - "Notice the whole chain stays in `v0` — no temporary needed. That happens by itself; just write the expression."
---

# A constant riding on a register chain

Real expressions mix both worlds: register math between variables, immediate
math for the constant. Here's `nudge(p, q)` returning `p - q + 7`:

```asm
subu  v0, a0, a1    # v0 = p - q
addiu v0, v0, 7     # v0 = (p - q) + 7
jr    ra
nop
```

Same line-by-line decode as before, with one new wrinkle worth noticing: this
time the intermediate doesn't detour through `t6` — the whole computation rides
in `v0` from the first instruction. The compiler makes these register choices
itself, and they'll differ from function to function. You never have to *derive*
them; the target shows you exactly which registers IDO picked, and your C will
land in the same ones as long as the operations match.

And keep warmup's lesson close: there is no subtract-immediate on MIPS. If the
constant in a chain is being subtracted, you'll see `addiu` carrying a negative
number. Flip its sign to recover what the C subtracts.

## Your task

Write `func_8031e4b8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8031e4b8(s32 a, s32 b) {
    return a + b - 12;
}
```
