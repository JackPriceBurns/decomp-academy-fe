---
id: ac2061be-41d8-542d-8be3-5b71a1e343cf
slug: floats-double-add
title: Doubles Drop the 's'
difficulty: 2
concepts:
  - floating-point
  - double-precision
  - types
symbol: func_80308184
hints:
  - Double precision drops the `s` suffix.
  - "`a + b` on f64 becomes `fadd f1, f1, f2`."
---

# `f64` is double precision

Single precision is `f32`. Double precision is `f64`, the C `double`, and the
hardware mirrors every float op in a second flavor without the trailing `s`. So
`a + b` on `f64` operands lands on `fadd`, not `fadds`:

```asm
fadd f1, f1, f2    # f1 = a + b, double precision
blr
```

`fadd`/`fmul`/`fsub`/`fdiv` handle doubles; `fadds`/`fmuls`/`fsubs`/`fdivs` handle
singles. One letter pins down the operand type. That little difference is gold when
rebuilding the original C declarations from disassembly.

## Your task

Write `func_80308184` to compile to the `fadd` above.

<!-- solution -->
```c
f64 func_80308184(f64 a, f64 b) {
    return a + b;
}
```
