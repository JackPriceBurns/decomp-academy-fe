---
id: workflow-add-mul
title: Precedence Changes the Order
difficulty: 1
concepts:
  - arithmetic
  - multiplication
  - precedence
  - chaining
symbol: addmul3
hints:
  - C's operator precedence means `*` binds before `+`, even when written second.
  - Look at which two argument registers feed the `mullw` — those identify the
    two operands that are multiplied together.
---

# When the multiply runs first

In C, `*` binds tighter than `+` and `−`, so in a mixed expression the
multiplication is always evaluated first — no matter where it sits in reading
order. The assembly mirrors this: the `mullw` runs before the add or subtract,
even when the multiply is written last.

Consider `bias_scaled(p, q, r)`, which subtracts a scaled value from a base:

```asm
mullw r0, r4, r5   # r0 = q * r
subf  r3, r0, r3   # r3 = r3 - r0  =  p - (q * r)
blr
```

`mullw` runs first, computing `q * r` (arguments two and three, in `r4` and `r5`).
The `subf` then takes that product and subtracts it from `r3` — note:
`subf rD, rA, rB` is `rB − rA`, so `subf r3, r0, r3` gives `r3 − r0`,
which is `p − (q * r)`.

The tell-tale sign of a right-side multiply binding first: `mullw` uses `r4` and
`r5` while `r3` (the first argument) only appears in the second instruction.

For the target assembly in this lesson, identify which two registers feed the
`mullw` and which argument register enters only in the second step.

## Your task

Write `addmul3`, taking three `int`s, to reproduce the assembly above.

<!-- starter -->
```c
int addmul3(int a, int b, int c) {
    return 0;
}
```

<!-- solution -->
```c
int addmul3(int a, int b, int c) {
    return a + b * c;
}
```
