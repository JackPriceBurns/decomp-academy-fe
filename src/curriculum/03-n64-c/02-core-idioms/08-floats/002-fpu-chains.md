---
id: c52e969d-fb9b-4ab0-a7db-bd2f4cefcefb
slug: floats-fpu-chains
title: "Chains, ft0, and the mul.s nop"
difficulty: 1
concepts:
  - floats
  - fpu
  - expression-chains
symbol: func_8014ba58
hints:
  - "Two `.s` ops, one feeding the other through `ft0`. Read them from the bottom up, like any integer chain."
  - "The second instruction reuses one of the original *arguments*, not the intermediate result. Check which register is in each operand position."
---

# Two ops, one temporary

Longer float expressions chain through the `ft` temporaries in the same way
that integer expressions chain through `t6` and the other temporaries. This is
`blend(a, b)`, which computes `(a + b) * a`:

```asm
add.s  ft0, fa0, fa1   # ft0 = a + b
mul.s  fv0, ft0, fa0   # fv0 = (a + b) * a
nop
jr     ra
nop
```

Read it from the bottom up, as before. The returned value is a `mul.s` of
`ft0` and `fa0`. `ft0` is an `add.s` of the two arguments. Substitute one into
the other and you have the expression. Note that the second operand of the
multiply is `fa0`, the *argument*, so that argument is used twice. Which
register appears in which position is the only difference between
`(a + b) * a` and `(a + b) * b`.

The `nop` before `jr ra` is a **hardware workaround**, separate from normal
instruction scheduling. This console's CPU has a known bug when a multiply is
too close to certain instructions, so the assembler pads a `mul.s` that comes
right before a return. `add.s`, `sub.s` and even `div.s` in the same position
get no padding. A single `nop` between a `mul.s` and `jr ra` is *expected*.
Count it, but don't look for a meaning in it. You will see this padding many
times in the game.

The full set of `.s` arithmetic instructions is `add.s`, `sub.s`, `mul.s` and
**`div.s`**. Unlike integer division, `div.s` does not use HI/LO or need any
extra steps. It is hardware float division in one instruction. It is slow, but
it does the whole job.

The target chains two `.s` operations. Work out which one feeds the other, and
which argument appears twice.

## Your task

Write `func_8014ba58` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_8014ba58(f32 a, f32 b) {
    return (a - b) / b;
}
```
