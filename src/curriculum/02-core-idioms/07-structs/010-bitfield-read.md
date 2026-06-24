---
id: structs-bitfield-read
title: "Reading a Bitfield: rlwinm Extract"
difficulty: 3
concepts:
  - structs
  - bitfields
  - rlwinm
symbol: Pixel_getG
hints:
  - "Read the whole field: `return p->g;`."
  - Extraction is `lhz` then `rlwinm r3, r0, 27, 26, 31`.
---

# Reading is rotate-then-mask

Reading a bitfield is the mirror of writing it: load the containing word, then
**rotate the field down to bit 0 and mask off everything else** with a single
`rlwinm` (rotate-left-immediate-then-AND-mask). Given:

```c
typedef struct { u32 r : 5; u32 g : 6; u32 b : 5; u32 a : 16; } Pixel;
```

Each read follows the same pattern: load a word or halfword, then extract with
`rlwinm`. The first field (`r`, 5 bits) sits at the most-significant end of the
first byte. Reading it produces:

```asm
lbz     r0, 0(r3)
rlwinm  r3, r0, 29, 27, 31
blr
```

Read `rlwinm rA, rS, SH, MB, ME` as "rotate `rS` left by `SH`, then keep only
bits `MB..ME`, zeroing the rest". The rotation brings the field's bits down to
bit 31, and the mask width equals the field's bit width. Different fields produce
different rotate amounts and mask bounds — derive them from the field's position
and width in the struct.

(For a field already sitting at the least-significant position, MWCC may print
the extended mnemonic `clrlwi` — it's still `rlwinm` underneath.) A lone
`rlwinm` after a load, with a mask narrower than the load width, almost always
means **read a bitfield**.

## Your task

With `Pixel` above, write `Pixel_getG` so it compiles to the target `rlwinm`.

<!-- starter -->
```c
u32 Pixel_getG(Pixel* p) {
    return 0;
}
```

<!-- solution -->
```c
u32 Pixel_getG(Pixel* p) {
    return p->g;
}
```

<!-- context -->
```c
typedef struct { u32 r : 5; u32 g : 6; u32 b : 5; u32 a : 16; } Pixel;
```
