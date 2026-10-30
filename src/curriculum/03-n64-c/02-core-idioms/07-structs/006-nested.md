---
id: e212ec2c-78ec-4bd9-962d-077a2bddbc46
slug: structs-nested
title: "Structs Inside Structs"
difficulty: 2
concepts:
  - structs
  - offsets
  - nesting
symbol: func_80084bb0
hints:
  - "Find where `size` starts inside `Panel`, then where `w` and `h` are inside `Size`. Add the two to explain each load's offset."
  - "There are two `lh` loads, two bytes apart, and a `subu`. The diff will show it if you get the operand order wrong."
---

# Offsets add up

A struct can contain another struct, but the assembly does not show the
nesting at all. A field inside an inner struct is at *outer offset + inner
offset*. That is a single number, built into the load, and nothing in it shows
the two-level name:

```c
typedef struct {
    s32 x;    // offset 0 within Pos
    s32 y;    // offset 4 within Pos
} Pos;

typedef struct {
    s32 id;      // offset 0
    Pos pos;     // offset 4  (8 bytes big)
    s32 state;   // offset 12
} Actor;

s32 actor_y(Actor *a) {
    return a->pos.y;
}
```

```asm
lw    v0, 8(a0)     # a->pos.y: 4 (pos) + 4 (y)
jr    ra
nop
```

This is one load at offset 8, the same as loading the third word of a flat
struct. The two-part name `pos.y` exists only in the C. The machine sees one
distance, which the compiler worked out in advance.

To decode it, you do the addition in reverse. This is where nested structs
matter in a real project. When offset 8 appears on an `Actor *`, first find
which field *range* it falls in (`pos` covers 4 to 11). Then look inside that
inner type: 8 − 4 = 4, which is `y`. An inner struct also takes up its full
size. `Pos` uses 8 bytes, which pushes `state` out to 12. So one nested field
moves every field after it.

The target reads two inner fields of the `Panel` below and subtracts one from
the other. They are halfwords, so the width rules from two lessons ago apply.
Check the operand order of the subtraction.

## Your task

Write `func_80084bb0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80084bb0(Panel *p) {
    return p->size.w - p->size.h;
}
```

<!-- context -->
```c
typedef struct {
    s16 w;
    s16 h;
} Size;

typedef struct {
    s32 tag;
    Size size;
    s32 layer;
} Panel;
```
