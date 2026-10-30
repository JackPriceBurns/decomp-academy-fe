---
id: 2688ed62-464c-4507-b11c-47f7903abb80
slug: gba-types-load-signed-byte
title: A Signed Byte Costs Two More Instructions
difficulty: 2
concepts:
  - narrow-types
  - sign-extension
  - loads
symbol: func_081b6b14
hints:
  - "The `lsl #24` / `asr #24` pair only sign-extends the byte that was just
    loaded. Read the instruction after the pair to see what the function
    computes."
  - The arguments are an `s8 *` and an `s32`, in that order. The function
    returns an `s32`.
---

# Sign extension by shifting

`ldrb` clears the top 24 bits of the register. That is wrong for a signed byte.
The value -1 is stored in memory as the byte `0xFF`, and after `ldrb` the
register holds 255. The value has to be fixed, and ARMv4T Thumb has no
instruction that does it.

It does have a barrel shifter. First shift the byte left by 24, so its sign bit
moves into bit 31. Then shift right by 24 with `asr`, which fills the top bits
with copies of bit 31 as it shifts. The byte is back at the bottom of the
register, and every bit above it is a copy of its sign bit. That costs two
extra instructions after the load. You will see these three instructions
together very often.

Here are two functions that do the same job through pointers of different
signedness:

```asm
0        ldrb      r0, [r0, #3]
2        lsl       r0, #24
4        asr       r0, #24
6        add       r0, #100
8        bx        lr
```

```asm
0        ldrb      r0, [r0, #3]
2        add       r0, #100
4        bx        lr
```

The first reads through an `s8 *` and the second through a `u8 *`. The offset
and the added constant are the same. The signed version is four bytes longer
because of the pair of shifts. Both loads are `ldrb`, so here the load
instruction tells you nothing about signedness. Only the shifts after it show
that the byte is signed.

The shift counts match the width: the count is 32 minus 8, which is 24. Remember
this, because for the rest of the chapter you will use it in both directions,
from width to shift count and from shift count back to width. `lsl #24` /
`asr #24` means a signed byte, and `lsl #16` / `asr #16` will mean a signed
halfword.

Your target starts with the same pattern: a byte load and a pair of shifts. Read
the instruction that comes after them.

## Your task

Write `func_081b6b14` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081b6b14(s8 *p, s32 base) {
    return *p + base;
}
```
