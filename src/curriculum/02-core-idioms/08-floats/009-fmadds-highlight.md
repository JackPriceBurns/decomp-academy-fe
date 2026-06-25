---
id: floats-fmadds-highlight
title: ★ Fused Multiply-Add
difficulty: 3
concepts:
  - floating-point
  - fmadds
  - fp-contract
  - highlight
symbol: fma3
hints:
  - With fp_contract on, a multiply feeding an add fuses into one instruction.
  - "`a * b + c` becomes a single `fmadds f1, f1, f2, f3`."
---

# One instruction for multiply-then-add

PowerPC has a **fused multiply-add**: it multiplies and adds in a single
rounding step. With `fp_contract` **on** (it is, in this environment), MWCC will
contract a multiply followed by an add into one **`fmadds`** instruction.

Consider three `f32` arguments `p`, `q`, `r` in registers `f1`, `f2`, `f3`:

```asm
fmadds f1, f1, f2, f3   # one rounding, single precision
blr
```

Read the operand order carefully: `fmadds fD, fA, fC, fB` computes
`fD = (fA * fC) + fB`. So in `fmadds f1, f1, f2, f3`, the multiply operands are
`f1` and `f2`, and `f3` is the addend.

This is a key floating-point idiom to recognize. If you write the steps
as separate `fmuls` + `fadds`, you won't match a contracted target — and
vice versa. The double-precision cousin is `fmadd` (no `s`); related forms are
`fmsubs` (`a*b - c`), `fnmadds`, and `fnmsubs`.

Now look at the target assembly above for `fma3`. The argument registers are
`f1`, `f2`, `f3` — map those back to parameters `a`, `b`, `c` and decode the
operand order to find out which two are multiplied and which is added.

## Your task

Write `fma3` taking three `f32`s so it compiles to the `fmadds` above. Write it
as a plain expression — let the compiler fuse it.

<!-- starter -->
```c
f32 fma3(f32 a, f32 b, f32 c) {
    return 0.0f;
}
```

<!-- solution -->
```c
f32 fma3(f32 a, f32 b, f32 c) {
    return a * b + c;
}
```
