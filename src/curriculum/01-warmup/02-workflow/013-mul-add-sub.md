---
id: workflow-mul-add-sub
title: A Three-Instruction Mixed Chain
difficulty: 2
concepts:
  - arithmetic
  - multiplication
  - chaining
  - operand-order
symbol: muladdsub4
hints:
  - Three instructions mean three operations — count them and assign one C
    operator to each.
  - The `subf` is last and uses the result of the `add`; recall `subf rD, rA, rB`
    computes `rB − rA`, so check which register is `rA` and which is `rB`.
---

# Three operations, one accumulator

Four arguments, three operations, three instructions — each feeding the next,
with the partial result accumulating in `r0` until the final instruction writes
`r3`.

Consider `div_sub(p, q, r)`, which divides and then shifts by a third value:

```asm
divw r0, r3, r4   # r0 = p / q
subf r3, r5, r0   # r3 = r0 - r5  =  (p / q) - r
blr
```

Two instructions, two operations — `divw` produces a quotient in `r0`, and `subf`
subtracts `r5` from it. (As always, `subf rD, rA, rB` is `rB − rA`, so
`subf r3, r5, r0` gives `r0 − r5`.)

The target assembly for this lesson chains three operations rather than the
example's two. Read each instruction in turn and trace how `r0` carries the
running total from one into the next to reconstruct the expression.

## Your task

Write `muladdsub4`, taking four `int`s, to reproduce the assembly above.

<!-- starter -->
```c
int muladdsub4(int a, int b, int c, int d) {
    return 0;
}
```

<!-- solution -->
```c
int muladdsub4(int a, int b, int c, int d) {
    return a * b + c - d;
}
```
