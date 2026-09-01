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

The GBA has no I/O instructions. Turning the screen on, reading the D-pad,
kicking off a DMA transfer and setting a palette colour are all done by storing
a number to an address. The hardware watches the bus, sees the write land in its
own region, and reacts.

That makes the address map the machine's entire API, and it is small enough to
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

Every one of those bases is a byte shifted left. `0x05000000` is 160 << 19.
`0x04000000` is 128 << 19. `0x03000000` is 192 << 18. The regions are spaced
far enough apart that this always works out, which is why building a region
base costs two instructions and no memory at all.

## Two ways an address arrives

Thumb's `mov rN, #imm` carries eight bits, so it can load 0 through 255 and
nothing else. For anything larger gcc has two routes available, and it picks
between them by asking whether the constant is a byte shifted left:

```asm
0        mov       r1, #160
2        lsl       r1, #19
4        mov       r0, #0
6        strh      r0, [r1, #0]
8        bx        lr
```

That is a write of zero to the first palette entry. `mov r1, #160` then
`lsl r1, #19` builds 160 × 2^19 = `0x05000000` in two instructions, with no
memory access at all. Every region base in the table above materialises this
way, and reading such a pair backwards — shift the byte left by the shift
amount — is a skill you will use in nearly every function in this chapter.

An address that is not a byte times a power of two cannot be built that way, so
it goes into the literal pool instead:

```asm
0        ldr       r1, [pc, #4] (->8)
2        mov       r0, #1
4        strh      r0, [r1, #0]
6        bx        lr
8        .word     67109384
```

67109384 is `0x04000208`, the master interrupt-enable register. It sits 0x208
bytes past the I/O base, and that offset is enough to stop the whole address
being a byte times a power of two, so the compiler parks it after the code and
loads it PC-relative. The consequence is worth stating plainly: `0x04000000`
itself arrives as a `mov`/`lsl` pair, and nearly every other I/O register
arrives as a `.word`.

## What the compiler must be told

A hardware register is not an ordinary variable. `0x04000006` reports the
scanline the display is currently drawing, and it changes on its own roughly
fourteen thousand times a second — once per scanline, 228 scanlines to a frame,
sixty frames a second. Nothing in the C program writes it. An optimiser
that reads it once and reuses the value is doing exactly what it was designed to
do, and it produces a program that hangs forever waiting for a number that will
never change in a register it stopped reading.

`volatile` is how you tell the compiler that an access has a meaning beyond its
value: perform this load, perform this store, in this order, once per time the
source says so. The GBA has no cache and no memory-mapped-I/O attribute bits, so
`volatile` on the pointer is the only mechanism that exists. Real GBA headers
therefore define every register as a volatile pointer dereference, and real GBA
source is full of the keyword.

For matching, `volatile` is visible in the output. It shows up as loads that
were not merged, stores that were not eliminated, and loops that were not
hoisted. The rest of this chapter is a tour of those fingerprints.

One last shape to recognise before you start:

```asm
0        mov       r0, #128
2        lsl       r0, #19
4        ldrh      r0, [r0, #0]
6        bx        lr
```

Two instructions build `0x04000000`, one reads the display control register
living there, and the fourth returns. The base register and the destination are
the same, because the address is dead the moment the load has used it.
