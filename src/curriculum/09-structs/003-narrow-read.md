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

A field's C type decides both its **size** and the **load instruction**. A
`u8` field is loaded with `lbz` (load byte, zero-extend); a `u16` with `lhz`
(load halfword). Given a packed color:

```c
typedef struct { u8 r; u8 g; u8 b; u8 a; } Color;
```

each byte is one wide, so `g` is at offset 1:

```asm
lbz  r3, 1(r3)   # load c->g
blr
```

This is a strong decompilation signal: an `lbz`/`lhz` at some offset tells you the
field there is a **`u8`/`u16`**, not an `int`. Use `u8` (not `char`) for a byte
loaded without arithmetic — `char` would drag in a spurious `extsb` sign-extend.

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
