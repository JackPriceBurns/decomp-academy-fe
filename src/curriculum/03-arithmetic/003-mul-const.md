---
id: arithmetic-mul-const
title: Multiply by a Small Constant
difficulty: 2
concepts:
  - strength-reduction
  - immediates
symbol: times12
hints:
  - A constant multiply that isn't a power of two can use `mulli`.
  - Write the multiply in C; the constant folds into a single immediate-multiply.
---

# `mulli` for constant multiplies

A multiply by a non-power-of-two constant uses the **immediate** multiply
`mulli rD, rA, imm`:

```asm
mulli r3, r3, 12
blr
```

(For some constants MWCC will instead synthesize the product from shifts and
adds when that's cheaper — but for many small values it just emits `mulli`.)

## Your task

Write `times12` so it compiles to the `mulli` above.

<!-- starter -->
```c
int times12(int x) {
    return 0;
}
```

<!-- solution -->
```c
int times12(int x) {
    return x * 12;
}
```
