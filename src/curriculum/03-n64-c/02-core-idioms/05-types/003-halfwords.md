---
id: 7da02445-6e9a-4995-82c3-91298cafc5f0
slug: types-halfwords
title: "lh and lhu: Halfwords"
difficulty: 2
concepts:
  - types
  - loads
  - sign-extension
  - zero-extension
symbol: func_80368090
hints:
  - "Two halfword loads, one of each signedness, feeding a subtraction. Each mnemonic picks its pointer's declaration."
  - "Watch the operand order on the `subu` — which loaded value is subtracted from which."
---

# The 16-bit pair

Halfwords — 16 bits, the workhorse width for coordinates, angles, and
object IDs — get the same signed/unsigned pair of loads, with the same
contract:

```c
s32 read_level(s16 *p) {
    return p[1];
}
```

```asm
lh    v0, 2(a0)     # p[1]: sign-extended halfword — s16
jr    ra
nop
```

```c
s32 read_id(u16 *p) {
    return p[2];
}
```

```asm
lhu   v0, 4(a0)     # p[2]: zero-extended halfword — u16
jr    ra
nop
```

Two things to notice beyond the mnemonics:

- **The stride is 2 now.** `p[1]` became offset `2`, `p[2]` became offset
  `4`. Offsets divide by the element size to give the index — keep that
  little division in your head, because the byte arrays of the last two
  lessons (stride 1) and the word arrays of the loop chapter (stride 4)
  all look alike at a glance.
- **The full width menu** is now yours: `lb`/`lbu` for 1 byte, `lh`/`lhu`
  for 2, `lw` for 4. (No `lwu` in 32-bit code — a word already fills the
  register, so there's nothing to extend.)

So a load tells you *three* things: the element width (mnemonic), the
signedness (mnemonic again), and the index (offset ÷ width). Every load in
a target is a little declaration, written in assembly.

The target loads through each of its pointers — read each mnemonic for
width and signedness — and returns their difference.

## Your task

Write `func_80368090` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80368090(s16 *a, u16 *b) {
    return *a - *b;
}
```
