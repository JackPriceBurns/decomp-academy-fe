---
id: 01ad242b-8cd3-4935-938f-960ed12ca191
slug: gba-bitwise-extract-signed
title: A Field That Keeps Its Sign
difficulty: 3
concepts:
  - shifts
  - bitfields
  - signedness
symbol: func_080fb20c
hints:
  - Both fields have the same width but sit at different offsets. Work out each
    field's low bit from the difference between its two shift amounts.
  - The function takes one argument and returns an `s32`. Two signed fields are
    extracted from that argument, and the second is subtracted from the first.
---

# asr on the way down

If you replace the `lsr` of a field extraction with an `asr`, the field comes
out signed. The left shift does two jobs. It throws away the bits above the
field, *and* it puts the field's top bit at bit 31. That is exactly the bit that
`asr` reads to decide what to shift in.

```asm
0        lsl       r0, #21
2        asr       r0, #27
4        bx        lr
```

The arithmetic is the same as before. The width is 32 minus 27, so 5 bits. The
low bit is 27 minus 21, so bit 6. The field is a 5-bit signed number at bits 6
through 10, so a value of `0x1F` in it reads as -1 instead of 31.

GBA code stores small signed values this way, for example a velocity, a sprite
offset, or a delta in a packed animation table. Once a field is signed, it must
stay signed all the way through your C. A right shift on a `u32` gives `lsr`,
whatever you do with the result afterwards. So the value has to be signed
before the shift happens. Either the expression is cast on the way in, or the
value being shifted was declared signed in the first place. Both forms produce
the same instructions here, so use whichever reads better.

Here is a wider field, taken from a value that was already signed:

```asm
0        lsl       r0, #8
2        asr       r0, #24
4        bx        lr
```

The width is 8 and the low bit is 16, so this is the signed byte in bits 16
through 23. This is different from loading an `s8`. Nothing was read from
memory. The byte was already in a register, and the shift pair cut it out.

Your target cuts two of these out of one incoming word. Decode each pair on its
own before you write any C.

## Your task

Write `func_080fb20c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_080fb20c(u32 v) {
    return ((s32)(v << 16) >> 28) - ((s32)(v << 24) >> 28);
}
```
