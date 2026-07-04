---
id: bc9903be-3a1c-55a5-bf22-390175b46988
slug: arithmetic-add-sub
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

Up to now, one expression has bought you one instruction. Chain two operations,
though, and you get two arithmetic instructions, worked out left-to-right. The
first result drops into a scratch register, and that register feeds straight into
the second.

Take `p - q + r` over three `int` arguments. It compiles to this.

```asm
subf r0, r4, r3   # r0 = r3 - r4  =  p - q
add  r3, r5, r0   # r3 = r5 + r0  =  r + (p - q)
blr
```

Watch how the two instructions hand off. The `subf` parks its result in scratch
register `r0`, then the `add` pulls `r0` back in as a source. That intermediate
value sits in `r0` only long enough to feed the next step, after which `r3`
carries the final answer.

And the `subf` reversal from the earlier subtraction lesson has not gone
anywhere: `subf rD, rA, rB` computes `rB - rA`.

Your target pairs up a different two operations in a different order. Work the
target asm one instruction at a time, figure out what each computes, follow the
register threading, and the original expression reassembles itself.

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
