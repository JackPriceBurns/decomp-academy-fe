---
id: optimization-fp-cse-contract
title: "Chaining: A Reused Product Inside a Fused Multiply-Add"
difficulty: 4
concepts:
  - cse
  - fp_contract
  - floating-point
  - chaining
symbol: fmix
hints:
  - A single `fmuls` standing in for a product that appears twice is CSE; the
    `fmadds` that follows reads that one result as **both** its multiplicand and
    its addend.
  - The same register appearing in two operand slots of the `fmadds` is the tell
    that one value is being reused, not two different ones computed.
---

# CSE in the floating-point unit

CSE is not just an integer trick. When the **same product** appears more than
once in a float expression, `-O4` computes it a single time — and then
`fp_contract` (lesson 7) folds the surrounding multiply-and-add into one
`fmadds`. The striking result: a value that the source uses twice ends up living
in **one** register that the `fmadds` reads in two of its operand slots.

This is the reading skill to build here. An `fmadds fD, fA, fC, fB` computes
`fA*fC + fB`. If you see the *same* register in the `fA`/`fC`/`fB` slots, that
register is a reused subexpression — CSE put it there once and the contraction
consumed it.

Consider `ramp(f32 s, f32 g)` — it squares `s`, then returns that square plus the
square scaled by `g`:

```asm
fmuls  f0, f1, f1      # s*s computed ONCE (the square is the reused product)
fmadds f1, f2, f0, f0  # g*(s*s) + (s*s)   — f0 reused in two slots, fused
blr
```

Only one `fmuls`: the square `s*s` is shared, so CSE emits it once into `f0`.
Then `fmadds f1,f2,f0,f0` is `g * f0 + f0` — the same `f0` is both the
multiplicand and the addend, and the whole `× + ` collapses into one fused
instruction. Two transforms, two instructions, for what reads as four operations
in C.

Your `fmix` reuses a product the same way, but it is a product of **two distinct
arguments** rather than a square, and a **third** argument supplies the scale.
Read which register repeats across the `fmadds` operands to see which
subexpression was shared.

## Your task

Write `fmix(f32 a, f32 b, f32 c)` to reproduce the target assembly — a single
`fmuls` for the shared product, then one `fmadds` that reuses it in two operand
slots.

<!-- starter -->
```c
f32 fmix(f32 a, f32 b, f32 c) {
    return 0.0f;
}
```

<!-- solution -->
```c
f32 fmix(f32 a, f32 b, f32 c) {
    return a*b*c + a*b;
}
```
