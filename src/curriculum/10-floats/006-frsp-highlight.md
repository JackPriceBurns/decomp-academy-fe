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

Here is a common decompilation pitfall worth recognizing. Suppose the target is a
small single-precision helper:

```asm
lfs   f0, ...      # load 0.5f
fmuls f1, f0, f1   # x * 0.5f
blr
```

Three instructions. Now watch what happens if you write the helper taking a
`double` and returning a `float` — `f32 fn(double x){ return x * 0.5; }`:

```asm
lfd   f0, ...      # load 0.5 as a *double*
fmul  f1, f0, f1   # double multiply
frsp  f1, f1       # ROUND result back down to single  ← spurious!
blr
```

The compiler did the math in double precision, then had to **`frsp`** (round to
single precision) to produce the `f32` return value. That extra `frsp` — and the
`fmul`/`lfd` instead of `fmuls`/`lfs` — will never match a target built from a
clean single-precision helper.

**A good default:** for single-precision helpers, write `f32 fn(f32)` rather than
`f32 fn(double)` (or `double fn(double)`). Keeping everything in `f32` keeps the math single
precision and the `frsp` disappears.

## Your task

Write `halve` to reproduce the assembly above — with **no `frsp`**.
Use `f32` throughout and the `0.5f` literal (note the `f` suffix).

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
