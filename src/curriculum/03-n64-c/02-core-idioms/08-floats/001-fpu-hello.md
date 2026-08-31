---
id: 3ed96035-b9f6-47ae-b792-6a7f8ff99c5b
slug: floats-fpu-hello
title: "Welcome to the FPU"
difficulty: 1
concepts:
  - floats
  - fpu
  - abi
symbol: func_803b6580
hints:
  - "One `.s` instruction does everything — its mnemonic names the operation, and the operands are destination-first as always."
  - "Both arguments arrive on the FPU already; you never touch `a0` in a float-in, float-out function."
---

# A second register file

Floating-point math doesn't happen in `v0` and `a0`. The console
carries a **floating-point unit** — coprocessor 1 — with its *own*
bank of 32 registers, and float values live their whole lives over
there. Like the integer side, the registers go by job names:

- **`fa0`, `fa1`** — the first two `f32` **a**rguments.
- **`fv0`** — the float return **v**alue.
- **`ft0`, `ft1`, …** — float **t**emporaries, burned freely.

(In hardware terms those are `$f12`, `$f14`, `$f0`, `$f4`… — you'll
meet the raw numbers in other people's notes, but the diff always
shows the friendly names.)

Here's `dampF(a, b)`, which returns `a - b`:

```asm
sub.s  fv0, fa0, fa1   # fv0 = a - b
jr     ra
nop
```

Read it exactly like integer code with two substitutions. The **`.s`
suffix** means *single precision* — an `f32` operation (`.d`, for
`f64`, arrives later in the chapter). And the operands are FPU
registers — but the grammar is identical: destination first, then the
inputs, in source order. `sub.s fv0, fa0, fa1` is `fa0 - fa1`, order
mattering just as much as integer `subu`.

One thing you *won't* see: any `a0` or `v0`. A function whose inputs
and output are all floats never touches the integer bank at all —
argument passing, math, and return all stay on the FPU side. When the
two worlds do need to talk, there's a border crossing with its own
toll; a few lessons from now.

The target is a single `.s` operation on the two arguments. Its
mnemonic is the function.

## Your task

Write `func_803b6580` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_803b6580(f32 a, f32 b) {
    return a + b;
}
```
