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
symbol: func_8010f884
hints:
  - C's operator precedence means `*` binds before `+`, even when written second.
  - Look at which two argument registers feed the `mullw` — those identify the
    two operands that are multiplied together.
---

# When the multiply runs first

`*` outranks `+` and `−`, so a mixed expression always multiplies before it
adds — whether the multiply is written on the left or the right of the sum. The
`mullw` comes out first either way.

Take `bias_scaled(p, q, r)`, subtracting a scaled value from a base:

```asm
mullw r0, r4, r5   # r0 = q * r
subf  r3, r0, r3   # r3 = r3 - r0  =  p - (q * r)
blr
```

`mullw` builds `q * r` from the second and third arguments, `r4` and `r5`, and
`subf` subtracts that from `r3`. Mind the reversal: `subf rD, rA, rB` is
`rB − rA`, so `subf r3, r0, r3` works out to `r3 − r0`, i.e. `p − (q * r)`.

You can spot it by the registers: `mullw` only ever touches `r4` and `r5`, and
the first argument `r3` waits until the second instruction.

Read the target the same way — work out which two registers feed the `mullw`,
and which argument register only surfaces in the second instruction.

## Your task

Write `func_8010f884` to reproduce the assembly above.

<!-- solution -->
```c
int func_8010f884(int a, int b, int c) {
    return a + b * c;
}
```
