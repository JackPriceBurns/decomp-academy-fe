---
id: 8cba5435-bc4e-4e0c-b9f0-e9addd7b01d7
slug: gba-mastery-palette-fade
title: Fading a Palette
difficulty: 4
concepts:
  - bitfields
  - fixed-point
  - narrow-types
hints:
  - "Three `mul` instructions means three channels. For each one, a five-bit
    field is extracted, scaled, and put back in its original position."
  - "The `lsr #4` after each `mul` makes the scale a 1.4 fixed-point factor: 16
    is full brightness and 8 is half. Every right shift that extracts a channel
    is sixteen more than the shift in the source. The `lsr #4` and the two
    `lsl` near the end use the source's own counts."
  - "A `u16` colour and a `u32` level go in, and a `u16` comes out. Red is bits
    0-4, green is 5-9 and blue is 10-14. The three results are combined again
    with `|`."
symbol: func_08408258
---

# Fading a colour

A GBA palette entry is a halfword in BGR555 format. It has five bits of red at
the bottom, five bits of green above that, five bits of blue above that, and an
unused top bit. To fade a picture to black, the game goes through the palette
and scales all three channels of every entry by the same factor. That is the
routine you are about to match.

To unpack a channel, the code uses a shift and a mask. agbcc has a habit that
makes these hard to recognise at first. A `u16` parameter arrives in a 32-bit
register, and the bits above bit 15 might hold garbage. So the compiler
zero-extends it with `lsl #16` / `lsr #16`. When the next operation is a right
shift, the compiler combines the two:

```asm
0        lsl       r0, #16
2        lsr       r0, #21
4        mov       r1, #31
6        and       r0, r1
8        bx        lr
```

Read these two shifts as one field extraction. `lsl #16` then `lsr #21` moves
the value right by five in total, and it also discards everything above bit 15.
So the source shifted right by **five**, and the extra sixteen comes from the
narrowing. Subtract 16 from any `lsr` that follows an `lsl #16`, and you get the
shift the programmer wrote.

This is harder to read when several fields come from the same value. Here is a
routine that swaps a colour's red and blue channels:

```asm
0        mov       r1, r0
2        lsl       r1, #16
4        lsr       r3, r1, #16
6        mov       r0, #31
8        mov       r2, #31
10       and       r2, r3
12       lsr       r1, #26
14       and       r1, r0
16       mov       r0, #248
18       lsl       r0, #2
20       and       r0, r3
22       orr       r0, r1
24       lsl       r2, #10
26       orr       r0, r2
28       bx        lr
```

From offset 2 until offset 12, `r1` holds the colour shifted **up** by sixteen.
At offset 12, blue is shifted straight out of it. `lsr r1, #26` is bit 10,
measured against that shifted copy. The plain value is shifted back down once
into `r3`, and the two fields that need it both use it. So one live register
holds the input in a form that does not appear in the source, and every
constant used with it has sixteen added.

Your target does this three times, once for each channel, with a `mul` in the
middle of each one. Work out the shift counts before you try to guess the
source. Also remember that a `lsl` at the very end of a function usually
narrows the result to the return type, so it is not part of the calculation.

## Your task

Write `func_08408258` to reproduce the target assembly.

<!-- solution -->
```c
u16 func_08408258(u16 color, u32 level)
{
    u32 r = (color & 31) * level >> 4;
    u32 g = ((color >> 5) & 31) * level >> 4;
    u32 b = ((color >> 10) & 31) * level >> 4;
    return r | (g << 5) | (b << 10);
}
```
