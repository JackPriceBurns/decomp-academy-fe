---
id: floats-frsp-highlight
title: "★ The Spurious frsp: f32 vs double Helpers"
difficulty: 3
concepts:
  - floating-point
  - types
  - frsp
  - highlight
symbol: halve
hints:
  - A `double` parameter forces double-precision math, then an `frsp` to narrow
    the result.
  - Type the parameter as `f32` and use the `0.5f` literal so the multiply stays
    single precision (`fmuls`, no `frsp`).
---

# Why the parameter type matters

Here is a common decompilation pitfall worth recognizing. When a parameter is
typed as `double` but the function returns `f32`, the compiler performs the
arithmetic in double precision and then must **`frsp`** (round to single
precision) to narrow the result. Consider a helper `scale` that doubles its
argument:

```asm
lfd   f0, ...      # load 2.0 as a *double*
fmul  f1, f0, f1   # double multiply
frsp  f1, f1       # ROUND result back down to single  ← spurious!
blr
```

That is four instructions. Keep the parameter type as `f32` instead, and the
whole computation stays in single precision — the compiler can use `lfs`/`fmuls`
and **no `frsp` is needed**:

```asm
lfs   f0, ...      # load 2.0f from the SDA
fmuls f1, f0, f1   # single-precision multiply
blr
```

The `frsp` disappears because the math was never promoted to double in the first
place. It also pulls in `fmul`/`lfd` instead of `fmuls`/`lfs`, so the whole
instruction mix changes.

**A good default:** for single-precision helpers, keep both parameter and literal
in `f32`. An `f32` parameter with an `f` literal suffix keeps everything single
precision; a `double` parameter (or a literal without an `f`) widens the
computation and inserts a spurious `frsp`.

## Your task

Write `halve` to reproduce the assembly above — with **no `frsp`**.
Match the parameter type and literal suffix to the instructions you see.

<!-- starter -->
```c
f32 halve(double x) {
    // careful: this signature forces a double multiply + frsp
    return x * 0.5;
}
```

<!-- solution -->
```c
f32 halve(f32 x) {
    return x * 0.5f;
}
```
