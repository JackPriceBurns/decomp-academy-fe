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
  - Three `mul` instructions, three channels. Each one is a five-bit field
    pulled out, scaled, and pushed back where it came from.
  - "The `lsr #4` after each `mul` makes the scale a 1.4 fixed-point factor -
    16 is full brightness, 8 is half. And every right shift that pulls a channel
    out is sixteen more than the one the source wrote; the `lsr #4` and the two
    `lsl` near the end are the source's own counts."
  - "A `u16` colour and a `u32` level go in and a `u16` comes out. Red is bits
    0-4, green 5-9, blue 10-14, and the three results are recombined with `|`."
symbol: func_08408258
---

# Fading a colour

A GBA palette entry is a halfword in BGR555: five bits of red at the bottom,
five of green above it, five of blue above that, and the top bit unused. Fading
a picture to black means walking the palette and scaling all three channels of
every entry by the same factor - which is exactly the routine you are about to
match.

Unpacking a channel is a shift and a mask, and agbcc has a habit that makes
those unrecognisable at first sight. A `u16` parameter arrives in a 32-bit
register with garbage possibly above bit 15, so the compiler zero-extends it
with `lsl #16` / `lsr #16`. When the very next thing you do is shift right, it
folds the two together:

```asm
0        lsl       r0, #16
2        lsr       r0, #21
4        mov       r1, #31
6        and       r0, r1
8        bx        lr
```

That is one field extraction, not two shifts. `lsl #16` then `lsr #21` moves the
value right by five overall while discarding everything above bit 15, so the
source shifted right by **five** - the extra sixteen is the narrowing coming
along for the ride. Subtract 16 from any `lsr` that follows an `lsl #16` and you
have the shift the programmer typed.

It gets stranger when several fields come out of the same value. Here is a
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

`r1` holds the colour shifted **up** by sixteen from offset 2 until offset 12,
where blue is shifted straight out of it. `lsr r1, #26` is bit 10 measured
against that pre-shifted copy. The plain value is pulled back down once into
`r3` and reused for the two fields that need it. So one live register carries
the input in a form nobody wrote, and every constant near it has been rebased
by sixteen.

Your target does this three times over, once per channel, with a `mul` in the
middle of each. Do the arithmetic on the shift counts before you try to guess
the source, and remember that a `lsl` at the very end of a function is usually
the return type narrowing rather than part of the value.

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
