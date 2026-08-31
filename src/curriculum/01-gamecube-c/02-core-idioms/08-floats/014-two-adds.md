---
id: 576b7ea9-87f1-580f-93c5-5b3075f9fc86
slug: floats-two-adds
title: Chaining Two Float Adds
difficulty: 2
concepts:
  - floating-point
  - chaining
  - single-precision
symbol: func_801dadf8
hints:
  - Three float arguments arrive in f1, f2, f3; the result must end up in f1.
  - The first `fadds` writes a scratch register, and the second folds that
    scratch in with the remaining argument.
---

# Threading a running total through the float file

Floats don't do anything special here — same chaining as integer registers,
just in the `f` bank. One instruction, two inputs, one output. Glue a few
together and the partial result keeps moving forward; the last one must leave
it in `f1` or there's nothing to return.

Take `tally(p, q, r)`, three single-precision values added:

```asm
fadds f0, f1, f2   # f0 = p + q   (running total in scratch)
fadds f1, f3, f0   # f1 = r + f0  =  p + q + r
blr
```

`p + q` goes first, landing in `f0`. The second `fadds` takes `f0` and `f3`
(the third argument) and leaves the sum in `f1`. Walk it backward and the
arguments are `f1`, `f2`, `f3` in parameter order.

You'll find the same two adds in the target. Watch what each writes and reads,
and the order the arguments combine is yours to reconstruct.

## Your task

Write `func_801dadf8` to reproduce the assembly above.

<!-- solution -->
```c
f32 func_801dadf8(f32 a, f32 b, f32 c) {
    return a + b + c;
}
```
