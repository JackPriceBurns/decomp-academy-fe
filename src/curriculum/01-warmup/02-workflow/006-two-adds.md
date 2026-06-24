---
id: workflow-add3
title: Two Adds, Reassociated
difficulty: 2
concepts:
  - arithmetic
  - chaining
  - reassociation
symbol: add3
hints:
  - Addition is associative, so the compiler is free to regroup the operands.
  - Watch for an `mr` that just parks `a` while `b + c` is computed first.
---

# When the compiler regroups your chain

`a + b + c` is two adds, so you might expect `add` then `add` straight down `r3`.
But addition is **associative** — `(a + b) + c` equals `a + (b + c)` — and the
compiler uses that freedom to schedule the work differently:

```asm
mr  r0, r3        # r0 = a  (saved for later)
add r3, r4, r5    # r3 = b + c
add r3, r0, r3    # r3 = a + (b + c)
blr
```

Instead of summing left-to-right, it computes `b + c` first, parking `a` in `r0`
with an `mr` (*move register*, a register-to-register copy) so the operand in
`r3` isn't lost. The final `add` then combines the saved `a` with the `b + c`
partial. The result is identical — only the grouping changed.

This is your first reminder that matching isn't always literal: when an operation
is associative or commutative, the toolchain may reorder it. Your job is to write
the C whose *meaning* matches; the compiler picks the schedule.

## Your task

Write `add3`, returning the sum of three `int`s.

<!-- starter -->
```c
int add3(int a, int b, int c) {
    return 0;
}
```

<!-- solution -->
```c
int add3(int a, int b, int c) {
    return a + b + c;
}
```
