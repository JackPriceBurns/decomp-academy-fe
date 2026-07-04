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

Adding a small constant is free of any load. The compiler folds the number
straight into the instruction with the immediate form `addi rD, rA, imm` — `imm`
being the literal value, riding along inside the opcode:

```asm
addi r3, r3, 5    # r3 = r3 + 5
blr
```

That immediate field is signed and 16 bits wide, so it reaches from -32768 up to
32767; ask for a constant beyond that and the compiler splits the work across
`lis` plus `addi`. Won't happen in this exercise, but file the shape away. And
because the field is signed, the very same `addi` can *subtract* too — that's the
next lesson.

Whatever immediate the target `addi` carries is the constant you are after.

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
