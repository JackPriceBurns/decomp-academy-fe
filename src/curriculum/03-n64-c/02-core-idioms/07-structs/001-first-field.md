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
  - "Walk the `Rect` declaration and assign each field its offset — consecutive words at 0, 4, 8, 12. Then match the two load offsets to two field names."
  - "Two loads, one `addu` — the sum of two of the rectangle's fields, in one return line."
---

# The struct disappears at compile time

A struct is a naming scheme, and the compiler compiles the names away.
Each field becomes nothing but an **offset** from the struct's start,
assigned in declaration order — so accessing a field through a pointer
is the `offset(base)` form you've used all tier, with the offset chosen
by the field:

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
lw    v0, 8(a0)     # p->gold — the third word in
jr    ra
nop
```

One `lw`, indistinguishable from an array access — because at the
machine level it *is* one. `p->gold` and `v[2]` compile to the same
instruction. What separates them is the declaration you write around
the function: with the struct in scope, offset 8 has a *name*, and the
decompiled C says `->gold` where raw memory code would say `[2]`.

That's the workflow for this whole chapter: put the struct next to the
listing, number its fields with their offsets, then read each
`offset(base)` as a field name. In these lessons the struct rides along
with the exercise; out in a real project, reconstructing that struct
*is* half the work, and every offset you see in a listing is a clue to
it.

The target reads two fields of the `Rect` below and combines them —
number the fields, then name the loads.

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
