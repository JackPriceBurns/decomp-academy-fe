---
id: 4e06b46d-49f4-4c7b-b903-7ba8325da339
slug: gba-division-pow2-signed
title: Signed Division Needs a Bias
difficulty: 3
concepts:
  - division
  - shifts
  - signedness
symbol: func_080a67bc
hints:
  - The constant added by the skipped instruction is one less than the divisor,
    and the shift amount confirms it.
  - Two `s32` parameters in, an `s32` out. The first is never used. The second is
    divided by 64.
---

# The problem is rounding

An arithmetic right shift also divides, but it rounds the wrong way. `asr`
copies the sign bit into the top bits, so a negative value shifted right rounds
toward negative infinity: -1 shifted right by any amount stays -1. C requires
`/` to truncate toward zero, so -1 divided by 8 is 0.

gcc fixes this by adding a bias, the divisor minus one, to the dividend before
shifting. This raises a negative value just enough for the shift to give the
correct result. A positive value must not get the bias, so the add is protected
by a compare and a branch that jumps over it. Here is a signed value divided by
8:

```asm
0        cmp       r0, #0
2        bge       6 ~>
4        add       r0, #7
6      ~>asr       r0, #3
8        bx        lr
```

That is five instructions, where the unsigned form needs two. Read the four
before the return as one unit: a `cmp` against zero, a `bge` that skips exactly
one `add`, a bias one less than the divisor, and an `asr` whose amount is the
exponent. Whenever that shape appears, the C used `/` on a signed value.

Writing `>>` instead gives a different function for a signed value. It compiles
to only the part after the branch:

```asm
0        asr       r0, #3
2        bx        lr
```

For unsigned values, `/ 8` and `>> 3` compile to the same code. For signed
values they differ by three instructions, so the target tells you which one to
write. With a signed dividend, the bias sequence can only come from `/`, and an
`asr` on its own can only come from `>>`.

Here is the unsigned version of the same function, which has the shape from the
last lesson:

```asm
0        lsr       r0, #3
2        bx        lr
```

These three short functions give three different listings. From any of them you
can recover both the operator that was written and the signedness of the
dividend.

Your target runs the bias sequence in a register other than `r0`, which changes
the form of the last instruction. Read the bias constant to get the divisor,
then work out which value is being divided.

## Your task

Write `func_080a67bc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_080a67bc(s32 a, s32 b) {
    return b / 64;
}
```
