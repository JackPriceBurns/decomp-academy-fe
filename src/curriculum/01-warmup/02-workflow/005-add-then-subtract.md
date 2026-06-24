---
id: workflow-add-sub
title: An Add Then a Subtract
difficulty: 1
concepts:
  - arithmetic
  - chaining
  - operand-order
symbol: addsub3
hints:
  - Each operation becomes its own instruction, evaluated left-to-right.
  - The add lands in a scratch register; the `subf` then subtracts the third
    argument from it.
---

# Chaining two instructions

So far one expression has meant one instruction. But two operations chained
together compile to **two** arithmetic instructions, evaluated left-to-right.
The first result lands in a scratch register and feeds directly into the second.

As an example, `p - q + r` (three `int` arguments) compiles to:

```asm
subf r0, r4, r3   # r0 = r3 - r4  =  p - q
add  r3, r5, r0   # r3 = r5 + r0  =  r + (p - q)
blr
```

Notice the threading: the `subf` writes its result into a scratch register `r0`,
and the `add` reads `r0` back as one of its sources. The intermediate value lives
in `r0` just long enough to feed the next step, then `r3` holds the final answer.

The `subf` reversal from the subtraction lesson still applies here:
`subf rD, rA, rB` computes `rB - rA`.

The target assembly uses a different pair of operations in a different order.
Read the target asm — identify each instruction, determine what it computes, and
trace the register threading to reconstruct the original expression.

## Your task

Write `addsub3`, taking three `int`s, to reproduce the target assembly.

<!-- starter -->
```c
int addsub3(int a, int b, int c) {
    return 0;
}
```

<!-- solution -->
```c
int addsub3(int a, int b, int c) {
    return a + b - c;
}
```
