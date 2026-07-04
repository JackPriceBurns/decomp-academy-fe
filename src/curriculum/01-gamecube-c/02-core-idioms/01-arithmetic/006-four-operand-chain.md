---
id: 0e18bc4d-e599-51ea-ba61-9142d23742b7
slug: arithmetic-add-sub-add
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

With four operands you have got three operations, hence three arithmetic
instructions. A partial result builds up in `r0`, passed along from each
instruction to the one after it, and the final instruction writes `r3` to hand
the answer back.

Here is `delta(p, q, r, s)`. It runs two subtracts and then an add.

```asm
subf r0, r4, r3   # r0 = r3 - r4  =  p - q
subf r0, r5, r0   # r0 = r0 - r5  =  (p - q) - r
add  r3, r6, r0   # r3 = s + ((p - q) - r)
blr
```

Every instruction grabs whatever `r0` held and applies the next operation. The
`subf` reversal is in force the whole way down, since `subf rD, rA, rB` is always
`rB − rA`, which means the most recent `r0` becomes the *minuend* of the next
`subf`. So count the instructions and you know the number of operations. Decode
them one by one and the chain reads off left-to-right.

This lesson's target leans on the same plan. Pin down which register carries
which argument (`r3`→`a`, `r4`→`b`, `r5`→`c`, `r6`→`d`), then follow the
accumulator instruction by instruction until the expression falls out.

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
