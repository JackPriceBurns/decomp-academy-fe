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
  - "The `sll` amount gives the element width of the embedded array; the load's offset gives where that array *starts* inside the struct."
  - "Offset 8 with a signed halfword load — find the field of `Track` that begins there, and index it with the second argument."
---

# Variable index, constant base

Flip last lesson around: the *element* index is a variable, but the
array lives at a fixed position **inside** a struct. The indexing trio
computes the variable part, and the array's starting offset rides the
load, exactly where constant address arithmetic always ends up:

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

Now compare this against the neighbor pattern from the
pointers chapter — trio plus a non-zero load offset meant `a[i + 1]`
there, and means `b->items[i]` here. **Identical machine code, two
different C spellings.** The declared type of the base pointer is the
tiebreaker, same as last lesson: on a `Bag *`, offset 4 is where
`items` starts, so the trio must be indexing that embedded array.

This ambiguity isn't a corner case — misreading an embedded array as
index arithmetic (or vice versa) is one of the classic ways a
decompiled function refuses to match its context. When the base is a
struct pointer, always resolve the constant offset against the struct
layout *first*, then spend what remains on the index.

In the target, the `Track` below embeds a halfword array — so expect
the stride and mnemonic to say so — and the function returns one
indexed element of it.

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
