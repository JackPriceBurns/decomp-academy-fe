---
id: structs-nested
title: Nested Structs Flatten to One Offset
difficulty: 2
concepts:
  - structs
  - nested
  - float-load
symbol: Entity_getPosY
hints:
  - "`pos` starts at offset 4; `y` is one f32 into it, so 8 overall."
  - An `f32` field loads with `lfs f1, 8(r3)`.
---

# Inner offsets add up

When one struct contains another, the inner fields are laid out **inline** — there
is no pointer to chase. The compiler simply **adds the offsets**. Given:

```c
typedef struct { f32 x; f32 y; f32 z; } Vec3;
typedef struct { int id; Vec3 pos; } Entity;
```

`id` is at offset 0, so `pos` begins at offset 4, and inside it `y` is one
`f32` (4 bytes) further along — offset 8 overall. Because it's an `f32`, the load
is `lfs` (load floating single) into a float register:

```asm
lfs  f1, 8(r3)   # load e->pos.y
blr
```

Two field accesses (`pos` then `.y`) collapse into a **single** `8(r3)`. The
arithmetic is just a sum of offsets: `offsetof(Entity, pos) = 4` (past the 4-byte
`int id`) plus `offsetof(Vec3, y) = 4` (past one `f32`), giving `4 + 4 = 8`. Run
that addition yourself on any nested struct and the "weird" offset stops being a
mystery. When you see one load with such an offset, suspect a nested struct
rather than a flat one.

## Your task

With the structs above, write `Entity_getPosY` to reproduce the assembly above.

<!-- starter -->
```c
f32 Entity_getPosY(Entity* e) {
    return 0.0f;
}
```

<!-- solution -->
```c
f32 Entity_getPosY(Entity* e) {
    return e->pos.y;
}
```

<!-- context -->
```c
typedef struct { f32 x; f32 y; f32 z; } Vec3;
typedef struct { int id; Vec3 pos; } Entity;
```
