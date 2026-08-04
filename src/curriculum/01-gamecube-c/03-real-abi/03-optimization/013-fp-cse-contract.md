---
id: 679d5f5a-547c-5490-b237-ce7680734456
slug: optimization-fp-cse-contract
title: "Chaining: A Reused Product Inside a Fused Multiply-Add"
difficulty: 4
concepts:
  - cse
  - fp_contract
  - floating-point
  - chaining
symbol: func_801e757c
hints:
  - A single `fmuls` standing in for a product that appears twice is CSE; the
    `fmadds` that follows reads that one result as **both** its multiplicand and
    its addend.
  - The same register appearing in two operand slots of the `fmadds` is the tell
    that one value is being reused, not two different ones computed.
---

# CSE in the floating-point unit

CSE isn't only an integer trick. Let the **same product** show up twice in a
float expression and `-O4` evaluates it just once, after which `fp_contract`
(lesson 7) wraps the multiply-and-add around it into a single `fmadds`. What you
end up with is neat: a value the source mentions twice lives in **one** register,
and the `fmadds` reads that register in two of its operand slots.

Here's the reading skill to pick up. An `fmadds fD, fA, fC, fB` computes
`fA*fC + fB`. Spot the *same* register filling two of the `fA`/`fC`/`fB` slots
and you're looking at a reused subexpression; CSE wrote it once, and the
contraction swallowed it.

Square a float and reuse the square, and you can watch this play out.
`ramp(f32 s, f32 g)` does just that. It squares `s`, then gives back the square
plus a `g`-scaled copy of the same square:

```asm
fmuls  f0, f1, f1      # s*s computed ONCE (the square is the reused product)
fmadds f1, f2, f0, f0  # g*(s*s) + (s*s)   — f0 reused in two slots, fused
blr
```

Notice the lone `fmuls`. The square `s*s` is shared, so CSE lays it into `f0` just
once. Then `fmadds f1,f2,f0,f0` evaluates `g * f0 + f0`, where `f0` is the
multiplicand and the addend at the same time — exactly what lets the multiply and
add fuse. Four operations in the C, two instructions on the chip.

Your `func_801e757c` recycles a product the same way, except the product is of
**two distinct arguments** instead of a square, and a **third** argument does the
scaling. Watch for the register that repeats across the `fmadds` operands; that's
the subexpression being shared.

## Your task

Write `func_801e757c` to reproduce the target assembly — a single `fmuls` for the
shared product, then one `fmadds` that reuses it in two operand slots.

<!-- solution -->
```c
f32 func_801e757c(f32 a, f32 b, f32 c) {
    return a*b*c + a*b;
}
```
