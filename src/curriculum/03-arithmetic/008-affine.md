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

Real code combines these tricks. `x * 4 + 1` mixes a strength-reduced multiply
with an immediate add. MWCC may even fuse the shift-and-add cleverly:

```asm
slwi r3, r3, 2    # x * 4
addi r3, r3, 1    # + 1
blr
```

When you read disassembly, mentally collapse `slwi`/`addi` chains back into the
arithmetic expression that produced them. That reverse-mapping is the whole job.

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
