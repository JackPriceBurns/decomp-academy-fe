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
  - Read it in three pieces. Instructions 0 to 4 build a rounded Q8 product,
    the `add` at 6 accumulates it into something, and 8 to 12 are a clamp
    against `r3`.
  - "Four `s32` in, an `s32` out. A position, a Q8 rate, a whole-number count
    of steps, and a ceiling; the rounding bias is 128 and the shift is 8."
---

# One frame of movement

This is the shape the chapter has been heading toward: scale a value by a
fixed-point rate, round the step, and refuse to cross a limit. Every piece is
something you have already read — a `mul` with an `asr`, a rounding bias, a
compare — and the only new thing is that they arrive at once.

Here is a relative: a damage figure scaled down by a Q12 armour fraction, with
the fraction clamped before it is used.

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

Read it in pieces. The `mov r2, r0` at the top is gcc moving an argument out of
`r0` so it can use that register for something else, a habit you have seen
before. Then `mov #128` and `lsl #5` build 4096, which is 1.0 in Q12 and far
too wide for an 8-bit immediate. That 4096 earns its two instructions twice
over: it is the bound the `cmp` at 6 tests against, and it is the value the
`sub` at 12 subtracts from.

The clamp is the part to memorise, because it is the compiler's standard form
and it does not look like an `if`. There is no branch around a block: the
comparison branches **over a single `mov`**, and that `mov` runs only in the
case that needs correcting. An `if` that assigns one thing and a conditional
expression that selects between two compile to exactly this, so you cannot tell
them apart and either will match.

The tail is the rounded fixed-point scale: multiply, add half a unit, shift
down by the width of the format. Half a unit in Q12 is 2048, which is also too
wide for an immediate, so it costs its own `mov`/`lsl` pair.

Notice that the whole thing is a leaf. A comparison, a multiply, four
instructions of constant building, and not one `push`. Write the same function
in `f32` and it pushes `lr` and three callee-saved registers and calls into
libgcc three times.

Your target holds the same ingredients in a different order and a different
format. Read the four instructions before the `cmp` as one expression, then read
the branch and the `mov` after it as the clamp.

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
