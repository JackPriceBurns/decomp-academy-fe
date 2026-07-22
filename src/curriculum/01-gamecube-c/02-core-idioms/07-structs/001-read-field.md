---
id: 08cf5d2a-eef8-5702-b4b3-4a7012cf71c9
slug: structs-read-field
title: Reading a Struct Field
difficulty: 1
concepts:
  - structs
  - load
  - offsets
symbol: Point_getField
hints:
  - "`y` is the second `int`, so it sits at byte offset 4."
  - "`p->y` compiles to `lwz r3, 4(r3)`."
---

# A struct is just an offset into memory

A pointer to a struct arrives in `r3` like any other pointer. Reading a field is
a single **load at the field's byte offset**: `lwz rD, off(rA)` loads the word
at address `rA + off`. Each `int` field is 4 bytes wide, so fields are laid out
at offsets 0, 4, 8, … in declaration order with no padding between `int` members.

To ground the idea, consider a three-field integer struct:

```c
typedef struct { int x; int y; int z; } Vec3i;

int Vec3i_getZ(Vec3i* v) {
    return v->z;
}
```

`z` is the third field: `x` at 0, `y` at 4, `z` at 8. The compiler emits:

```asm
lwz     r3,8(r3)    # load v->z at offset 8
blr
```

The offset in the instruction directly encodes which field is being read. In
decompilation, recovering the *name* of the field from that offset is the job.

Now apply the same reasoning to a two-field struct — figure out which field
sits at the offset used in the target assembly.

## Your task

With the `Point` struct above, write `Point_getField` to match the target.

<!-- solution -->
```c
int Point_getField(Point* p) {
    return p->y;
}
```

<!-- context -->
```c
typedef struct { int x; int y; } Point;
```
