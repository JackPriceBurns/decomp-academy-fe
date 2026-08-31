---
id: 024a20e0-11cc-5e69-97dc-2b0f141952d8
slug: arithmetic-div-sub-mul
title: Divide and Multiply, Then Subtract
difficulty: 2
concepts:
  - arithmetic
  - division
  - multiplication
  - chaining
  - operand-order
symbol: func_80092880
hints:
  - Two independent operations (`divw` and `mullw`) produce separate results before
    they are combined — neither depends on the other.
  - The final `subf` combines both results; remember `subf rD, rA, rB` is `rB − rA`,
    so the register in the `rB` slot is the minuend.
---

# Independent operations combined at the end

When two parts of an expression are independent — neither needs the other's
result — the compiler computes each into its own register and combines them in
one final step, evaluating them in whichever order it likes. The example below
builds a product and a quotient, then joins them.

Consider `mul_plus_div(p, q, r, s)`, multiplying one pair and dividing another,
then adding the results:

```asm
divw  r5, r5, r6   # r5 = r / s  (computed first, overwrites r5)
mullw r0, r3, r4   # r0 = p * q
add   r3, r5, r0   # r3 = (r / s) + (p * q)
blr
```

The compiler computed `r / s` first, even though it appears second in the
expression — with the two sub-expressions independent, the order was its
choice. The `divw` overwrites `r5` in place, freeing it up as an intermediate,
and `mullw` writes its product into `r0`. The `add` combines both.

In this lesson's target, the final instruction is a `subf` instead of an `add`.
Identify which register feeds each slot of the `subf`, then apply the
`subf rD, rA, rB` = `rB − rA` rule to work out which result is the minuend and
which is the subtrahend.

## Your task

Write `func_80092880` to reproduce the assembly above.

<!-- solution -->
```c
int func_80092880(int a, int b, int c, int d) {
    return a / b - c * d;
}
```
