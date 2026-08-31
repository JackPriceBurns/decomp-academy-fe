---
id: 0e18bc4d-e599-51ea-ba61-9142d23742b7
slug: arithmetic-add-sub-add
title: A Three-Instruction Chain
difficulty: 2
concepts:
  - arithmetic
  - chaining
  - operand-order
symbol: func_803862f0
hints:
  - Four operands, three operations — so three arithmetic instructions in a row.
  - The running total stays in `r0` until the final `add` moves it into `r3`.
---

# A longer running total

Four operands means three operations, so three arithmetic instructions. A
partial result builds up in `r0`, passed from each instruction to the next, and
the final one writes `r3` to hand the answer back.

Here's `delta(p, q, r, s)`, running two subtracts and then an add:

```asm
subf r0, r4, r3   # r0 = r3 - r4  =  p - q
subf r0, r5, r0   # r0 = r0 - r5  =  (p - q) - r
add  r3, r6, r0   # r3 = s + ((p - q) - r)
blr
```

Every instruction grabs whatever `r0` held and applies the next operation. The
`subf` reversal is in force the whole way down: `subf rD, rA, rB` is always
`rB − rA`, so the most recent `r0` becomes the *minuend* of the next `subf`.
Count the instructions and you have the number of operations. Decode them one
by one and the chain reads off left to right.

This target runs on the same plan. Pin down which register carries which
argument (`r3`→`a`, `r4`→`b`, `r5`→`c`, `r6`→`d`), then follow the accumulator
instruction by instruction until the expression falls out.

## Your task

Write `func_803862f0` to reproduce the target assembly.

<!-- solution -->
```c
int func_803862f0(int a, int b, int c, int d) {
    return a + b - c + d;
}
```
