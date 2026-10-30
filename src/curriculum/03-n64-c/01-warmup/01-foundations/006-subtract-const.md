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
  - "MIPS has no subtract-immediate instruction. Subtracting N is `addiu` with -N."
  - "The negative number on the `addiu` is the amount being subtracted; flip its sign."
---

# There is no subtract-immediate

MIPS has no `subiu`. When C subtracts a constant, the compiler uses the
instruction you already know, `addiu`, and gives it a negative immediate. The
signed 16-bit field holds negative values as well as positive ones:

```asm
addiu v0, a0, -7   # v0 = a0 + (-7), which is a0 - 7
jr    ra
nop
```

Some disassemblers print a friendlier `subi` alias to hide this. The one on
this site doesn't, and that is better: the listing shows what the instruction
really is, an `addiu` with a negative number. Once you know the pattern, it is
quick to read. Find the immediate and flip its sign. The result is the amount
the C subtracts.

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
