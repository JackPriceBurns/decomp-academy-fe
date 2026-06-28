---
id: foundations-immediate
title: "Immediates: Math With Constants"
difficulty: 1
concepts:
  - arithmetic
  - immediates
symbol: increment
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

Because that immediate field is signed and 16 bits wide, the very same `addi`
also subtracts. Want `n - 3`? You get `addi r3, r3, -3`, and not a single extra
instruction. The wrinkle is how far it reaches. Sixteen signed bits cover -32768
up to 32767; ask for anything beyond and the compiler splits the work across
`lis` plus `addi`. Won't happen in this exercise, but file the shape away,
because it will trip you up later otherwise.

Whatever immediate the target `addi` carries is the constant you are after.

## Your task

Write `increment` so it compiles to the target `addi` instruction.

<!-- starter -->
```c
int increment(int x) {
    return 0;
}
```

<!-- solution -->
```c
int increment(int x) {
    return x + 1;
}
```
