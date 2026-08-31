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
  - "Decode the `lui` with the ladder, then read the chain bottom-up."
---

# Blending two values

Averaging, easing, crossfading — game code is full of expressions
that combine two floats with constant weights. They compile to
exactly what they say, and reading them is chain-tracing plus
constant-decoding. Here's `mix25(a, b)`, a 25/75 blend:

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

Notes worth keeping:

- **Two constants, one `at`.** The integer scratch register rebuilds
  itself for each ferry — `lui`, `mtc1`, `lui`, `mtc1` — while the
  FPU keeps both passengers. Only the float side needs the values
  simultaneously.
- **The hazard `nop`s dissolved.** Both ferries got covered by other
  work; the lone `nop` at `0x14` is the mul-adjacency pad, not a
  ferry toll. By now you can tell the pads apart by their neighbors.
- **`0x3f40` is a ladder stop you haven't used**: halfway between
  `0.5f` (`0x3f00`) and `1.0f` (`0x3f80`). The ladder interpolates —
  a top half exactly between two rungs is the value exactly between
  them.

The target blends its arguments with *equal* weight — and does it
with one operation before the constant is applied, not two after.
Read the order of operations off the register flow, then decode the
single `lui`.

## Your task

Write `func_8022f78c` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_8022f78c(f32 a, f32 b) {
    return (a + b) * 0.5f;
}
```
