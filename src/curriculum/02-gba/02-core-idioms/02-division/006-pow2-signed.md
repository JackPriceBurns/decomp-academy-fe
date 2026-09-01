---
id: 4e06b46d-49f4-4c7b-b903-7ba8325da339
slug: gba-division-pow2-signed
title: Signed Needs a Nudge First
difficulty: 3
concepts:
  - division
  - shifts
  - signedness
symbol: func_080a67bc
hints:
  - The constant added by the skipped instruction is one less than the divisor,
    and the shift amount confirms it.
  - Two `s32` parameters in, an `s32` out. The first is never used; the second is
    divided by 64.
---

# Rounding is the whole problem

An arithmetic right shift divides too, and it is the wrong division. `asr`
copies the sign bit down from the top, so a negative value shifted right rounds
toward negative infinity: -1 shifted right by any amount stays -1. C requires
`/` to truncate toward zero, so -1 divided by 8 is 0.

gcc fixes the gap by adding the divisor minus one to the dividend before
shifting, which pushes a negative value up far enough to land on the correct
side. A positive value must not get that treatment, so the add is guarded by a
compare and a branch that jumps over it. Dividing a signed value by 8:

```asm
0        cmp       r0, #0
2        bge       6 ~>
4        add       r0, #7
6      ~>asr       r0, #3
8        bx        lr
```

Five instructions where the unsigned form needs two. Read the four in front of
the return as a unit: a `cmp` against zero, a `bge` that skips exactly one
`add`, a bias one less than the divisor, and an `asr` whose amount is the
exponent. Whenever that shape appears, the C said `/` on a signed value.

The `>>` spelling of the same idea is a different function here, and it compiles
to exactly the part after the branch:

```asm
0        asr       r0, #3
2        bx        lr
```

For unsigned values `/ 8` and `>> 3` are indistinguishable; for signed values
they are three instructions apart, and the target tells you which one to write.
Once you have a signed dividend the bias sequence is the only correct reading of
`/`, and a bare `asr` is the only correct reading of `>>`.

And the unsigned version of the same function, back to the shape from the last
lesson:

```asm
0        lsr       r0, #3
2        bx        lr
```

Three short functions, three different listings. Both the operator that was
written and the signedness of the dividend are recoverable from any of them.

Your target runs the bias sequence somewhere other than `r0`, which changes the
last instruction's shape. Read the bias constant to get the divisor, then work
out which value is being divided.

## Your task

Write `func_080a67bc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_080a67bc(s32 a, s32 b) {
    return b / 64;
}
```
