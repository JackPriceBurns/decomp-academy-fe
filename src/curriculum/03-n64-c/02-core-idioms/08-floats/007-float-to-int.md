---
id: 5183ad34-f6f1-4374-861a-950e1fe57de4
slug: floats-float-to-int
title: "Crossing Back: trunc.w.s and mfc1"
difficulty: 2
concepts:
  - floats
  - conversion
  - trunc
  - mfc1
symbol: func_80060eb4
hints:
  - "The float work happens first, FPU-side; only its result makes the crossing. One `.s` op, then the exit pair."
  - "The whole thing is one cast around one expression."
---

# Floats leave through a different gate

Going int → float was ferry-then-convert. Coming back, the order
flips: convert *first*, on the FPU, then ferry the result out.
Here's `chop(x)`, which truncates an `f32` to `s32`:

```asm
 0:  trunc.w.s ft0, fa0    # float → whole number, still FPU-side
 4:  mfc1      v0, ft0     # ferry the bits out to the integer bank
 8:  nop                   # hazard pad on the way out, too
 c:  jr        ra
10:  nop
```

- **`trunc.w.s`** — *truncate to word, from single* — does the
  arithmetic: it chops toward zero, exactly the semantics of a C cast
  (`(s32)3.9f` is 3, `(s32)-3.9f` is -3). That matching semantics is
  why a bare cast compiles to `trunc` and nothing else.
- **`mfc1`** — move *from* coprocessor 1 — is the return ferry,
  `mtc1`'s mirror. Raw bits out, unchanged, into `v0`.
- The trailing `nop` is the crossing toll again, paid on this side of
  the border this time.

So the two crossings, as reflexes: **`mtc1` + `cvt.s.w` = int in,
`trunc.w.s` + `mfc1` = int out.** Spot either pair and you know a
cast (or silent promotion) sits at that point in the C — one of the
most load-bearing fingerprints in float-heavy game code.

In the target, the cast wraps *computed* float work: one `.s`
operation runs first, and its result — not a bare argument — takes
the exit. Mind what the operation is and what it consumes.

## Your task

Write `func_80060eb4` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80060eb4(f32 a, f32 b) {
    return (s32)(a * b);
}
```
