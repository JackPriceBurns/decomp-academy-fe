---
id: bc9903be-3a1c-55a5-bf22-390175b46988
slug: arithmetic-add-sub
title: An Add Then a Subtract
difficulty: 1
concepts:
  - arithmetic
  - chaining
  - operand-order
symbol: func_8032640c
hints:
  - Each operation becomes its own instruction, evaluated left-to-right.
  - The add lands in a scratch register; the `subf` then subtracts the third
    argument from it.
---

# Chaining two instructions

Until now, one expression meant one instruction. Chain two operations together
and you get two arithmetic instructions, worked out left to right. The first
result drops into a scratch register, and that register feeds the second.

Take `p - q + r` over three `int` arguments. It compiles to:

```asm
subf r0, r4, r3   # r0 = r3 - r4  =  p - q
add  r3, r5, r0   # r3 = r5 + r0  =  r + (p - q)
blr
```

The two instructions hand off through `r0`. The `subf` parks its result there,
and the `add` pulls `r0` back in as a source. The intermediate value lives in
`r0` only long enough to feed the next step; `r3` carries the final answer.

The `subf` reversal from the earlier lesson still applies: `subf rD, rA, rB`
computes `rB - rA`.

Your target pairs up a different two operations in a different order. Work
through the asm one instruction at a time, figure out what each computes,
follow the register threading, and the expression reassembles itself.

## Your task

Write `func_8032640c` to reproduce the target assembly.

<!-- solution -->
```c
int func_8032640c(int a, int b, int c) {
    return a + b - c;
}
```
