---
id: gba-foundations-immediate
title: "Immediates: Math With Constants"
difficulty: 1
concepts:
  - arithmetic
  - immediates
symbol: bias
hints:
  - Adding a constant uses the immediate form of `add` — the number rides inside
    the instruction, with no separate load.
  - agbcc prints immediates in hex, so read the target's constant as a hex value.
---

# Folding a constant into the instruction

Adding a small constant costs no extra load. agbcc folds the number straight into
the instruction with the immediate form `add Rd, Rd, #imm` — `#imm` being the
literal value carried inside the opcode. A function that adds twelve to its
argument compiles to this:

```asm
add	r0, r0, #0xc
bx	lr
```

Notice the constant is written in **hexadecimal**: `#0xc` is decimal 12 — agbcc's
`-fhex-asm` habit, and every immediate you meet here will be in hex, so
get comfortable converting. The Thumb immediate field is eight bits, reaching 0
to 255; ask for more and the compiler has to build the value some other way — but
that won't happen in this exercise.

Read the constant the target `add` carries — in hex — and that is the number you
are after.

## Your task

Write `bias`, taking an `int x`, so it compiles to the target `add` instruction.

<!-- starter -->
```c
int bias(int x) {
    return 0;
}
```

<!-- solution -->
```c
int bias(int x) {
    return x + 16;
}
```
