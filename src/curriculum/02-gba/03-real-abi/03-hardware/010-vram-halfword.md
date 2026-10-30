---
id: 5739cd30-7e6f-44a1-ab58-f62db432b67b
slug: gba-hardware-vram-halfword
title: VRAM Will Not Take a Byte
difficulty: 5
concepts:
  - hardware
  - vram
  - bitwise
symbol: func_0837e14c
hints:
  - "The mask decides which half of the halfword is kept in the merge. Look at
    the shift that follows the `mov` of 255 to see which byte is kept. The value
    being ored in goes into the other byte."
  - "Two `u32` coordinates and a `u8` colour go in, and nothing comes out. The
    framebuffer starts at 0x06000000, a mode 4 row is 120 halfwords wide, and
    the target halfword is found by pointer arithmetic on a `vu16 *`."
---

# The region that only accepts sixteen bits

VRAM, palette RAM and OAM are connected to the bus sixteen bits at a time. A
`strb` into any of them does not store a single byte. Depending on the region
and the video mode, the write is either dropped or copied into both halves.
Either way, it is not what the programmer meant. The GBA's own BIOS and every
serious engine handle this the same way: read the halfword, replace the byte
you want to change, and write the halfword back.

Mode 4 makes this unavoidable. The screen is 240 by 160 palette indices of one
byte each, starting at `0x06000000`. So two pixels that sit next to each other
on a row share one halfword, and neither can be written on its own.

Here is that read-merge-write on a fixed address, replacing the high byte:

```asm
0        lsl       r0, #24
2        ldr       r3, [pc, #16] (->20)
4        ldrh      r2, [r3, #0]
6        mov       r1, #255
8        and       r1, r2
10       lsr       r0, #16
12       orr       r1, r0
14       strh      r1, [r3, #0]
16       bx        lr
18       .hword    0
20       .word     100704256
```

The code does three jobs, and their instructions are mixed together. `ldrh r2`
loads the current halfword. `mov r1, #255` / `and r1, r2` keeps its low byte
and discards the half that is about to be overwritten. `lsl r0, #24` /
`lsr r0, #16` is the unbalanced pair from the window-register lesson. It
zero-extends an eight-bit parameter and shifts it up by eight. `orr` joins the
kept half to the new one, and `strh` writes the result back.

The two constants change together, so reading one tells you the other. A mask
that fits in a single `mov` keeps the low byte. The incoming value must then be
shifted up into the high byte. A mask that needs a `mov`/`lsl` pair keeps the
high byte. The incoming value then goes into the low byte, where it already
is, so its `lsl`/`lsr` pair is balanced. Read the mask first, and the shifts
will agree with it.

100704256 is `0x0600A000`, forty kilobytes into VRAM. Any VRAM address other
than the region base itself needs a pool word. An address computed at run time
takes real instructions before the merge can start. gcc turns the multiplies
into shifts and subtracts, so read that opening run of instructions as one
index expression instead of as separate steps.

Your target does all of that before it reaches the merge.

## Your task

Write `func_0837e14c` to reproduce the target assembly.

<!-- solution -->
```c
void func_0837e14c(u32 x, u32 y, u8 color)
{
    vu16 *p = (vu16 *)0x06000000 + (y * 120 + (x >> 1));
    *p = (*p & 0xFF00) | color;
}
```
