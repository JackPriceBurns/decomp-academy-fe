---
id: workflow-two-products
title: Two Products, Subtracted
difficulty: 2
concepts:
  - arithmetic
  - multiplication
  - chaining
  - operand-order
symbol: mulsubmul4
hints:
  - Two `mullw` instructions mean two independent products — one writes into a
    saved register, the other into the scratch `r0`.
  - The `subf` at the end combines the two products; remember `subf rD, rA, rB`
    computes `rB − rA`, so the minuend is whichever register appears as `rB`.
---

# Two products in parallel

A run of multiplications and additions becomes a chain of arithmetic
instructions, each result threading into the next through a scratch register —
the same pattern as the earlier add/subtract chains, now with `mullw` in the mix.

Consider `fused_chain(p, q, r, s)`, which multiplies a pair, adds a third value,
then subtracts the fourth:

```asm
mullw r0, r4, r5   # r0 = q * r
add   r0, r3, r0   # r0 = p + (q * r)
subf  r3, r6, r0   # r3 = r0 - s
blr
```

This is a three-instruction chain where the multiply runs first due to precedence,
then an add folds in `p`, then a `subf` removes `s`. Notice the compiler handles
the three steps in order of their mathematical dependencies — the multiply result
feeds the add, and that sum feeds the subtract.

The target assembly for this lesson is arranged differently from the example.
Read it instruction by instruction — what each one computes and which registers
feed it — and use the final instruction's operand order to reconstruct the
expression.

## Your task

Write `mulsubmul4`, taking four `int`s, to reproduce the assembly above.

<!-- starter -->
```c
int mulsubmul4(int a, int b, int c, int d) {
    return 0;
}
```

<!-- solution -->
```c
int mulsubmul4(int a, int b, int c, int d) {
    return a * b - c * d;
}
```
