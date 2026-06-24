---
id: arithmetic-affine
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

# Putting the idioms together

Real code combines these tricks. An affine expression — multiply by a
power-of-two, then add a constant — compiles to a strength-reduced shift
followed by an immediate add.

To see how the instructions encode the math: the shift left amount is the
base-2 exponent of the multiplier, and the `addi` immediate is the addend. For
example, `n * 8 + 3` (shift left by 3, then add 3) becomes:

```asm
slwi r3, r3, 3    # left-shift by 3  →  n * 8
addi r3, r3, 3    # add 3
blr
```

Your target function uses different constants. Read the shift amount and the
`addi` immediate from the disassembly below and work backwards to the C
expression that produces them.

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
