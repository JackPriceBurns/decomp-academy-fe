---
id: c8bde3ca-0e38-4800-a51c-6959233fb63a
slug: floats-mixes
title: "Weighted Mixes and Midpoints"
difficulty: 3
concepts:
  - floats
  - constants
  - expression-chains
symbol: func_8022f78c
hints:
  - "One `.s` op on the two arguments happens *before* the constant is even ready. Its result is what gets scaled."
  - "Decode the `lui` with the ladder, then read the chain from the bottom up."
---

# Blending two values

Game code is full of expressions that combine two floats with constant
weights, for example for averaging, easing and crossfading. They compile to
exactly what the C says. To read them, trace the chain and decode the
constants. This is `mix25(a, b)`, a 25/75 blend:

```asm
 0:  lui   at, 0x3e80      # 0.25f
 4:  mtc1  at, ft0
 8:  lui   at, 0x3f40      # 0.75f
 c:  mtc1  at, ft2
10:  mul.s ft1, fa0, ft0   # a * 0.25f
14:  nop
18:  mul.s ft3, fa1, ft2   # b * 0.75f
1c:  add.s fv0, ft1, ft3   # summed
20:  jr    ra
24:  nop
```

Things to note:

- **Two constants, one `at`.** The integer scratch register is rebuilt for
  each constant: `lui`, `mtc1`, `lui`, `mtc1`. The FPU keeps both values,
  because only the float side needs them at the same time.
- **The hazard `nop`s are gone.** Other work fills the slot after each
  `mtc1`. The single `nop` at `0x14` is padding after a multiply, which you
  have seen in earlier lessons. By now you can tell the two kinds of padding
  apart by the instructions next to them.
- **`0x3f40` is a ladder value you have not used yet.** It is halfway between
  `0.5f` (`0x3f00`) and `1.0f` (`0x3f80`). The ladder also works between
  steps: a top half exactly between two steps gives the value exactly between
  them.

The target blends its arguments with *equal* weight. It uses one operation
before the constant is applied, instead of two after. Work out the order of
operations from the register flow, then decode the single `lui`.

## Your task

Write `func_8022f78c` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_8022f78c(f32 a, f32 b) {
    return (a + b) * 0.5f;
}
```
