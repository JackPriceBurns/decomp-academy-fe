---
id: 97a184bc-fc04-5213-bd6a-65d1820413c1
slug: structs-write-field
title: Writing a Struct Field
difficulty: 1
concepts:
  - structs
  - store
  - offsets
symbol: Point_setField
hints:
  - The value `v` arrives in r4; the struct base is in r3.
  - "`p->y = v;` compiles to `stw r4, 4(r3)`."
---

# Storing into a field

Writing a field mirrors reading it: a **store at the field's byte offset**. The
store instruction `stw rS, off(rA)` writes the contents of `rS` to address
`rA + off`. No load is needed — a store overwrites the whole field. Note the
operand order: **source register first, then the address**, the opposite mental
model from `lwz`.

Arguments arrive in registers in order: the struct pointer goes into `r3`, and
the first value argument into `r4`.

For a three-field struct, writing the third field (offset 8) looks like this:

```c
typedef struct { int x; int y; int z; } Vec3i;

void Vec3i_setZ(Vec3i* v, int val) {
    v->z = val;
}
```

```asm
stw     r4,8(r3)    # v->z = val
blr
```

The offset `8` tells you it's the third `int` field. Now determine which field
of a two-field struct corresponds to the offset used in the target assembly, and
write the equivalent setter.

## Your task

With the `Point` struct above, write `Point_setField` to reproduce the target assembly.

<!-- solution -->
```c
void Point_setField(Point* p, int v) {
    p->y = v;
}
```

<!-- context -->
```c
typedef struct { int x; int y; } Point;
```
