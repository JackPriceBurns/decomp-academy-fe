---
id: c80e9361-9fc2-57db-b4bf-49e61cd22d26
slug: arithmetic-mul-add-div
title: Multiply and Divide Combined
difficulty: 2
concepts:
  - arithmetic
  - multiplication
  - division
  - chaining
  - operand-order
symbol: func_80203a4c
hints:
  - Two independent sub-expressions — `mullw` and `divw` — each write into their own
    register before the final instruction combines them.
  - The last instruction is `add`, not `subf`; both source registers carry intermediate
    results. Identify which holds the product and which holds the quotient.
---

# Both multiply and divide, side by side

When an expression contains both a multiply and a divide and neither depends on
the other's result, the compiler evaluates them independently — each into its
own register — then joins them with one final instruction. The order it picks
for the two can differ from their order in the source, so read the registers,
not the instruction sequence, to reconstruct the expression.

Consider `scale_ratio(p, q, r, s)`, multiplying one pair and dividing another,
then subtracting the results:

```asm
divw    r5,r5,r6   # r5 = r / s
mullw   r0,r3,r4   # r0 = p * q
subf    r3,r5,r0   # r3 = r0 - r5  =  (p * q) - (r / s)
blr
```

`divw` runs first, overwriting `r5` in place; `mullw` follows, writing `r0`.
Neither depends on the other, so the order was the compiler's choice. The
`subf` combines them: `subf rD, rA, rB` is `rB − rA`, so `subf r3, r5, r0`
gives `r0 − r5`, which is `(p * q) − (r / s)`.

This lesson's target uses a different combining instruction. Read it carefully:
identify what each of the first two instructions produces, then work out what
the final instruction does with both results.

## Your task

Write `func_80203a4c` to reproduce the assembly above.

<!-- solution -->
```c
int func_80203a4c(int a, int b, int c, int d) {
    return a * b + c / d;
}
```
