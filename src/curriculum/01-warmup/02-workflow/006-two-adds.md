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

Addition is **associative** — `(a + b) + c` equals `a + (b + c)` — and the
compiler uses that freedom to schedule the work differently from what you might
expect. Instead of computing left-to-right through the registers, it may defer
one operand while it pairs two others first.

Consider `sum4`, a four-argument sum:

```asm
add  r0, r4, r5   # r0 = b + c  (computed first)
mr   r4, r3       # r4 = a      (saved aside)
add  r3, r0, r6   # r3 = (b + c) + d
add  r3, r4, r3   # r3 = a + ((b + c) + d)
blr
```

The `mr` (*move register*) instruction is a register-to-register copy with no
arithmetic effect. Here it parks `a` out of the way so the compiler can pair
`b + c` first, then fold in `d`, then stitch `a` back in last. The result is
mathematically identical to summing left-to-right; only the grouping changed.

When you see an `mr` at the top of a function, look for the operand it saves —
it will show up again in a later `add`. The final instruction count tells you
how many operations the expression contains; the registers tell you which
arguments are involved.

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
