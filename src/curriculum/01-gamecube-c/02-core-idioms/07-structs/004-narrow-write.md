---
id: e43a0686-a35c-5faf-be84-364b9f42c845
slug: structs-narrow-write
title: Storing a Byte Field
difficulty: 2
concepts:
  - structs
  - store
  - narrow-types
symbol: func_8010e818
hints:
  - "`b` is the third byte, so it sits at offset 2."
  - A `u8` store is `stb r4, 2(r3)`.
---

# Byte stores and field alignment

Where `lbz` pulled a byte out, `stb` puts one back — and the field's type still
fixes the width. Take this color struct:

```c
typedef struct { u8 r; u8 g; u8 b; u8 a; } Color;
```

Every field here is a single byte, in declaration order. A field's offset is
its distance in bytes from the start of the struct. With no padding, `r` is 0,
`g` is 1, `b` is 2, and `a` is 3.

The byte store is `stb rS, offset(rA)`. Whatever displacement it carries names
the field being written. Writing the final byte, at offset 3, gives:

```asm
stb  r4, 3(r3)
blr
```

Going backward from any `stb` is the same counting exercise. Step through the
struct one byte at a time until the running total hits the displacement, and
you've found the field.

Mixed widths are where alignment bites. A `u16` can't start on an odd offset,
so the compiler pads to fix it: declare `{ u8 flags; u16 hp; }` and `hp` won't
land at 1 — it ends up at offset 2, with a hidden pad byte in front. Get those
offsets right and your loads and stores fall into place.

## Your task

Using the `Color` struct provided, write `func_8010e818` to reproduce the
target assembly.

<!-- solution -->
```c
void func_8010e818(Color* c, u8 v) {
    c->b = v;
}
```

<!-- context -->
```c
typedef struct { u8 r; u8 g; u8 b; u8 a; } Color;
```
