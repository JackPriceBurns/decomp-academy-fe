---
id: d97e4bb1-8d88-4eaf-8650-9bfe9e460a4f
slug: foundations-subtract-const
title: Subtracting a Constant
difficulty: 1
concepts:
  - arithmetic
  - immediates
symbol: subConst
hints:
  - "There's no subtract-immediate on MIPS — subtracting N is `addiu` with -N."
  - "The negative number on the `addiu` is the amount being subtracted; flip its sign."
---

# There is no subtract-immediate

MIPS has no `subiu`. When C subtracts a constant, the compiler reaches for the
instruction you already know — `addiu` — and simply hands it a negative
immediate. That signed 16-bit field works in both directions:

```asm
addiu v0, a0, -7   # v0 = a0 + (-7)  …i.e. a0 - 7
jr    ra
nop
```

Some disassemblers invent a friendlier `subi` alias to paper over this. Ours
doesn't, and honestly that's better: the listing shows you the truth, an `addiu`
carrying a negative number. Once you know the idiom, reading it is nothing —
find the immediate, flip its sign, and that's the amount the C subtracts.

## Your task

Write `subConst`, taking an `s32 a`, to reproduce the target `addiu`.

<!-- starter -->
```c
s32 subConst(s32 a) {
    return 0;
}
```

<!-- solution -->
```c
s32 subConst(s32 a) {
    return a - 5;
}
```
