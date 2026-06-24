---
id: structs-narrow-read
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

A field's C type decides both its **size** and the **load instruction**. For
`u8` fields (one byte, unsigned) the compiler emits `lbz` (*load byte
zero-extend*). For `u16` fields (two bytes, unsigned) it emits `lhz` (*load
halfword zero-extend*). The offset in the instruction gives you the field's
position; the instruction mnemonic gives you its width and signedness.

An `lbz`/`lhz` is a strong decompilation signal: the field at that offset is
`u8`/`u16`, not `int`. Avoid `char` for an unsigned byte — `char` is
implementation-defined and would produce a spurious `extsb` sign-extension after
the load.

Here is an example reading the *third* byte field of the same Color struct
(offset 2):

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

The offset 2 corresponds to `b` because `r` occupies byte 0 and `g` byte 1.
Now inspect the target assembly and determine which field its offset points to.

## Your task

With the `Color` struct above, write `Color_getG` to match the target.

<!-- starter -->
```c
u8 Color_getG(Color* c) {
    return 0;
}
```

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
