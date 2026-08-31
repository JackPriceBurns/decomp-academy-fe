---
id: a840b82e-502d-51ef-aa00-514e48cf1e39
slug: structs-narrow-read
title: "Narrow Fields: Byte and Halfword Loads"
difficulty: 2
concepts:
  - structs
  - load
  - narrow-types
symbol: func_802102e0
hints:
  - "`g` is the second `u8`, so it sits at offset 1."
  - A `u8` field loads with `lbz r3, 1(r3)`.
---

# The field's type picks the load

A field's C type fixes its size and its load instruction. The narrow unsigned
types are the interesting case: an unsigned byte (`u8`) zero-extends through
`lbz` (load byte zero-extend); a `u16` does the same through `lhz` (load
halfword zero-extend). The offset pins the position; the mnemonic encodes width
and signedness.

Treat each mnemonic as evidence. An `lbz` at some offset says the field is a
`u8`; an `lhz` says `u16`; neither is a plain `int`. One trap: don't model an
unsigned byte as `char` — in MWCC `char` is signed, so the compiler may tack a
stray `extsb` onto the load.

The snippet below reads the third byte field of the `Color` struct, at offset
2:

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

Offset 2 resolves to `b`, since `r` is byte 0 and `g` is byte 1. Apply the same
reading to the target assembly to see which field its offset names.

## Your task

Using the `Color` struct provided, write `func_802102e0` to match the target.

<!-- solution -->
```c
u8 func_802102e0(Color* c) {
    return c->g;
}
```

<!-- context -->
```c
typedef struct { u8 r; u8 g; u8 b; u8 a; } Color;
```
