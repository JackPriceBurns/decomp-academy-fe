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

Stretch the chain to four operands: `a + b - c + d` is three operations, so
three arithmetic instructions, each feeding the next. The partial result rides
along in `r0` and only moves into `r3` on the last step:

```asm
add  r0, r3, r4   # r0 = a + b
subf r0, r5, r0   # r0 = r0 - r5  =  (a + b) - c
add  r3, r6, r0   # r3 = d + ((a + b) - c)
blr
```

Read it as a single accumulator threading through three instructions: `add`
seeds `r0` with `a + b`, `subf` takes `c` away (reversed operands as always:
`subf r0, r5, r0` is `r0 - r5`), and the final `add` folds in the fourth
argument `d` from `r6` and lands the answer in `r3`.

Once you see the pattern — one instruction per operation, the result register
threaded from each into the next — chains of any length read the same way.

## Your task

Write `addsub4`, returning `a + b - c + d` for four `int`s.

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
