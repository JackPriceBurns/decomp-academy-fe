---
id: c38517d6-69ac-45dc-8926-8e699b28817c
slug: gba-hardware-memory-map
title: The GBA's Memory Map
difficulty: 3
concepts:
  - memory-map
  - hardware
  - volatile
  - literal-pool
concept: true
---

# Everything is memory

The GBA has no I/O instructions. To turn the screen on, read the D-pad, start a
DMA transfer or set a palette colour, the program stores a number to an
address. The hardware watches the bus. When a write lands in its own region,
it reacts.

So the address map is the whole interface to the machine. It is small enough to
memorise:

| Base         | Region        | Size  | What lives there                      |
|--------------|---------------|-------|---------------------------------------|
| `0x02000000` | EWRAM         | 256K  | the big, slow work RAM                |
| `0x03000000` | IWRAM         | 32K   | the small, fast work RAM              |
| `0x04000000` | I/O registers | 1K    | display, DMA, timers, sound, keys     |
| `0x05000000` | Palette RAM   | 1K    | 256 background + 256 sprite colours   |
| `0x06000000` | VRAM          | 96K   | tiles, tilemaps, the framebuffer      |
| `0x07000000` | OAM           | 1K    | 128 sprite entries                    |
| `0x08000000` | ROM           | ≤32M  | the cartridge, code and data          |

Each of these bases is a byte shifted left. `0x05000000` is 160 << 19.
`0x04000000` is 128 << 19. `0x03000000` is 192 << 18. The regions are far
enough apart that this always works. That is why building a region base takes
two instructions and no memory access.

## Two ways to get an address

Thumb's `mov rN, #imm` holds eight bits, so it can only load 0 to 255. For a
larger constant, gcc has two options. It chooses between them by checking
whether the constant is a byte shifted left:

```asm
0        mov       r1, #160
2        lsl       r1, #19
4        mov       r0, #0
6        strh      r0, [r1, #0]
8        bx        lr
```

This code writes zero to the first palette entry. `mov r1, #160` followed by
`lsl r1, #19` builds 160 × 2^19 = `0x05000000` in two instructions, with no
memory access. Every region base in the table above is built this way. To read
such a pair, shift the byte left by the shift amount. You will do this in
nearly every function in this chapter.

An address that is not a byte times a power of two can't be built like this.
The compiler puts it in the literal pool instead:

```asm
0        ldr       r1, [pc, #4] (->8)
2        mov       r0, #1
4        strh      r0, [r1, #0]
6        bx        lr
8        .word     67109384
```

67109384 is `0x04000208`, the master interrupt-enable register. It is 0x208
bytes past the I/O base. Because of that offset, the full address is no longer
a byte times a power of two. So the compiler stores it after the code and loads
it relative to the PC. This gives a simple rule: `0x04000000` itself is built
with a `mov`/`lsl` pair, and nearly every other I/O register is loaded from a
`.word`.

## What the compiler must be told

A hardware register is not an ordinary variable. `0x04000006` reports the
scanline the display is drawing right now. It changes by itself roughly
fourteen thousand times a second: once per scanline, with 228 scanlines in a
frame and sixty frames a second. Nothing in the C program writes to it. An
optimiser may read it once and then reuse the value. That is what an optimiser
is designed to do, but here the result is a program that hangs forever. It
keeps checking a copy of the value in a CPU register, and that copy never
changes.

`volatile` tells the compiler that an access matters for more than the value it
moves. It means: do this load, do this store, in this order, and as many times
as the source says. The GBA has no cache and no memory attribute bits that mark
a region as I/O. So `volatile` on the pointer is the only way to say this. For
that reason, real GBA headers define every register as a dereference of a
volatile pointer, and real GBA source uses the keyword everywhere.

For matching, you can see `volatile` in the output. It shows up as loads that
were not merged, stores that were not removed, and loops that were not hoisted.
The rest of this chapter looks at each of these patterns.

One more pattern to recognise before you start:

```asm
0        mov       r0, #128
2        lsl       r0, #19
4        ldrh      r0, [r0, #0]
6        bx        lr
```

The first two instructions build `0x04000000`. The third reads the display
control register at that address, and the fourth returns. The base register
and the destination register are the same. The compiler can do this because the
address is no longer needed once the load has used it.
