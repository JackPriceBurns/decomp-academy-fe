---
id: 7da02445-6e9a-4995-82c3-91298cafc5f0
slug: types-halfwords
title: "lh and lhu: Loading Halfwords"
difficulty: 2
concepts:
  - types
  - loads
  - sign-extension
  - zero-extension
symbol: func_80368090
hints:
  - "There are two halfword loads, one signed and one unsigned, and their values go into a subtraction. Each mnemonic decides the declaration of its pointer."
  - "Check the operand order of the `subu`. It shows which loaded value is subtracted from which."
---

# The 16-bit loads

Halfwords are 16 bits wide. They are the usual width for coordinates, angles
and object IDs. Halfwords have the same pair of signed and unsigned loads, and
the loads follow the same rules:

```c
s32 read_level(s16 *p) {
    return p[1];
}
```

```asm
lh    v0, 2(a0)     # p[1]: sign-extended halfword, s16
jr    ra
nop
```

```c
s32 read_id(u16 *p) {
    return p[2];
}
```

```asm
lhu   v0, 4(a0)     # p[2]: zero-extended halfword, u16
jr    ra
nop
```

Besides the mnemonics, notice two things:

- **The stride is now 2.** `p[1]` became offset `2`, and `p[2]` became offset
  `4`. Divide the offset by the element size to get the index. Keep this
  division in mind, because the byte arrays of the last two lessons (stride 1)
  and the word arrays of the loop chapter (stride 4) all look alike at first
  glance.
- **You now have a load for every width:** `lb`/`lbu` for 1 byte, `lh`/`lhu`
  for 2, and `lw` for 4. There is no `lwu` in 32-bit code. A word already
  fills the register, so there is nothing to extend.

So a load tells you three things: the element width (from the mnemonic), the
signedness (also from the mnemonic), and the index (the offset ÷ the width).
Each load in a target works like a small declaration written in assembly.

The target loads through each of its pointers and returns their difference.
Read each mnemonic for its width and signedness.

## Your task

Write `func_80368090` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80368090(s16 *a, u16 *b) {
    return *a - *b;
}
```
