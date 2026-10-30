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
  - "`mul` has no three-operand form, so the first factor has to be in the
    destination register before the multiply can start."
  - The function takes four `s32` parameters and returns an `s32`. The first
    one is never used. The product is computed left to right, starting with the
    fourth.
---

# Thumb's one multiply instruction

The ARM7TDMI has a hardware multiplier, and Thumb has exactly one instruction
for it: `mul rD, rM`, which means `rD = rD * rM`.

That is the only encoding. There is no three-operand form that writes the
product to another register, and no immediate form that multiplies by a
constant. You will see the effect of both in real listings all the time. The
missing three-operand form causes extra copies. The missing immediate form
causes the strength-reduced chains that the next few lessons cover.

Here is `x * y * z`, using the first three arguments:

```asm
0        mul       r0, r1
2        mul       r0, r2
4        bx        lr
```

The product builds up in `r0`, and each `mul` overwrites it. Now here are the
same three factors written in the opposite order, `z * y * x`:

```asm
0        mul       r1, r2
2        mul       r0, r1
4        bx        lr
```

`z * y` is computed in `r1` first, and only then is `x` multiplied in. As with
the addition chains earlier, agbcc has kept the grouping from the source: the
register written first held the innermost pair.

A single multiply is different. `x * y` and `y * x` both compile to the same
`mul r0, r1`. With no three-operand form, there is no encoding that could
record the swap. So one `mul` on its own tells you nothing about which factor
came first in the source. A *chain* of them does show you the grouping.

When the leftmost factor is not already in `r0`, it has to be copied there
before the multiply can start. You then get a plain `mov r0, rN` at the top.
Two rules limit that copy. First, the destination must hold the left operand.
Second, on this core `mul rD, rD` is not allowed at all. The two register
fields must name different registers, so squaring a value always needs a second
register.

Read the first instruction of your target as setup. Then follow the running
product.

## Your task

Write `func_080532a0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_080532a0(s32 a, s32 b, s32 c, s32 d) {
    return d * b * c;
}
```
