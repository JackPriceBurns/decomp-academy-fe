---
id: d3ab1cd7-e165-4976-860b-d7ff052ee75e
slug: structs-array-field
title: "An Array Inside a Struct"
difficulty: 3
concepts:
  - structs
  - arrays
  - indexing
symbol: func_800eac70
hints:
  - "The `sll` amount gives the element width of the embedded array. The load's offset gives where that array *starts* inside the struct."
  - "The load is a signed halfword load at offset 8. Find the field of `Track` that begins there, and index it with the second argument."
---

# Variable index, constant base

This is the opposite of the last lesson. Here the *element* index is a
variable, and the array sits at a fixed position **inside** a struct. The
indexing trio computes the variable part. The array's starting offset goes
into the load's offset field, which is where constant address arithmetic
always ends up:

```c
typedef struct {
    s32 count;      // offset 0
    s32 items[8];   // offsets 4..35
} Bag;

s32 bag_item(Bag *b, s32 i) {
    return b->items[i];
}
```

```asm
sll   t6, a1, 2     # i * 4
addu  t7, a0, t6    # b + i*4
lw    v0, 4(t7)     # …+ 4, where items[] begins
jr    ra
nop
```

Compare this with the neighbor pattern from the pointers chapter. There, the
trio plus a non-zero load offset meant `a[i + 1]`. Here it means
`b->items[i]`. **The same machine code can come from two different pieces of
C.** As in the last lesson, the declared type of the base pointer decides. On
a `Bag *`, offset 4 is where `items` starts, so the trio must be indexing that
embedded array.

This ambiguity comes up often. A common reason a decompiled function fails to
match its context is reading an embedded array as index arithmetic, or the
other way round. When the base is a struct pointer, always match the constant
offset against the struct layout *first*. Then use what is left for the index.

In the target, the `Track` below contains a halfword array, so the stride and
the mnemonic should show a halfword. The function returns one indexed element
of that array.

## Your task

Write `func_800eac70` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_800eac70(Track *t, s32 i) {
    return t->vals[i];
}
```

<!-- context -->
```c
typedef struct {
    s32 len;
    s32 total;
    s16 vals[16];
} Track;
```
