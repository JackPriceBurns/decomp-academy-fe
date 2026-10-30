---
id: 0e9a9b8f-4a7d-40ec-ad64-fbab19cfd9f0
slug: gba-numbers-capstone
title: "Capstone: Fixed-Point Motion"
difficulty: 5
concepts:
  - fixed-point
  - rounding
  - control-flow
symbol: func_082c2a44
hints:
  - Read it in three pieces. Instructions 0 to 4 build a rounded Q8 product.
    The `add` at 6 adds it to another value. Instructions 8 to 12 are a clamp
    against `r3`.
  - "Four `s32` in, an `s32` out: a position, a Q8 rate, a whole number of
    steps, and a ceiling. The rounding bias is 128 and the shift is 8."
---

# One frame of movement

This lesson puts the chapter's pieces together. You scale a value by a
fixed-point rate, round the step, and stop the result from going past a limit.
You have already read every piece: a `mul` with an `asr`, a rounding bias, and
a compare. The only new thing is that they all appear together.

Here is a similar function. It scales a damage value down by a Q12 armour
fraction, and it clamps the fraction before using it.

```asm
0        mov       r2, r0
2        mov       r0, #128
4        lsl       r0, #5
6        cmp       r1, r0
8        ble       12 ~>
10       mov       r1, r0
12     ~>sub       r0, r1
14       mul       r0, r2
16       mov       r1, #128
18       lsl       r1, #4
20       add       r0, r1
22       asr       r0, #12
24       bx        lr
```

Read it in pieces. The `mov r2, r0` at the top moves an argument out of `r0`,
so gcc can use that register for something else. You have seen this habit
before. Then `mov #128` and `lsl #5` build 4096, which is 1.0 in Q12 and far
too large for an 8-bit immediate. That 4096 is used twice, so it is worth its
two instructions. It is the bound the `cmp` at 6 tests against, and it is the
value the `sub` at 12 subtracts from.

Memorise the clamp, because it is the compiler's standard form and it does not
look like an `if`. There is no branch around a block. The comparison branches
**over a single `mov`**, and that `mov` runs only when the value needs
correcting. An `if` that assigns one value and a conditional expression that
selects between two both compile to exactly this. You cannot tell them apart,
and either one will match.

The end of the function is the rounded fixed-point scale. It multiplies, adds
half a unit, and shifts down by the number of fractional bits in the format.
Half a unit in Q12 is 2048, which is also too large for an immediate, so it
needs its own `mov`/`lsl` pair.

Notice that the whole function is a leaf. It has a comparison, a multiply and
four instructions that build constants, but not a single `push`. If you write
the same function with `f32`, it pushes `lr` and three callee-saved registers,
and it calls libgcc three times.

Your target has the same parts in a different order and a different format.
Read the four instructions before the `cmp` as one expression. Then read the
branch and the `mov` after it as the clamp.

## Your task

Write `func_082c2a44` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_082c2a44(s32 pos, s32 vel, s32 dt, s32 max) {
    s32 p = pos + ((vel * dt + 128) >> 8);
    if (p > max) p = max;
    return p;
}
```
