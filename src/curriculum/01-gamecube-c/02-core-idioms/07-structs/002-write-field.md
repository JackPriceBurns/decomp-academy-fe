---
id: 97a184bc-fc04-5213-bd6a-65d1820413c1
slug: structs-write-field
title: Writing a Struct Field
difficulty: 1
concepts:
  - structs
  - store
  - offsets
symbol: func_801e8610
hints:
  - The value `v` arrives in r4; the struct base is in r3.
  - "`p->y = v;` compiles to `stw r4, 4(r3)`."
---

# Storing into a field

Writing a field mirrors reading it: a store at the field's byte offset.
`stw rS, off(rA)` writes the contents of `rS` to `rA + off`. No load is needed
— a store overwrites the whole field. Note the operand order: source register
first, then the address, the opposite of `lwz`.

Arguments arrive in order: the struct pointer in `r3`, the first value argument
in `r4`.

For a three-field struct, writing the third field (offset 8) looks like:

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

The offset `8` tells you it's the third `int` field. Now work out which field
of a two-field struct matches the offset in the target assembly, and write the
equivalent setter.

## Your task

Using the `Point` struct provided, write `func_801e8610` to reproduce the
target assembly.

<!-- solution -->
```c
void func_801e8610(Point* p, int v) {
    p->y = v;
}
```

<!-- context -->
```c
typedef struct { int x; int y; } Point;
```
