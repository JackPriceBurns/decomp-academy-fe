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
  - "Full-width load, halfword store. Two pointers, one assignment."
  - "No mask, no shift pair — the store's width is the conversion."
---

# Memory to memory, shrinking on the way

Flip the direction — wide source, narrow destination — and the roles swap:
now the **store** does the converting, by the simple act of writing fewer
bytes. Here's `shrink_copy`, a word squeezed into a byte slot:

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

Again two instructions, and again no truncation idiom in sight — no
`andi`, no shift pair, even though a 32-bit value just became 8 bits.
That's the narrow-store rule from earlier in this chapter doing its quiet
work: `sb` *is* the truncation. The compiler only spends mask/shift
instructions when a narrowed value has to keep living **in a register**;
when the narrow value's next home is memory, the store handles it free.

That gives you a tidy diagnostic for any conversion you meet:

- Conversion at a **load**: extension, chosen by the load's mnemonic.
- Conversion at a **store**: truncation, silent, width per the mnemonic.
- Conversion **between registers**: the explicit idioms — `andi` masks,
  `sll`/`sra` pairs.

Find which of the three you're looking at and the C writes itself.

The target squeezes a word into a halfword slot. Same shape, one width
over.

## Your task

Write `func_802adb14` to reproduce the target assembly.

<!-- solution -->
```c
void func_802adb14(s16 *dst, s32 *src) {
    *dst = *src;
}
```
