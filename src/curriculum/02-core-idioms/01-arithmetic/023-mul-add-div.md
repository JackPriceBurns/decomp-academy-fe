---
id: arithmetic-mul-add-div
title: Multiply and Divide Combined
difficulty: 2
concepts:
  - arithmetic
  - multiplication
  - division
  - chaining
  - operand-order
symbol: muldiv4
hints:
  - Two independent sub-expressions — `mullw` and `divw` — each write into their own
    register before the final instruction combines them.
  - The last instruction is `add`, not `subf`; both source registers carry intermediate
    results. Identify which holds the product and which holds the quotient.
---

# Both multiply and divide, side by side

When an expression contains both `mullw` and `divw` and neither depends on the
other's result, the compiler evaluates them independently — each into its own
register — and then joins them with one final instruction. The order the
compiler picks for the two independent operations can differ from their order in
the source, so read the registers rather than the instruction sequence to
reconstruct the expression.

Consider `scale_ratio(p, q, r, s)`, which multiplies one pair and divides
another, then subtracts the results:

```asm
divw    r5,r5,r6   # r5 = r / s
mullw   r0,r3,r4   # r0 = p * q
subf    r3,r5,r0   # r3 = r0 - r5  =  (p * q) - (r / s)
blr
```

`divw` runs first, overwriting `r5` in place. `mullw` follows, writing `r0`.
Neither depends on the other, so the order is the compiler's choice. The `subf`
then combines them: `subf rD, rA, rB` is `rB − rA`, so `subf r3, r5, r0` gives
`r0 − r5`, which is `(p * q) − (r / s)`.

The target assembly for this lesson uses a different combining instruction.
Read the target carefully: identify what each of the first two instructions
produces, then determine what the final instruction does with both results.

## Your task

Write `muldiv4`, taking four `int`s, to reproduce the assembly above.

<!-- starter -->
```c
int muldiv4(int a, int b, int c, int d) {
    return 0;
}
```

<!-- solution -->
```c
int muldiv4(int a, int b, int c, int d) {
    return a * b + c / d;
}
```
