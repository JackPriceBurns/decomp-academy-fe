---
id: 500c5776-f699-4508-925d-29b77e3d1132
slug: abi-float-args
title: "Float Arguments: fa0 and fa1"
difficulty: 1
concepts:
  - abi
  - float-args
  - fpu
symbol: func_8000315c
hints:
  - "One `.s` instruction does all the work. Its mnemonic names the operation."
  - "Operand order matters on the FPU exactly like it does on the integer side."
---

# The FPU has its own argument registers

Floating-point values are not passed in `a0` through `a3`. They go to the FPU,
which has its own bank of registers. As on the integer side, the o32
convention names those registers after their jobs. The first two `f32`
arguments arrive in **`fa0` and `fa1`**, and a float return value goes out in
**`fv0`**. (In hardware terms these are `$f12`, `$f14` and `$f0`. You will see
the raw numbers in other people's notes, but the diff always shows the job
names.)

This is `mixF(a, b)`, which computes `a * b + a`:

```asm
mul.s  ft0, fa0, fa1   # a * b
add.s  fv0, ft0, fa0   # (a * b) + a
jr     ra
nop
```

Read it like integer code, with two differences:

- The `.s` suffix means **single precision**, so these are `f32` operations.
  (`.d`, for `f64`, also exists. It comes later.)
- `ft0`, `ft1`, … are the FPU's **t**emporaries. They do the same job as `t6`
  and the other integer temporaries.

The operands are in the same order as before, destination first, and you read
the chain in the same way. FPU code follows the same rules as integer code,
with an `f` in front of the register names.

The target is a single `.s` operation. Read its mnemonic and its operand
order, and you can write the function.

## Your task

Write `func_8000315c` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_8000315c(f32 x, f32 y) {
    return x - y;
}
```
