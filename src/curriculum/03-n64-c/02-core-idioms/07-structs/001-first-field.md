---
id: 91d97f0d-c29b-4a3c-87c0-9c90ab76627b
slug: structs-first-field
title: "Fields Are Offsets"
difficulty: 1
concepts:
  - structs
  - offsets
symbol: func_800765fc
hints:
  - "Go through the `Rect` declaration and give each field its offset. The fields are consecutive words, at 0, 4, 8, 12. Then match the two load offsets to two field names."
  - "There are two loads and one `addu`. The function returns the sum of two of the rectangle's fields, in one return line."
---

# The struct disappears at compile time

A struct gives names to parts of memory, and the compiler removes those names.
Each field becomes an **offset** from the start of the struct. The offsets are
assigned in declaration order. So a field access through a pointer uses the
same `offset(base)` form you have used throughout this tier. The field decides
the offset:

```c
typedef struct {
    s32 hp;      // offset 0
    s32 mp;      // offset 4
    s32 gold;    // offset 8
} Player;

s32 get_gold(Player *p) {
    return p->gold;
}
```

```asm
lw    v0, 8(a0)     # p->gold, the third word
jr    ra
nop
```

This is a single `lw`, the same instruction an array access would use. At the
machine level the two are the same: `p->gold` and `v[2]` compile to the same
instruction. The difference is the declaration you write around the function.
With the struct in scope, offset 8 has a *name*, so the decompiled C says
`->gold` where code that uses raw memory would say `[2]`.

You will use this method for the whole chapter. Put the struct next to the
listing and write each field's offset beside it. Then read each `offset(base)`
as a field name. In these lessons, the struct comes with the exercise. In a
real project, you have to rebuild the struct yourself, and that is half the
work. Every offset you see in a listing tells you something about it.

The target reads two fields of the `Rect` below and combines them. Number the
fields, then name the loads.

## Your task

Write `func_800765fc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_800765fc(Rect *r) {
    return r->y + r->h;
}
```

<!-- context -->
```c
typedef struct {
    s32 x;
    s32 y;
    s32 w;
    s32 h;
} Rect;
```
