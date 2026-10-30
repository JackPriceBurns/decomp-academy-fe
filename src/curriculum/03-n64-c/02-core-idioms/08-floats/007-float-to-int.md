---
id: 5183ad34-f6f1-4374-861a-950e1fe57de4
slug: floats-float-to-int
title: "Converting float to int: trunc.w.s and mfc1"
difficulty: 2
concepts:
  - floats
  - conversion
  - trunc
  - mfc1
symbol: func_80060eb4
hints:
  - "The float work happens first, on the FPU. Only its result moves to the integer side. One `.s` op, then the exit pair."
  - "The whole thing is one cast around one expression."
---

# Float to int uses different instructions

Going from int to float was move, then convert. Going back, the order is
reversed: convert *first*, on the FPU, then move the result out. This is
`chop(x)`, which truncates an `f32` to `s32`:

```asm
 0:  trunc.w.s ft0, fa0    # float → whole number, still FPU-side
 4:  mfc1      v0, ft0     # move the bits out to the integer registers
 8:  nop                   # hazard nop on the way out, too
 c:  jr        ra
10:  nop
```

- **`trunc.w.s`** (*truncate to word, from single*) does the arithmetic. It
  rounds toward zero, which is exactly what a C cast does: `(s32)3.9f` is 3,
  and `(s32)-3.9f` is -3. Because the behaviour matches, a plain cast
  compiles to `trunc` and nothing else.
- **`mfc1`** (move *from* coprocessor 1) is the reverse of `mtc1`. It copies
  the raw bits, unchanged, into `v0`.
- The `nop` at the end is the same hazard `nop` as before, this time after
  the move out of the FPU.

So these are the two conversions to remember: **`mtc1` + `cvt.s.w` = int in,
`trunc.w.s` + `mfc1` = int out.** When you see either pair, you know there is
a cast (or an automatic promotion) at that point in the C. This is one of the
most useful patterns to recognise in game code that uses a lot of floats.

In the target, the cast wraps *computed* float work. One `.s` operation runs
first, and its result leaves the FPU instead of a plain argument. Check which
operation it is and what its inputs are.

## Your task

Write `func_80060eb4` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80060eb4(f32 a, f32 b) {
    return (s32)(a * b);
}
```
