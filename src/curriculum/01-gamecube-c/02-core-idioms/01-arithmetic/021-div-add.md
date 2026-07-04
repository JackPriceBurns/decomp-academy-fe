---
id: e2828deb-1fda-5d60-b9ac-9876f1d5bc86
slug: arithmetic-div-add
title: Divide Then Add
difficulty: 1
concepts:
  - arithmetic
  - division
  - chaining
symbol: divadd3
hints:
  - "`divw rD, rA, rB` computes signed integer `rA / rB` — the dividend is `rA`,
    the divisor is `rB`."
  - After `divw` writes the quotient into a scratch register, trace which register
    carries it into the next instruction.
---

# Chaining off a divide

You've seen `divw rD, rA, rB` already. It's *divide word*, a signed `rA / rB` that
keeps no remainder, with `rA` holding the dividend and `rB` the divisor. Nothing
gets swapped the way `subf` swaps its operands, so it reads in the obvious order.

A divide is slow. Twenty-plus cycles on PowerPC is typical, far more than a
multiply, so a `divw` always stands out in disassembly. The result behaves like
any other, though. It lands in a scratch register, ready for the next instruction.

Here's `scaled_div(p, q, r)`, which multiplies first and then divides.

```asm
mullw r0, r3, r4   # r0 = p * q
divw  r3, r0, r5   # r3 = r0 / r5  =  (p * q) / r
blr
```

The product `p * q` lands in `r0`, and `divw` divides it by `r5`. Both operands are
already in registers by then. `r0` holds the intermediate, and `r5` still holds `r`
from entry.

So for your target, spot which argument registers reach `divw` directly, then check
the second instruction for what happens to the quotient.

## Your task

Write `divadd3`, taking three `int`s, to reproduce the assembly above.

<!-- starter -->
```c
int divadd3(int a, int b, int c) {
    return 0;
}
```

<!-- solution -->
```c
int divadd3(int a, int b, int c) {
    return a / b + c;
}
```
