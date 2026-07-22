---
id: e43a0686-a35c-5faf-be84-364b9f42c845
slug: structs-narrow-write
title: Storing a Byte Field
difficulty: 2
concepts:
  - structs
  - store
  - narrow-types
symbol: Color_setField
hints:
  - "`b` is the third byte, so it sits at offset 2."
  - A `u8` store is `stb r4, 2(r3)`.
---

# Byte stores and field alignment

Where `lbz` pulled a byte out, **`stb`** puts one back, and the field's type is
still what fixes the width. Take this color struct:

```c
typedef struct { u8 r; u8 g; u8 b; u8 a; } Color;
```

Every field here is a single byte, sitting in declaration order. A field's
**offset** is simply its distance in bytes from the start of the struct. Since
nothing pads these out, `r` lands at 0, `g` at 1, `b` at 2, and `a` at 3.

The byte store itself is `stb rS, offset(rA)`. Whatever displacement it carries
names the field being written, so reading that offset tells you the target.
Writing the final byte, at offset 3, gives:

```asm
stb  r4, 3(r3)
blr
```

Going backwards from any `stb` is the same counting exercise. Step through the
struct one byte at a time until the running total hits the displacement in the
instruction, and you've found the field.

Mixed widths are where alignment bites. A `u16` can't begin on an odd offset, so
the compiler quietly pads to fix it. Declare `{ u8 flags; u16 hp; }` and `hp`
won't land at 1; it ends up at offset **2**, with a hidden pad byte tucked in
front of it. Nail those offsets and your loads and stores fall into place.

## Your task

With the `Color` struct above, write `Color_setField` to reproduce the target assembly.

<!-- solution -->
```c
void Color_setField(Color* c, u8 v) {
    c->b = v;
}
```

<!-- context -->
```c
typedef struct { u8 r; u8 g; u8 b; u8 a; } Color;
```
