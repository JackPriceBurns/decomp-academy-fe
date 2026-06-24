---
id: structs-narrow-write
title: Storing a Byte Field
difficulty: 2
concepts:
  - structs
  - store
  - narrow-types
symbol: Color_setB
hints:
  - "`b` is the third byte, so it sits at offset 2."
  - A `u8` store is `stb r4, 2(r3)`.
---

# Byte stores and field alignment

Just as `lbz` reads a byte, **`stb`** writes one. The type still controls the
width. Reusing the color struct:

```c
typedef struct { u8 r; u8 g; u8 b; u8 a; } Color;
```

`b` is the third byte, offset 2, so `c->b = v` is:

```asm
stb  r4, 2(r3)   # c->b = v
blr
```

Watch alignment when fields have mixed widths: a `u16` cannot start at an odd
offset, so the compiler inserts padding. In `{ u8 flags; u16 hp; }` the `hp`
field lands at offset **2**, not 1 — a hidden pad byte sits between them. Getting
those offsets right is what makes the loads and stores line up.

## Your task

With the `Color` struct above, write `Color_setB` storing `v` into `c->b`.

<!-- starter -->
```c
void Color_setB(Color* c, u8 v) {
}
```

<!-- solution -->
```c
void Color_setB(Color* c, u8 v) {
    c->b = v;
}
```

<!-- context -->
```c
typedef struct { u8 r; u8 g; u8 b; u8 a; } Color;
```
