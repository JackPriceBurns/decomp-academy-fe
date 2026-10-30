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
  - "One `.s` instruction does all the work. Its mnemonic names the operation, and the operands are destination first, as always."
  - "Both arguments already arrive on the FPU. A function that takes floats and returns a float never touches `a0`."
---

# A second register file

Floating-point math does not happen in `v0` and `a0`. The console has a
**floating-point unit** (FPU), also called coprocessor 1. It has its *own*
bank of 32 registers, and float values stay in those registers the whole
time. As on the integer side, the registers are named after their jobs:

- **`fa0`, `fa1`**: the first two `f32` **a**rguments.
- **`fv0`**: the float return **v**alue.
- **`ft0`, `ft1`, …**: float **t**emporaries, which the compiler uses freely.

(In hardware terms these are `$f12`, `$f14`, `$f0`, `$f4` and so on. You will
see the raw numbers in other people's notes, but the diff always shows the
job names.)

This is `dampF(a, b)`, which returns `a - b`:

```asm
sub.s  fv0, fa0, fa1   # fv0 = a - b
jr     ra
nop
```

Read it like integer code, with two differences. First, the **`.s` suffix**
means *single precision*, so this is an `f32` operation. (`.d`, for `f64`,
comes later in the chapter.) Second, the operands are FPU registers. The
operand order is the same as before: destination first, then the inputs in
source order. So `sub.s fv0, fa0, fa1` computes `fa0 - fa1`, and the order
matters just as much as it does for integer `subu`.

You *won't* see any `a0` or `v0` here. A function whose inputs and output are
all floats never uses the integer registers. The arguments, the math and the
return value all stay on the FPU. When values do need to move between the
integer side and the FPU, that takes extra instructions. You will see them a
few lessons from now.

The target is a single `.s` operation on its arguments. The mnemonic tells
you what the function does.

## Your task

Write `func_803b6580` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_803b6580(f32 a, f32 b) {
    return a + b;
}
```
