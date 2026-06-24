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

`g` occupies bits 5..10. Reading `p->g` loads the halfword and extracts it:

```asm
lhz     r0, 0(r3)
rlwinm  r3, r0, 27, 26, 31   # rotate g down, keep 6 bits
blr
```

The rotate amount realigns the field, and the `26, 31` mask keeps exactly its 6
bits. (For a field already sitting against bit 0, MWCC prints the simpler
extended mnemonic `clrlwi` — still a `rlwinm` underneath.) A lone `rlwinm` after a
load, with a mask narrower than the load width, almost always means **read a
bitfield**.

## Your task

With `Pixel` above, write `Pixel_getG` so it compiles to the `rlwinm` above.

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
