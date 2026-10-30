---
id: 70e5ab86-65a4-4106-acaf-871aced0c3be
slug: opt-mtc1-hazard
title: "Moving to the FPU: mtc1 and Its nop"
difficulty: 2
concepts:
  - optimizer
  - floats
  - hazards
  - conversion
symbol: func_800396ac
hints:
  - "One integer instruction runs before anything moves to the FPU. Read its operands."
  - "The cast in C is one expression. The `mtc1`, the `nop` and the `cvt` all come from writing it the natural way."
---

# int to float takes two steps

In C you write `(f32)x` and nothing more. The hardware needs more than that.
Integer registers and FPU registers are separate sets, so moving a value from
one to the other needs a move instruction *plus* a conversion. Here is
`toF(x)`, which returns an `s32` as an `f32`:

```asm
mtc1    a0, ft0     # raw BITS move to the FPU, no math yet
nop                 # hazard: the FPU can't touch ft0 next cycle
cvt.s.w fv0, ft0    # convert word → single precision
jr      ra
nop
```

Here is what each part does:

- **`mtc1` copies bits.** "Move to coprocessor 1" copies the 32 raw bits of
  `a0` into `ft0` unchanged. An integer 7 is not the float 7.0. It becomes one
  only in the next step.
- **`cvt.s.w`** means "convert to **s**ingle, from **w**ord". It does the
  actual arithmetic conversion, on the FPU side.
- **The `nop` between them is a hazard pad.** The very next FPU instruction
  can't read a value that `mtc1` has just moved, and IDO pads the gap instead of
  reordering around it. Treat the three instructions `mtc1`, `nop`, `cvt` as
  one unit that means *"an integer became a float here."*

The opposite direction exists too, and you will meet it soon: `trunc.w.s` cuts
a float down to a whole number on the FPU side, and then `mfc1` moves the bits
out to an integer register.

In the target, the integer side does one piece of real work first, and the
result of that work is what moves to the FPU (instead of an argument as it
arrived). Read the integer instruction, then the three-instruction unit.

## Your task

Write `func_800396ac` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_800396ac(s32 a, s32 b) {
    return (f32)(a + b);
}
```
