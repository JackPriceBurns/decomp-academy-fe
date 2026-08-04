---
id: 55c07be7-279d-5f9c-8439-56ab2ab7586b
slug: structs-bitfield-read
title: "Reading a Bitfield: rlwinm Extract"
difficulty: 3
concepts:
  - structs
  - bitfields
  - rlwinm
symbol: func_801701ec
hints:
  - "Read the whole field: `return p->g;`."
  - Extraction is `lhz` then `rlwinm r3, r0, 27, 26, 31`.
---

# Reading is rotate-then-mask

Pulling a value out of a bitfield is the write run backwards. Load the word the
field lives in, spin the field down to bit 0, blank out everything else — one
`rlwinm` covers it. Same struct shape:

```c
typedef struct { u32 r : 5; u32 g : 6; u32 b : 5; u32 a : 16; } Pixel;
```

No matter which field you want, the steps don't change. In comes a word or
halfword; out comes the field, carved free by one `rlwinm`. Suppose you want `r`,
5 bits wide, sitting at the top of the first byte:

```asm
lbz     r0, 0(r3)
rlwinm  r3, r0, 29, 27, 31
blr
```

`rlwinm rA, rS, SH, MB, ME` rotates `rS` left by `SH`, then keeps bits `MB..ME` and
clears the rest. Rotation brings the field's bits down to bit 31; the mask ends up
exactly the width of the field. Switch fields and both operands move with it,
derived from where the field sits and how many bits it spans.

One wrinkle: a field already at the least-significant end may show up as the
extended mnemonic `clrlwi` in MWCC output, though `rlwinm` is what's really running.
Either way, a solitary `rlwinm` after a load, with a mask tighter than the bytes
fetched, gives away a bitfield read.

## Your task

With `Pixel` above, write `func_801701ec` so it compiles to the target `rlwinm`.

<!-- solution -->
```c
u32 func_801701ec(Pixel* p) {
    return p->g;
}
```

<!-- context -->
```c
typedef struct { u32 r : 5; u32 g : 6; u32 b : 5; u32 a : 16; } Pixel;
```
