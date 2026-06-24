---
id: advanced-psq-callee-save
title: Paired-Single FPR Saves in the Prologue
difficulty: 4
concepts:
  - paired-singles
  - psq_st
  - callee-save
  - prologue
  - floats
symbol: mix
hints:
  - Each float local must survive a `bl transform`, so it lands in a
    callee-saved FPR (f31, f30, ...).
  - Every saved FPR shows up as an `stfd`/`psq_st` pair in the prologue and a
    `psq_l`/`lfd` pair in the epilogue.
---

# Why a float function stores 64 + 32 bits per register

The Gekko's floating-point registers `f14`–`f31` are **callee-saved**: a
function that keeps live float values across a call must preserve them and
restore them before returning. What's surprising is *how* MWCC saves each one —
not one store, but **two**:

```asm
stwu   r1, -96(r1)
mflr   r0
stw    r0, 100(r1)
stfd   f31, 80(r1)        # save the 64-bit double view of f31...
psq_st f31, 88(r1), 0, 0  # ...AND the paired-single (two 32-bit) view
stfd   f30, 64(r1)
psq_st f30, 72(r1), 0, 0
...
```

Each callee-saved FPR gets an `stfd` (store float double) **paired with a**
`psq_st` (*store paired-single quantized*). The Gekko can hold **two packed
32-bit floats** in one FPR, and `stfd` alone would only preserve the
double-precision lane — so MWCC emits the `psq_st` to guarantee both
paired-single halves survive too. The epilogue mirrors it exactly:
`psq_l` then `lfd` for each register, highest-numbered first.

When you see a prologue full of `stfd`/`psq_st` pairs climbing `f31, f30,
f29...`, that's just **callee-saved float registers** — the function is
float-heavy enough to spill them. You match it by writing C with enough live
`f32` values across calls; the saves fall out automatically.

## Your task

Write `mix(f32 *p)`: call the provided `transform` on `p[0]..p[5]` into six
locals `a, b, c, d, e, g` (we skip the name `f` so it isn't confused with the
`f32` type), then `return a*b + c*d + e*g + a*c + b*d + e*a;`. Holding six float
results across six calls forces several callee-saved FPRs — watch the
`psq_st`/`stfd` pairs appear in the prologue.

<!-- starter -->
```c
f32 mix(f32 *p) {
    return 0.0f;
}
```

<!-- solution -->
```c
f32 mix(f32 *p) {
    f32 a = transform(p[0]);
    f32 b = transform(p[1]);
    f32 c = transform(p[2]);
    f32 d = transform(p[3]);
    f32 e = transform(p[4]);
    f32 g = transform(p[5]);
    return a*b + c*d + e*g + a*c + b*d + e*a;
}
```

<!-- context -->
```c
extern f32 transform(f32);
```
