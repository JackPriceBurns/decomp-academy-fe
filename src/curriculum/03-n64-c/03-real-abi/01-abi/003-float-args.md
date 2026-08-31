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
  - "One `.s` instruction does all the work — its mnemonic names the operation."
  - "Operand order matters on the FPU exactly like it does on the integer side."
---

# The FPU has its own argument registers

Floating-point values never ride in `a0`–`a3`. They travel on the FPU, in its
own bank of registers — and just like the integer side, the o32 convention gives
those registers job-based names. The first two `f32` arguments arrive in **`fa0`
and `fa1`**, and a float return value leaves in **`fv0`**. (In hardware terms
those are `$f12`, `$f14`, and `$f0` — you'll see the raw numbers in other
people's notes, but the diff always shows the friendly names.)

Here's `mixF(a, b)`, which computes `a * b + a`:

```asm
mul.s  ft0, fa0, fa1   # a * b
add.s  fv0, ft0, fa0   # (a * b) + a
jr     ra
nop
```

Read it exactly like integer code, with two substitutions:

- The `.s` suffix means **single precision** — these are `f32` operations.
  (`.d`, for `f64`, exists too; it comes later.)
- `ft0`, `ft1`, … are the FPU's **t**emporaries, the float cousins of `t6` and
  friends.

Same destination-first operand order, same chain-reading technique. The FPU is
not a strange land — it's the same grammar with an `f` in front.

The target is a single `.s` operation. Read its mnemonic and its operand
order, and you have the function.

## Your task

Write `func_8000315c` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_8000315c(f32 x, f32 y) {
    return x - y;
}
```
