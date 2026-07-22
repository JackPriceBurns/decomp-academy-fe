---
id: 7e04043e-b1e1-5b45-9f89-2315c1c62448
slug: advanced-psq-callee-save
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

FPRs `f14`–`f31` are callee-saved on the Gekko. If a function holds float
values live across a call, it has to stash them somewhere safe and put them
back before returning. The odd part is what MWCC does to save one. It writes
the register out *twice*.

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

Why twice? A Gekko FPR can hold **two packed 32-bit floats**, not just a
double. An `stfd` (store float double) only preserves the double-precision
lane, so it would quietly drop the second paired-single half. MWCC covers
itself by following every `stfd` with a `psq_st` (store paired-single
quantized), which writes both 32-bit halves. The epilogue runs the same
pairing backwards, `psq_l` then `lfd`, restoring the highest-numbered register
first.

So a prologue that marches `stfd`/`psq_st` up through `f31, f30, f29...` isn't
doing anything exotic. Those are callee-saved float registers, spilled because
the function juggles enough floats at once. Write C that keeps enough `f32`
values alive across calls and the saves appear on their own.

## Your task

Write `mix(f32 *p)`: call the provided `transform` on `p[0]..p[5]` into six
locals — skip the name `f` so it isn't confused with the `f32` type — then
combine those locals into a return value. Holding six float results live
across six calls forces several callee-saved FPRs — watch the
`psq_st`/`stfd` pairs appear in the prologue. Use the `fmadds`/`fmuls`/`fadds`
instructions in the epilogue to reconstruct which products are added together.

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
