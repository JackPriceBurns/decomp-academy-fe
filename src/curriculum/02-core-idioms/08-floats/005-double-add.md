---
id: floats-double-add
title: Doubles Drop the 's'
difficulty: 2
concepts:
  - floating-point
  - double-precision
  - types
symbol: add_d
hints:
  - Double precision drops the `s` suffix.
  - "`a + b` on f64 becomes `fadd f1, f1, f2`."
---

# `f64` is double precision

A `f32` is single precision; an `f64` (`double`) is **double precision**, and the
hardware has a parallel set of instructions *without* the trailing `s`. The same
`a + b`, typed as `f64`, compiles to `fadd` instead of `fadds`:

```asm
fadd f1, f1, f2    # f1 = a + b, double precision
blr
```

So `fadd`/`fmul`/`fsub`/`fdiv` are the double-precision forms, and
`fadds`/`fmuls`/`fsubs`/`fdivs` are single. **The presence or absence of that one
letter tells you the operand type** — which is exactly the kind of clue you use
to recover the original C declarations.

## Your task

Write `add_d` to compile to the `fadd` above.

<!-- starter -->
```c
f64 add_d(f64 a, f64 b) {
    return 0.0;
}
```

<!-- solution -->
```c
f64 add_d(f64 a, f64 b) {
    return a + b;
}
```
