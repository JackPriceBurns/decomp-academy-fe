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
first — it uses the **immediate** form `addi rD, rA, imm`:

```asm
addi r3, r3, 1    # r3 = r3 + 1
blr
```

Immediates are signed 16-bit, so the same `addi` handles subtraction of a
constant too (`x - 5` → `addi r3, r3, -5`). No separate instruction needed.
That 16-bit field only spans **-32768 to 32767**; constants outside that range
take two instructions (`lis` + `addi`). You won't see that here, but spotting the
pattern later will save you some confusion.

## Your task

Write `increment` so it compiles to the `addi` above.

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
