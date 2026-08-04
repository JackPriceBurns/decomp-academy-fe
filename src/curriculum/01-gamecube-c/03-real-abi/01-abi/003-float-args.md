---
id: 04a99c83-ea0d-59bc-a87c-55d0cf61bb3f
slug: abi-float-args
title: Floats Use Their Own Registers
difficulty: 1
concepts:
  - calling-convention
  - floating-point
  - registers
symbol: func_8012a670
hints:
  - Float arguments arrive in f1, f2, f3; the float result returns in f1.
  - Single-precision add is `fadds`; expect two of them, ending in f1.
---

# A separate file for floating point

Floats don't borrow the `r3`–`r10` integer registers; they get a bank of their own.
The first eight `float` or `double` arguments ride in `f1` through `f8`, and a
floating-point result comes back in `f1`.

For single-precision `f32` work, use the `...s` ("single") forms. Subtract one
`f32` from another and it collapses to a lone `fsubs`:

```asm
fsubs  f1,f1,f2
blr
```

That's `fsub2(f32 a, f32 b) { return a - b; }`. The difference ends up in `f1`,
the float return register — the float-side counterpart to `r3`.

Add a third `f32` and `f3` carries it. Now there are two operations, so the
compiler grabs a scratch register to hold the intermediate, reaching first for
`f0`, which is caller-saved. Two instructions later, the final value is back in
`f1`.

The target for `func_8012a670` is two `fadds` in a row. Follow the registers through
both to see which operands each folds together, and what single C expression
compiles down to that pair.

## Your task

Write `func_8012a670` to match the target assembly.

<!-- solution -->
```c
f32 func_8012a670(f32 a, f32 b, f32 c) {
    return a + b + c;
}
```
