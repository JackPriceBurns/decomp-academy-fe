---
id: 8b8fcb43-21ec-51f5-90b4-90deaa3cffc4
slug: arithmetic-mul-const
title: Multiply by a Small Constant
difficulty: 2
concepts:
  - strength-reduction
  - immediates
symbol: mulConst
hints:
  - A constant multiply that isn't a power of two can use `mulli`.
  - Write the multiply in C; the constant folds into a single immediate-multiply.
---

# `mulli` for constant multiplies

Multiplying by a constant gets its own instruction: the **immediate** multiply
`mulli rD, rA, imm`. The multiplier lives inside the instruction, so again
there's no separate load.

`times6(n) = n * 6` compiles to:

```asm
mulli r3, r3, 6
blr
```

The immediate field *is* the constant — read it straight out of the
instruction.

(One kind of constant skips `mulli`: powers of two. The compiler turns those
into a cheaper shift instead, which is a story for a later chapter.)

Look at the immediate on the `mulli` in the target. That value is your
multiplier.

## Your task

Write `mulConst` to reproduce the target assembly.

<!-- starter -->
```c
int mulConst(int x) {
    return 0;
}
```

<!-- solution -->
```c
int mulConst(int x) {
    return x * 12;
}
```
