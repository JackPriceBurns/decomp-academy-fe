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
  - "Shift first, then mask — the srl amount is the field's starting bit, the andi immediate is a solid run of ones as wide as the field."
  - "`srl` runs the type oracle: the shifted value is unsigned in the C."
---

# Reading a field back out

Last lesson packed values in; this one pulls them out. To read a field that
lives somewhere in the middle of a word, the compiler slides it down to bit 0
and clips off whatever sat above it — **shift, then mask**. Here's a 4-bit
field that lives at bit 12:

```asm
srl  v0, a0, 12     # slide the field down to bit 0
andi t6, v0, 0xf    # clip to the field's width — 4 ones = 4 bits
or   v0, t6, zero   # IDO's usual copy into the return register
jr   ra
nop
```

The two constants tell you everything about where the field lives:

- **The shift amount is the position** — this field starts at bit 12.
- **The mask is the width** — `0xf` is four ones, so the field is 4 bits
  wide. Extraction masks are always a solid run of ones anchored at bit 0;
  count the ones and you've measured the field.

In C that's exactly `(x >> 12) & 0xf`, and the pattern generalizes: any
`srl`-then-`andi` pair with a solid-ones mask is a field read. (The shift
being `srl` also runs the type oracle from earlier — the value being taken
apart is unsigned in the C.)

One special case worth recognizing on sight: a mask of `0x1` extracts a
single bit — shift-and-mask with width one. Same idiom, narrowest possible
field.

The target reads a different field: different position, different width.
Measure both constants and write the two-step in C.

## Your task

Write `func_803b2728` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_803b2728(u32 x) {
    return (x >> 6) & 0x3f;
}
```
