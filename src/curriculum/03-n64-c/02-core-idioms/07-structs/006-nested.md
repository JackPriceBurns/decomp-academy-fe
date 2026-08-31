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
  - "Find where `size` starts inside `Panel`, then where `w` and `h` sit inside `Size` — add the two layers to explain each load's offset."
  - "Two `lh` loads two bytes apart, and a `subu` whose operand order the diff will hold you to."
---

# Offsets add up

Structs nest, and the assembly flattens the nesting completely. A field
inside an inner struct lands at *outer offset + inner offset* — one
number, baked into the load, with no trace of the two-level naming:

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
lw    v0, 8(a0)     # a->pos.y — 4 (pos) + 4 (y)
jr    ra
nop
```

One load at offset 8, identical to a flat struct's third word. The
two-step name `pos.y` exists only in the C; the machine sees a single
precomputed distance.

Decoding runs the addition in reverse, and it's where nested structs
earn their keep in a real project: when offset 8 shows up on an
`Actor *`, you locate which field *range* it falls in (`pos` spans
4–11), then index into that inner type (8 − 4 = 4 → `y`). Inner structs
also bring their sizes along — `Pos` occupies 8 bytes, pushing `state`
out to 12 — so one nested field shifts every field after it.

The target reaches into the `Panel` below for two of its inner fields —
halfwords, so the width rules from two lessons ago apply — and
subtracts one from the other. Watch the operand order on the
subtraction.

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
