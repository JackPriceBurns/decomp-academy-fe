---
id: arithmetic-div-add
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

Recall `divw rD, rA, rB` computes `rA / rB` — *divide word*, signed, discarding
the remainder, with the dividend in `rA` and the divisor in `rB` and no operand
reversal.

Division is more expensive than multiplication (typically 20+ cycles on PowerPC),
so a `divw` instruction stands out in disassembly. Like any other arithmetic
instruction, its result lands in a scratch register and can feed a subsequent
operation.

Consider `scaled_div(p, q, r)`, which multiplies before dividing:

```asm
mullw r0, r3, r4   # r0 = p * q
divw  r3, r0, r5   # r3 = r0 / r5  =  (p * q) / r
blr
```

The product `p * q` is computed first into `r0`, then `divw` divides `r0` by
`r5`. Both arguments to the final operation are in registers — `r0` holds the
intermediate, `r5` holds `r` (the third argument at entry).

For the target assembly in this lesson, identify which argument registers feed
`divw` directly (no prior computation needed), then look at the second instruction
to see how the quotient is used.

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
