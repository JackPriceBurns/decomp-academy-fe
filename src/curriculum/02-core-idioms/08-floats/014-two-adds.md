---
id: floats-two-adds
title: Chaining Two Float Adds
difficulty: 2
concepts:
  - floating-point
  - chaining
  - single-precision
symbol: sum3
hints:
  - Three float arguments arrive in f1, f2, f3; the result must end up in f1.
  - The first `fadds` writes a scratch register, and the second folds that
    scratch in with the remaining argument.
---

# Threading a running total through the float file

Single float ops chain exactly like integer ones, just in the `f` register
bank. Each operation reads its inputs and writes a destination; a multi-step
expression threads a *running value* from one instruction to the next until it
lands in `f1` to be returned.

Consider `tally(p, q, r)`, summing three single-precision values:

```asm
fadds f0, f1, f2   # f0 = p + q   (running total in a scratch register)
fadds f1, f3, f0   # f1 = r + f0  =  p + q + r
blr
```

Read the dataflow: the first `fadds` parks `p + q` in **`f0`** (a scratch
register, not an argument), then the second `fadds` consumes `f0` together with
the still-untouched third argument `f3`, leaving the final sum in `f1`. The
arguments `f1`/`f2`/`f3` map to the first/second/third parameters.

The target assembly chains the same two single-precision adds. Trace which
register each step writes and which it reads back, and you can recover the
order the three arguments are combined.

## Your task

Write `sum3`, taking three `f32`s, to reproduce the assembly above.

<!-- starter -->
```c
f32 sum3(f32 a, f32 b, f32 c) {
    return 0.0f;
}
```

<!-- solution -->
```c
f32 sum3(f32 a, f32 b, f32 c) {
    return a + b + c;
}
```
