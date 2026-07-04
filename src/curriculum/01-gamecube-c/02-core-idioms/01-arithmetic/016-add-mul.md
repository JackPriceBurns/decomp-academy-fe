---
id: c43e2181-0caf-5860-9bcc-69c9d7ffdd14
slug: arithmetic-add-mul
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

`*` outranks `+` and `−`, so a mixed expression always does the multiply before
the add. Left side of the sum, right side, doesn't matter. The `mullw` still
comes out first, even with the multiply written last.

Take `bias_scaled(p, q, r)`. It subtracts a scaled value from a base:

```asm
mullw r0, r4, r5   # r0 = q * r
subf  r3, r0, r3   # r3 = r3 - r0  =  p - (q * r)
blr
```

`mullw` builds `q * r` from the second and third arguments, `r4` and `r5`.
`subf` then subtracts that from `r3`. And mind the reversal, since
`subf rD, rA, rB` is `rB − rA`, so `subf r3, r0, r3` works out to `r3 − r0`,
i.e. `p − (q * r)`.

Spot it by the registers. `mullw` only ever touches `r4` and `r5`; the first
argument `r3` waits until the second instruction.

Read the target the same way, working out which two registers feed the `mullw`
and which argument register surfaces only in the second instruction.

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
