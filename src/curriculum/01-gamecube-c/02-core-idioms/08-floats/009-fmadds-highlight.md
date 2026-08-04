---
id: f195baf0-6958-559f-847a-5daa79da561c
slug: floats-fmadds-highlight
title: ★ Fused Multiply-Add
difficulty: 3
concepts:
  - floating-point
  - fmadds
  - fp-contract
  - highlight
symbol: func_800656e8
hints:
  - With fp_contract on, a multiply feeding an add fuses into one instruction.
  - "`a * b + c` becomes a single `fmadds f1, f1, f2, f3`."
---

# One instruction for multiply-then-add

PowerPC can multiply and add in one shot, rounding only once. It's a fused
multiply-add. Since `fp_contract` is on here, MWCC collapses a multiply that feeds
an add into a single `fmadds`.

Say three `f32` arguments `p`, `q`, `r` arrive in `f1`, `f2`, `f3`:

```asm
fmadds f1, f1, f2, f3   # one rounding, single precision
blr
```

Operand order is the part that bites. `fmadds fD, fA, fC, fB` means
`fD = (fA * fC) + fB`, so `fmadds f1, f1, f2, f3` multiplies `f1` by `f2` and adds
`f3`. The middle two get multiplied; the last is the addend.

Learn to spot this one. Split it into separate `fmuls` and `fadds` and you'll miss a
contracted target; the reverse fails too. The double-precision twin drops the `s`
to become `fmadd`, and the neighbors are `fmsubs` (`a*b - c`), `fnmadds`, and
`fnmsubs`.

Back to the target for `func_800656e8`. Its arguments sit in `f1`, `f2`, `f3`.
Match those to `a`, `b`, `c`, walk the operand order, and you'll know which pair is
multiplied and which value is the addend.

## Your task

Write `func_800656e8` so it compiles to the `fmadds` above. Write it as a plain
expression — let the compiler fuse it.

<!-- solution -->
```c
f32 func_800656e8(f32 a, f32 b, f32 c) {
    return a * b + c;
}
```
