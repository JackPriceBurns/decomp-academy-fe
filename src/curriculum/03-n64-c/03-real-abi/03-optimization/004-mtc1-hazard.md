---
id: 70e5ab86-65a4-4106-acaf-871aced0c3be
slug: opt-mtc1-hazard
title: "Crossing to the FPU: mtc1 and Its nop"
difficulty: 2
concepts:
  - optimizer
  - floats
  - hazards
  - conversion
symbol: func_800396ac
hints:
  - "One integer instruction runs before anything crosses to the FPU. Read its operands."
  - "The cast in C is one expression — the `mtc1`, the `nop`, and the `cvt` all come from writing it naturally."
---

# int to float is a two-step trip

C lets you write `(f32)x` and move on. The hardware can't: integer registers
and FPU registers are separate banks, and a value crossing between them needs
a ferry instruction *plus* a conversion. Here's `toF(x)`, which returns an
`s32` as an `f32`:

```asm
mtc1    a0, ft0     # raw BITS cross to the FPU — no math yet
nop                 # hazard: the FPU can't touch ft0 next cycle
cvt.s.w fv0, ft0    # convert word → single precision
jr      ra
nop
```

Decode the pieces:

- **`mtc1` is a bit ferry.** "Move to coprocessor 1" copies the 32 raw bits of
  `a0` into `ft0` unchanged. An integer 7 is not the float 7.0 — not until…
- **`cvt.s.w`** — "convert to **s**ingle, from **w**ord" — does the actual
  arithmetic transformation, FPU-side.
- **The `nop` between them is a hazard pad.** A value ferried by `mtc1` isn't
  readable by the very next FPU instruction, and IDO pads the gap rather than
  reordering around it. File the trio — `mtc1`, `nop`, `cvt` — as one unit
  meaning *"an integer became a float here."*

The trip back exists too, and you'll meet it soon: `trunc.w.s` chops a float
to a whole number FPU-side, then `mfc1` ferries the bits out to an integer
register. Same border, opposite direction.

In the target, the integer side does one piece of real work first, and its
result — not a bare argument — makes the crossing. Read the integer
instruction, then the trio.

## Your task

Write `func_800396ac` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_800396ac(s32 a, s32 b) {
    return (f32)(a + b);
}
```
