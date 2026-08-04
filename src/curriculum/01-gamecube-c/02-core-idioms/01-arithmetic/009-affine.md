---
id: 9cad55a2-b73e-576d-bb35-b6743ce9e758
slug: arithmetic-affine
title: An Affine Expression
difficulty: 3
concepts:
  - arithmetic
  - strength-reduction
  - instruction-selection
symbol: func_8032b554
hints:
  - Multiply by 4 is a shift; the + 1 is an immediate add.
  - Expect `slwi r3, r3, 2` then `addi r3, r3, 1`.
---

# When the idioms stack up

Real code rarely hands you one operation at a time. An affine expression is a
good example: it multiplies by a power of two and then adds a constant, so it's
two of this chapter's idioms back to back. The compiler encodes each one cheaply:
a shift for the multiply and an immediate add for the constant.

Decoding runs the other way, and it's mechanical. Count how many places the value
shifts left and that's the power of two — a shift by 3 means a multiply by 8.
Whatever number is on the `addi` is the constant. So `n * 8 + 3` becomes:

```asm
slwi r3, r3, 3    # left-shift by 3  →  n * 8
addi r3, r3, 3    # add 3
blr
```

The function below uses its own constants. Read the shift count and the `addi`
immediate off the disassembly, then work out which C expression produces them.

```asm
slwi r3, r3, 2
addi r3, r3, 1
blr
```

## Your task

Write `func_8032b554` to reproduce the assembly above.

<!-- solution -->
```c
int func_8032b554(int x) {
    return x * 4 + 1;
}
```
