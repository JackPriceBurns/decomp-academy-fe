---
id: 37096f52-df25-5b88-9c5e-5ba07933f296
slug: arithmetic-two-products
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

Multiplications and additions compile down to a chain of arithmetic instructions.
Each result rides into the next one through a scratch register. You've seen this
with the add/subtract chains already; the only new face here is `mullw`.

Take `fused_chain(p, q, r, s)`. It multiplies a pair, adds a third value, and
subtracts the fourth.

```asm
mullw r0, r4, r5   # r0 = q * r
add   r0, r3, r0   # r0 = p + (q * r)
subf  r3, r6, r0   # r3 = r0 - s
blr
```

Three instructions, run in dependency order. The multiply goes first because of
precedence. Then `add` folds in `p`, and `subf` strips off `s` at the end. The
product feeds the sum, the sum feeds the subtraction, so the compiler never has
to reorder anything.

The target assembly is laid out differently. Walk it one instruction at a time,
note what each computes and which registers feed it, then let the operand order
on the final instruction tell you how the expression goes back together.

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
