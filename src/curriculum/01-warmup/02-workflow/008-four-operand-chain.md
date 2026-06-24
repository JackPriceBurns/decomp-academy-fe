---
id: workflow-add-sub-add
title: A Three-Instruction Chain
difficulty: 2
concepts:
  - arithmetic
  - chaining
  - operand-order
symbol: addsub4
hints:
  - Four operands, three operations — so three arithmetic instructions in a row.
  - The running total stays in `r0` until the final `add` moves it into `r3`.
---

# A longer running total

Four operands means three operations, so three arithmetic instructions. A partial
result accumulates in `r0`, threading from one instruction into the next, with
the final instruction writing `r3` to return.

Consider `delta(p, q, r, s)`, which chains two subtracts before an add:

```asm
subf r0, r4, r3   # r0 = r3 - r4  =  p - q
subf r0, r5, r0   # r0 = r0 - r5  =  (p - q) - r
add  r3, r6, r0   # r3 = s + ((p - q) - r)
blr
```

Each instruction takes the previous result in `r0` and applies the next
operation. The `subf` reversal applies throughout — `subf rD, rA, rB` is
always `rB − rA` — so the last `r0` written becomes the *minuend* in the
following `subf`. Count the instructions to know how many operations there are,
then decode each one individually to read the chain left-to-right.

For the target in this lesson, note which registers hold which arguments
(`r3`→`a`, `r4`→`b`, `r5`→`c`, `r6`→`d`) and trace the accumulator through
each instruction to reconstruct the expression.

## Your task

Write `addsub4`, taking four `int`s, to reproduce the assembly above.

<!-- starter -->
```c
int addsub4(int a, int b, int c, int d) {
    return 0;
}
```

<!-- solution -->
```c
int addsub4(int a, int b, int c, int d) {
    return a + b - c + d;
}
```
