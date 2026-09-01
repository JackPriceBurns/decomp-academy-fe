---
id: 2688ed62-464c-4507-b11c-47f7903abb80
slug: gba-types-load-signed-byte
title: A Signed Byte Costs Two More
difficulty: 2
concepts:
  - narrow-types
  - sign-extension
  - loads
symbol: func_081b6b14
hints:
  - "The `lsl #24` / `asr #24` pair sign-extends the byte that was just loaded rather than computing anything with it. Read the instruction after it to see what the function actually computes."
  - An `s8 *` and an `s32`, in that order, returning an `s32`.
---

# Sign extension by shifting

`ldrb` clears the top 24 bits of the register, which is exactly wrong for a
signed byte: -1 stored in memory is the byte `0xFF`, and after `ldrb` the
register holds 255. The value has to be repaired, and ARMv4T Thumb has no
instruction for repairing it.

What it does have is a barrel shifter. Shift the byte left by 24 so its sign bit
lands in bit 31, then shift right by 24 with `asr`, which copies bit 31 down as
it goes. The byte arrives back at the bottom of the register with its sign
smeared across the top. Two extra instructions on top of the load, and you will
meet the trio constantly.

Two functions doing the same job through pointers of different signedness:

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

The first reads through an `s8 *`, the second through a `u8 *`. Same offset,
same constant added, and the signed version pays four extra bytes of code for
the pair of shifts. Both loads are `ldrb` - the load instruction says nothing
about signedness here, and the shifts that follow are the whole tell.

Notice that the shift counts agree with the width: 32 - 8 = 24. That number is
worth memorising, because you will be solving for it in both directions for the
rest of the chapter. `lsl #24` / `asr #24` is a signed byte; `lsl #16` /
`asr #16` will be a signed halfword.

Your target opens with the same shape - a byte load and a shift pair. Read the
instruction that follows it.

## Your task

Write `func_081b6b14` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081b6b14(s8 *p, s32 base) {
    return *p + base;
}
```
