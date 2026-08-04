---
id: 36a109b4-9c3d-56a2-bfe4-3b63a20f2d86
slug: floats-add-then-subtract
title: Mixing Add and Subtract in One Chain
difficulty: 2
concepts:
  - floating-point
  - chaining
  - operand-order
symbol: func_801a8424
hints:
  - The scratch register from the first step becomes the *left* operand of the
    `fsubs`, because `fsubs` keeps natural order.
  - Watch which argument is subtracted — `fsubs fD, fA, fB` is `fA - fB`.
---

# A subtract that keeps its order, mid-chain

Integer `subf` flips operands; `fsubs` doesn't. It just computes `fD = fA - fB`,
left to right. That plain ordering matters mid-chain, where you need to stay clear
on which value is subtracted from which.

Say `delta(p, q, r)` adds the first two arguments, then takes the third away:

```asm
fadds f0, f1, f2   # f0 = p + q
fsubs f1, f0, f3   # f1 = f0 - r  =  (p + q) - r
blr
```

The running total `p + q` sits in `f0`. `fsubs` leaves it on the left, so the
result is `(p + q) - r`, not `r - (p + q)`. Swap to `fsubs f1, f3, f0` and the
math swaps too. Whatever order you read in the operands is the order you write in
C.

Same shape in the target: an add feeding a subtract. Read the operand order on the
`fsubs` and you'll know which value gets subtracted from which.

## Your task

Write `func_801a8424` to reproduce the assembly above.

<!-- solution -->
```c
f32 func_801a8424(f32 a, f32 b, f32 c) {
    return a + b - c;
}
```
