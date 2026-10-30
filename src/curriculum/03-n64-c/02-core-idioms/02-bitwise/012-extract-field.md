---
id: 9ec9cac5-9df2-420b-a36a-84f6f6033834
slug: bitwise-extract-field
title: Extracting a Field
difficulty: 2
concepts:
  - bitwise
  - shifts
  - masks
symbol: func_803b2728
hints:
  - "Shift first, then mask. The `srl` amount is the field's starting bit, and the `andi` immediate is a solid run of ones as wide as the field."
  - "`srl` is a type oracle here too: the shifted value is unsigned in the C."
---

# Reading a field back out

The last lesson packed values in. This one takes them out again. To read a
field from the middle of a word, the compiler shifts it down to bit 0 and then
clears everything above it: **shift, then mask**. Here is a 4-bit field that
starts at bit 12:

```asm
srl  v0, a0, 12     # shift the field down to bit 0
andi t6, v0, 0xf    # clip to the field's width: 4 ones = 4 bits
or   v0, t6, zero   # IDO's usual copy into the return register
jr   ra
nop
```

The two constants tell you exactly where the field is:

- **The shift amount is the position.** This field starts at bit 12.
- **The mask is the width.** `0xf` is four ones, so the field is 4 bits wide.
  A mask for extracting a field is always a solid run of ones starting at
  bit 0. Count the ones to get the width of the field.

In C this is `(x >> 12) & 0xf`. The same pattern works for any field: an
`srl` followed by an `andi` with a solid run of ones is a field read.
(Because the shift is `srl`, the type oracle from earlier applies too: the
value being taken apart is unsigned in the C.)

Learn to recognize one special case on sight. A mask of `0x1` extracts a
single bit. It is the same shift and mask idiom, with a field only one bit
wide.

The target reads a different field, with a different position and a
different width. Read both constants and write the two steps in C.

## Your task

Write `func_803b2728` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_803b2728(u32 x) {
    return (x >> 6) & 0x3f;
}
```
