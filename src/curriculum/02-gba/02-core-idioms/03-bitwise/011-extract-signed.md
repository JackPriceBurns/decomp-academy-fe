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
  - Both fields are the same width and sit at different offsets. Work out each
    one's low bit from the difference between its two shift amounts.
  - One argument in, an `s32` out. Two signed fields are extracted from that
    argument and the second is subtracted from the first.
---

# asr on the way down

Swap the `lsr` of a field extraction for an `asr` and the field comes out
signed. The left shift is doing double duty: it discards the bits above the
field *and* parks the field's top bit at bit 31, which is exactly where `asr`
looks to decide what to feed in.

```asm
0        lsl       r0, #21
2        asr       r0, #27
4        bx        lr
```

The arithmetic is the one you already know. Width is 32 minus 27, so 5 bits;
low bit is 27 minus 21, so bit 6. The field is a 5-bit signed number living at
bits 6 through 10, and a value of `0x1F` in it reads as -1 rather than 31.

This is how GBA code stores small signed quantities — a velocity, a sprite
offset, a delta in a packed animation table — and once a field is signed it must
stay signed all the way through your C. A right shift on a `u32` gives `lsr` no
matter what you do with the result afterwards, so the value has to be signed
before the shift happens: either the expression is cast on the way in, or the
thing being shifted was declared signed to start with. Both spellings produce
the same instructions here, so match whichever reads better.

A wider one, from a value that was already signed:

```asm
0        lsl       r0, #8
2        asr       r0, #24
4        bx        lr
```

Width 8, low bit 16 — the signed byte in bits 16 through 23. Note that this is
not the same as loading an `s8`; nothing was fetched from memory, the byte was
already sitting in a register and the shift pair carved it out.

Your target carves two of these out of one incoming word. Decode each pair on
its own before you write a line.

## Your task

Write `func_080fb20c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_080fb20c(u32 v) {
    return ((s32)(v << 16) >> 28) - ((s32)(v << 24) >> 28);
}
```
