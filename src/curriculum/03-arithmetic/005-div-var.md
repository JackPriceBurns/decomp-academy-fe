---
id: arithmetic-div-var
title: Real Division
difficulty: 2
concepts:
  - arithmetic
  - divide
  - signed
symbol: div2
hints:
  - Dividing by a variable can't be reduced to shifts — it's a hardware divide.
  - The signed `int` type selects `divw` (an unsigned divide would use `divwu`).
---

# When it really is a divide

Dividing by a *variable* can't be reduced to shifts, so the compiler emits the
hardware **`divw rD, rA, rB`** (signed divide word):

```asm
divw r3, r3, r4
blr
```

Unsigned division by a variable uses `divwu` instead. The signed/unsigned choice
is driven entirely by the C types — another reminder that *types decide the
instruction*.

## Your task

Write `div2` for signed `int`s to match the target.

<!-- starter -->
```c
int div2(int a, int b) {
    return 0;
}
```

<!-- solution -->
```c
int div2(int a, int b) {
    return a / b;
}
```
