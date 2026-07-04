---
id: 9cad55a2-b73e-576d-bb35-b6743ce9e758
slug: arithmetic-affine
title: An Affine Expression
difficulty: 3
concepts:
  - arithmetic
  - strength-reduction
  - instruction-selection
symbol: affine
hints:
  - Multiply by 4 is a shift; the + 1 is an immediate add.
  - Expect `slwi r3, r3, 2` then `addi r3, r3, 1`.
---

# When the idioms stack up

Real code rarely hands you one operation at a time. An affine expression is a
good example. It multiplies by a power of two and then adds a constant, so it's
really two of this chapter's idioms back to back. A compiler encodes each one
cheaply, a shift for the multiply and an immediate add for the constant.

Decoding runs the other way, and it's mechanical. Count how many places the
value shifts left and that's the power of two, so a shift by 3 means a multiply
by 8. Whatever number rides on the `addi` is the constant. Push `n * 8 + 3`
through that and it becomes:

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

Write `affine` to reproduce the assembly above.

<!-- starter -->
```c
int affine(int x) {
    return 0;
}
```

<!-- solution -->
```c
int affine(int x) {
    return x * 4 + 1;
}
```
