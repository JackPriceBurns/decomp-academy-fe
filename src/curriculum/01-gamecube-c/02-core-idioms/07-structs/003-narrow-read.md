---
id: a840b82e-502d-51ef-aa00-514e48cf1e39
slug: structs-narrow-read
title: "Narrow Fields: Byte and Halfword Loads"
difficulty: 2
concepts:
  - structs
  - load
  - narrow-types
symbol: Color_getG
hints:
  - "`g` is the second `u8`, so it sits at offset 1."
  - A `u8` field loads with `lbz r3, 1(r3)`.
---

# The field's type picks the load

A field's C type settles its **size** and its **load instruction** at once. The
narrow unsigned types are the interesting case. An unsigned byte (`u8`)
zero-extends through `lbz` (*load byte zero-extend*), and a two-byte `u16`
through `lhz` (*load halfword zero-extend*). The offset pins the position; the
mnemonic encodes width and signedness.

Either mnemonic is worth treating as evidence. An `lbz` at some offset says the
field is a `u8`, an `lhz` says `u16`, and neither is a plain `int`. One trap to
sidestep is modeling an unsigned byte as `char`. Its signedness is
implementation-defined, so the compiler can slip in a stray `extsb` to
sign-extend after the load.

The snippet below reads the *third* byte field of the same Color struct, at
offset 2:

```c
typedef struct { u8 r; u8 g; u8 b; u8 a; } Color;

u8 Color_getB(Color* c) {
    return c->b;
}
```

```asm
lbz     r3,2(r3)    # load c->b (offset 2)
blr
```

That offset 2 resolves to `b`, given that `r` sits in byte 0 and `g` in byte 1.
Apply the same reading to the target assembly to see which field its offset
names.

## Your task

With the `Color` struct above, write `Color_getG` to match the target.

<!-- solution -->
```c
u8 Color_getG(Color* c) {
    return c->g;
}
```

<!-- context -->
```c
typedef struct { u8 r; u8 g; u8 b; u8 a; } Color;
```
