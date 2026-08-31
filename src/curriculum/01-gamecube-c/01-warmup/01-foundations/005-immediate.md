---
id: f3f1fa3d-dd68-5dd8-81f2-8d0df5c84324
slug: foundations-immediate
title: "Immediates: Math With Constants"
difficulty: 1
concepts:
  - arithmetic
  - immediates
symbol: adjust
hints:
  - Adding a constant uses the immediate form `addi`.
  - The constant folds right into the instruction, so it's one op with no extra
    load.
---

# Folding a constant into the instruction

Adding a small constant doesn't need a separate load. The compiler folds the
number straight into the instruction using the immediate form,
`addi rD, rA, imm` — `imm` is a literal value carried inside the opcode itself:

```asm
addi r3, r3, 5    # r3 = r3 + 5
blr
```

The immediate field is signed and 16 bits wide, so it reaches from -32768 to
32767. Ask for a constant bigger than that and the compiler splits the work
across `lis` plus `addi` — not something you need here, but worth filing away.
And because the field is signed, the same `addi` can *subtract* as well. That's
the next lesson.

The immediate in the target `addi` is the constant you're after.

## Your task

Write `adjust` so it compiles to the target `addi` instruction.

<!-- starter -->
```c
int adjust(int x) {
    return 0;
}
```

<!-- solution -->
```c
int adjust(int x) {
    return x + 1;
}
```
