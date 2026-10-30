---
id: 667a7052-3c9b-4234-94ca-5bc6f4c88c65
slug: bitwise-shift-trio
title: "sll, srl, sra: The Shift Family"
difficulty: 2
concepts:
  - shifts
  - types
symbol: func_8019e9c0
hints:
  - "There are two right shifts with different mnemonics, on two different arguments. The mnemonics tell you that the two parameter types are different."
  - "Both shift amounts are the same. Only the signedness is different between the two halves of the sum."
---

# Three shifts, two questions

You have already met all three shift instructions in the arithmetic lessons.
Here they are together. Each one answers two questions: which direction does
it shift, and what fills the bits that become empty?

- **`sll`** shifts left, and zeros fill in from the bottom. This is C's `<<`.
- **`srl`** shifts right, and zeros fill in from the top. This is C's `>>` on
  **unsigned** values.
- **`sra`** shifts right, and *copies of the sign bit* fill in from the top.
  This is C's `>>` on **signed** values.

A left shift has only one form in C, so `sll` always means `<<`. But `>>` in C
becomes one of two instructions, depending on the operand's type. That makes
right shifts a *type oracle*: the instruction tells you the type, the same way
`div`/`divu` did. Here is the same shift compiled twice, first on a `u32` and
then on an `s32`:

```asm
srl  v0, a0, 6     # u32 x >> 6: zeros fill in from the top
```

```asm
sra  v0, a0, 6     # s32 y >> 6: copies of the sign bit fill in from the top
```

The C text is the same, but the instruction is different. Only the
declaration chose the mnemonic. When decoding, you use the oracle in reverse.
`srl` in the target means the shifted value must be unsigned in your C, and
`sra` means it must be signed. If you get this wrong, the diff shows a single
mnemonic mismatch on a line that is otherwise correct. When you see that, fix
the declaration and leave the expression alone.

The target below shifts more than one value and adds the results. Let each
mnemonic choose the type of the value it shifts.

## Your task

Write `func_8019e9c0`, declaring each shifted value with the type its shift
demands, to reproduce the target assembly.

<!-- solution -->
```c
u32 func_8019e9c0(s32 a, u32 b) {
    return (a >> 3) + (b >> 3);
}
```
