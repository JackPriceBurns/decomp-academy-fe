---
id: floats-add-then-subtract
title: Mixing Add and Subtract in One Chain
difficulty: 2
concepts:
  - floating-point
  - chaining
  - operand-order
symbol: net3
hints:
  - The scratch register from the first step becomes the *left* operand of the
    `fsubs`, because `fsubs` keeps natural order.
  - Watch which argument is subtracted — `fsubs fD, fA, fB` is `fA - fB`.
---

# A subtract that keeps its order, mid-chain

Unlike the integer world's operand-reversing `subf`, the float unit's `fsubs`
computes `fD = fA - fB` left-to-right. That regularity matters most inside a
chain, where you have to keep track of which value is the minuend and which is
the subtrahend.

Consider `delta(p, q, r)`, which adds the first two arguments and then takes the
third away:

```asm
fadds f0, f1, f2   # f0 = p + q
fsubs f1, f0, f3   # f1 = f0 - r  =  (p + q) - r
blr
```

The running total `p + q` lands in `f0`, and `fsubs` keeps it as the **left**
operand so the result is `(p + q) - r`, not `r - (p + q)`. If the assembly had
read `fsubs f1, f3, f0` the meaning would flip — the operand order in the
instruction *is* the order in the C.

The target assembly chains an add into a subtract the same way. Read the operand
order of the `fsubs` to confirm which value is taken away from which.

## Your task

Write `net3`, taking three `f32`s, to reproduce the assembly above.

<!-- starter -->
```c
f32 net3(f32 a, f32 b, f32 c) {
    return 0.0f;
}
```

<!-- solution -->
```c
f32 net3(f32 a, f32 b, f32 c) {
    return a + b - c;
}
```
