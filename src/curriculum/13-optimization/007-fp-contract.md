---
id: optimization-fp-contract
title: "fp_contract: Fused Multiply-Add"
difficulty: 3
concepts:
  - floating-point
  - fp_contract
  - fmadds
symbol: madd
hints:
  - The body is simply `return a*b + c;`.
  - Reordering to `c + a*b` won't dodge fusion — the pragma is what controls the
    split.
  - With contraction off you get `fmuls` then `fadds`; with it on you'd get one
    `fmadds`.
---

# One instruction or two?

The Gekko has a **fused multiply-add**: `fmadds f1, fA, fC, fB` computes
`fA*fC + fB` in a single instruction (and a single rounding step). When
**`fp_contract`** is **on** — our default — MWCC contracts an `a*b + c` pattern
into exactly that:

```asm
fmadds f1, f1, f2, f3   # a*b + c, fused
blr
```

Turn `fp_contract` **off** and the compiler is forbidden from fusing; you get
the multiply and the add as **two** instructions with two roundings:

```asm
fmuls f0, f1, f2        # a*b
fadds f1, f3, f0        # + c
blr
```

This matters constantly in decomp: if a target shows a bare `fmuls` immediately
followed by `fadds` where you expected an `fmadds`, the original translation
unit very likely had `fp_contract` disabled. Reproduce it with the in-code
pragma rather than guessing at a different expression.

> The `#pragma fp_contract off` / `reset` lines are part of both the starter and
> the solution, and apply to the target, so just write the arithmetic body.

## Your task

Write `madd(f32 a, f32 b, f32 c)` so it compiles to the separate `fmuls` and
`fadds` above — not the fused `fmadds`.

<!-- starter -->
```c
#pragma fp_contract off
f32 madd(f32 a, f32 b, f32 c) {
    return 0.0f;
}
#pragma fp_contract reset
```

<!-- solution -->
```c
#pragma fp_contract off
f32 madd(f32 a, f32 b, f32 c) {
    return a*b + c;
}
#pragma fp_contract reset
```
