---
id: 6b26b283-f341-5cd2-bb56-748e9b7cc5c1
slug: arithmetic-mul-add-sub
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

Three operations, three instructions, and they all hand work to each other through
`r0`. That register holds the running result the whole way through; only the very
last instruction writes anything to `r3`. You've traced shorter chains like this
already, so this is just one more link.

A quick warm-up with `div_sub(p, q, r)`, which divides and then subtracts a third
value:

```asm
divw r0, r3, r4   # r0 = p / q
subf r3, r5, r0   # r3 = r0 - r5  =  (p / q) - r
blr
```

`divw` drops the quotient into `r0`. `subf` then takes `r5` away from it. The only
thing that trips people up is the order — `subf rD, rA, rB` is `rB − rA`, so
`subf r3, r5, r0` really does mean `r0 − r5`.

Your target is one operation longer. Read it from the top, track what `r0` holds
after each line, and the last instruction's operands show you how to put the
expression back together.

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
