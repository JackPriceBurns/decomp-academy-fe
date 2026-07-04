---
id: 72874b75-7944-4b89-ac25-1b78df9e183e
slug: foundations-subtract-const
title: Subtracting a Constant
difficulty: 1
concepts:
  - arithmetic
  - immediates
symbol: subConst
hints:
  - The diff shows `subi rD, rA, N` — the disassembler's simplified name for an
    `addi` carrying a negative immediate.
  - The `N` on the `subi` is the constant being subtracted; read it straight off.
---

# `subi`: an `addi` in disguise

There's no separate subtract-immediate opcode. As the last lesson hinted,
subtracting a constant is just `addi` with a **negative** immediate. But the
disassembler is helpful about it: whenever it meets an `addi` carrying a negative
constant, it prints the friendlier simplified mnemonic **`subi`** instead.

So `dec7(n) = n - 7` shows up in the diff as:

```asm
subi r3, r3, 7    # r3 = r3 - 7   (encoded as addi r3, r3, -7)
blr
```

Same single instruction, same bytes as an `addi` — `subi` is only the nicer name
the diff prints, and the number it carries is positive: the amount being
subtracted. Read that value straight off the target.

## Your task

Write `subConst`, taking an `int a`, to reproduce the target `subi`.

<!-- starter -->
```c
int subConst(int a) {
    return 0;
}
```

<!-- solution -->
```c
int subConst(int a) {
    return a - 5;
}
```
