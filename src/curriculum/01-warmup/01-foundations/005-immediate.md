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

When you add a small constant, the compiler doesn't load it into a register
first — it uses the **immediate** form `addi rD, rA, imm`, where `imm` is the
literal value baked directly into the instruction:

```asm
addi r3, r3, 5    # r3 = r3 + 5
blr
```

Immediates are signed 16-bit, so the same `addi` handles subtraction of a
constant too (e.g. `n - 3` → `addi r3, r3, -3`). No separate instruction needed.
That 16-bit field only spans **-32768 to 32767**; constants outside that range
take two instructions (`lis` + `addi`). You won't see that here, but spotting the
pattern later will save you some confusion.

The target assembly uses `addi` with a specific immediate value — read it off
the target to know what constant to add.

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
