---
id: 576b7ea9-87f1-580f-93c5-5b3075f9fc86
slug: floats-two-adds
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

Floats don't do anything special here. Same chaining you already know from
the integer registers, just over in the `f` bank. One instruction, two inputs,
one output. Glue a handful together and the partial result keeps getting passed
forward; the last one has to leave it in `f1` or there is nothing to return.

Take `tally(p, q, r)`, three single-precision values added up. The compiler
spits out:

```asm
fadds f0, f1, f2   # f0 = p + q   (running total in a scratch register)
fadds f1, f3, f0   # f1 = r + f0  =  p + q + r
blr
```

`p + q` goes first. It lands in `f0`, which is just scratch space, not an
argument register. Then `fadds` number two wants `f0` and it wants `f3` (the
third argument, still sitting there untouched), and the sum of those two is your
`f1`. Walk that backwards and the arguments are `f1`, `f2`, `f3`, in parameter
order.

You will find those same two adds in the target. Watch what each one writes and
what it reads back, and the order the arguments combine is yours to reconstruct.

## Your task

Write `sum3` to reproduce the assembly above.

<!-- solution -->
```c
f32 sum3(f32 a, f32 b, f32 c) {
    return a + b + c;
}
```
