---
id: 9360a8d8-001f-4d10-afc9-e9a8ec392dbd
slug: gba-arithmetic-multiply
title: Multiplying Two Registers
difficulty: 3
concepts:
  - arithmetic
  - multiply
  - registers
symbol: func_080532a0
hints:
  - "`mul` has no three-operand form, so the first factor has to be sitting in
    the destination register before the product can start."
  - "Four `s32` parameters in, an `s32` out. The first one is never used, and
    the product runs left to right beginning with the fourth."
---

# One multiply, no room to spare

The ARM7TDMI has a hardware multiplier, and Thumb gives it exactly one
instruction: `mul rD, rM`, meaning `rD = rD * rM`.

That is the whole encoding. There is no three-operand form to write the product
somewhere else, and no immediate form to multiply by a constant. Both absences
show up in real listings constantly — the first as copies, the second as the
strength-reduced chains coming up in the next few lessons.

Here is `x * y * z` across the first three arguments:

```asm
0        mul       r0, r1
2        mul       r0, r2
4        bx        lr
```

The product accumulates in `r0`, each `mul` overwriting it. Now the same three
factors written in the opposite order, `z * y * x`:

```asm
0        mul       r1, r2
2        mul       r0, r1
4        bx        lr
```

`z * y` is computed in `r1` first, and only then is `x` multiplied in. As with
the addition chains earlier, agbcc has preserved the association: the register
written first held the innermost pair.

A single multiply is different, though. `x * y` and `y * x` compile to the same
`mul r0, r1`, because there is no encoding that could record the swap — with no
three-operand form the operand order simply has nowhere to go. So a lone `mul`
tells you nothing about which factor came first in the source, while a *chain* of
them tells you everything.

When the leftmost factor is not already in `r0`, the copy has to happen before
the multiply can start, and you get a bare `mov r0, rN` at the top. Two rules
constrain that copy: the destination must hold the left operand, and on this core
`mul rD, rD` is not allowed at all — the two register fields have to differ, which
is why squaring a value always costs a second register.

Read your target's first instruction as setup, then follow the accumulator.

## Your task

Write `func_080532a0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_080532a0(s32 a, s32 b, s32 c, s32 d) {
    return d * b * c;
}
```
