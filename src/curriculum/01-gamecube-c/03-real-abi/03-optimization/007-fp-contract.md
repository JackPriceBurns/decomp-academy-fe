---
id: d92fc047-457e-56e0-b083-7b138e038aa5
slug: optimization-fp-contract
title: "fp_contract: Fused Multiply-Add"
difficulty: 3
concepts:
  - floating-point
  - fp_contract
  - fmadds
symbol: func_8024bf00
hints:
  - The body is simply `return a*b + c;`.
  - Reordering to `c + a*b` won't dodge fusion — the pragma is what controls the
    split.
  - With contraction off you get `fmuls` then `fadds`; with it on you'd get one
    `fmadds`.
---

# One instruction or two?

The Gekko has a **fused multiply-add**. `fmadds f1, fA, fC, fB` works out
`fA*fC + fB` in one instruction, rounding only once at the end. MWCC reaches for
it whenever **`fp_contract`** is **on**, which is the default here, collapsing a
multiply followed by an add straight into the fused form.

Take `scaleshift(f32 x, f32 scale, f32 offset)`, which scales `x` and tacks on
an offset. Leave `fp_contract` **on** and that's a single op:

```asm
fmadds f1, f1, f2, f3   # x*scale + offset, fused
blr
```

Flip `fp_contract` **off** and fusion is off the table. Now the multiply and the
add land as **two** separate instructions, each rounding its own result:

```asm
fmuls f0, f1, f2        # x*scale
fadds f1, f3, f0        # + offset
blr
```

You hit this all the time in decomp. When a target has a lone `fmuls` butting up
against an `fadds` and you were expecting one `fmadds`, odds are the original
translation unit compiled with `fp_contract` disabled. Match it by dropping in
the pragma instead of contorting the expression to dodge fusion.

> The `#pragma fp_contract off` / `reset` lines belong to both the starter and
> the solution and already wrap the target, so all you supply is the arithmetic
> body.

## Your task

Write `func_8024bf00` so it compiles to the separate `fmuls` and `fadds` above —
not the fused `fmadds`. Look at the function signature to determine what
arithmetic to express.

<!-- starter -->
```c
#pragma fp_contract off
f32 func_8024bf00(f32 a, f32 b, f32 c) {
    return 0.0f;
}
#pragma fp_contract reset
```

<!-- solution -->
```c
#pragma fp_contract off
f32 func_8024bf00(f32 a, f32 b, f32 c) {
    return a*b + c;
}
#pragma fp_contract reset
```
