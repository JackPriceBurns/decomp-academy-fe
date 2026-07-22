---
id: 55c07be7-279d-5f9c-8439-56ab2ab7586b
slug: structs-bitfield-read
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

Pulling a value out of a bitfield is the write run backwards. Load whichever word
the field lives in, spin that field down to bit 0, blank out everything else, and
a single `rlwinm` (rotate-left-immediate, then AND-mask) covers all of it at once.
Same struct shape as before:

```c
typedef struct { u32 r : 5; u32 g : 6; u32 b : 5; u32 a : 16; } Pixel;
```

No matter which field you're after, the steps don't move. In comes a word or
halfword; out comes the field, carved free by one `rlwinm`. Suppose it's `r` you
want, 5 bits wide, sitting right at the top of the first byte. That gives you:

```asm
lbz     r0, 0(r3)
rlwinm  r3, r0, 29, 27, 31
blr
```

Spelled out, `rlwinm rA, rS, SH, MB, ME` rotates `rS` left by `SH`, then holds
onto bits `MB..ME` and clears the rest. Rotating is how the field's bits arrive at
bit 31; the mask, meanwhile, ends up precisely the width of the field. Switch
fields and both of those operands move with it, which means you derive them from
where the field sits and how many bits it spans.

Now a wrinkle: a field already parked at the least-significant end may show up as
the extended mnemonic `clrlwi` in MWCC output, even though `rlwinm` is what's
really running. Either way, a solitary `rlwinm` chasing a load, with a mask
tighter than the bytes the load fetched, gives away a bitfield read nearly every
time.

## Your task

With `Pixel` above, write `Pixel_getG` so it compiles to the target `rlwinm`.

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
