---
id: workflow-sub-add
title: A Subtract Then an Add
difficulty: 2
concepts:
  - arithmetic
  - chaining
  - operand-order
symbol: subadd3
hints:
  - The `subf` runs first and leaves `a - b` in a scratch register.
  - Remember `subf rD, rA, rB` computes `rB - rA`, so `subf r0, r4, r3` is
    `a - b`.
---

# Threading a `subf` into a chain

Now mix the subtract quirk into a chain. Two operations means two arithmetic
instructions, each feeding the next — the running result rides in `r0` until the
final instruction writes `r3`.

Consider `blend(p, q, r)`, which combines an add and a subtract:

```asm
add  r0, r3, r4   # r0 = p + q
subf r3, r5, r0   # r3 = r0 - r5  =  (p + q) - r
blr
```

The key detail is `subf`'s operand order: **`subf rD, rA, rB` computes `rB − rA`**,
not `rA − rB`. So `subf r3, r5, r0` is `r0 − r5`, which equals `(p + q) − r`.
Swap the subtrahend and minuend in your head whenever you read `subf`.

Unlike addition, subtraction is *not* associative, so the compiler preserves
the left-to-right order you write in C. The sequence of instructions directly
mirrors the sequence of operations — but the operand order inside `subf` is
always reversed from what you might expect.

For the target assembly in this lesson, ask yourself: which instruction comes
first, and which argument appears as `rA` vs `rB` in the `subf`?

## Your task

Write `subadd3`, taking three `int`s, to reproduce the assembly above.

<!-- starter -->
```c
int subadd3(int a, int b, int c) {
    return 0;
}
```

<!-- solution -->
```c
int subadd3(int a, int b, int c) {
    return a - b + c;
}
```
