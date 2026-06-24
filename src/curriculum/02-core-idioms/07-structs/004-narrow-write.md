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
width. Consider this color struct:

```c
typedef struct { u8 r; u8 g; u8 b; u8 a; } Color;
```

Each field is one byte, laid out in declaration order. The **offset** of a field
is how many bytes from the struct's start it sits. Fields are packed sequentially
here, so `r` is at 0, `g` at 1, `b` at 2, `a` at 3.

A `stb` instruction stores a single byte: `stb rS, offset(rA)`. The displacement
directly encodes which field is being written — read the offset to figure out
which field the store targets. For example, writing the last byte (offset 3)
produces:

```asm
stb  r4, 3(r3)
blr
```

To reconstruct any `stb`, count bytes from the struct's start until you reach the
displacement shown in the instruction. That tells you the field.

Watch alignment when fields have mixed widths: a `u16` cannot start at an odd
offset, so the compiler inserts padding. In `{ u8 flags; u16 hp; }` the `hp`
field lands at offset **2**, not 1 — a hidden pad byte sits between them. Getting
those offsets right is what makes the loads and stores line up.

## Your task

With the `Color` struct above, write `Color_setB` to reproduce the target assembly.

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
