---
id: 8ab6c5ee-254c-4dcc-91d1-a48c9d0165f6
slug: types-narrowing-copy
title: "Narrowing Copies: The Store Converts"
difficulty: 2
concepts:
  - types
  - loads
  - stores
symbol: func_802adb14
hints:
  - "There is a full-width load and a halfword store. There are two pointers and one assignment."
  - "There is no mask and no shift pair. The store's width does the conversion."
---

# Memory to memory, getting narrower

Now reverse the direction, with a wide source and a narrow destination. This
time the **store** does the conversion, because it writes fewer bytes. Here is
`shrink_copy`, which copies a word into a byte slot:

```c
void shrink_copy(u8 *dst, s32 *src) {
    *dst = *src;
}
```

```asm
lw    t6, 0(a1)     # full 32-bit load
sb    t6, 0(a0)     # store keeps only the low byte
jr    ra
nop
```

Again there are two instructions, and again there is no truncation idiom: no
`andi` and no shift pair, even though a 32-bit value has just become 8 bits.
This is the narrow-store rule from earlier in this chapter: `sb` itself does
the truncation. The compiler only spends mask or shift instructions when a
narrowed value has to stay **in a register**. When the narrow value goes
straight to memory, the store does the conversion for free.

This gives you a simple way to classify any conversion you find:

- Conversion at a **load**: extension, chosen by the load's mnemonic.
- Conversion at a **store**: truncation, with no extra instructions. The
  mnemonic gives the width.
- Conversion **between registers**: the explicit idioms, which are `andi`
  masks and `sll`/`sra` pairs.

Work out which of the three cases you are looking at, and the C follows
directly from it.

The target has the same shape as the example, at a different width. Read each
mnemonic to find the widths.

## Your task

Write `func_802adb14` to reproduce the target assembly.

<!-- solution -->
```c
void func_802adb14(s16 *dst, s32 *src) {
    *dst = *src;
}
```
