---
id: cf77041c-beef-5d36-9cf5-6c1b8605c959
slug: structs-nested
title: Nested Structs Flatten to One Offset
difficulty: 2
concepts:
  - structs
  - nested
  - float-load
symbol: func_803ddc10
hints:
  - "`pos` starts at offset 4; `y` is one f32 into it, so 8 overall."
  - An `f32` field loads with `lfs f1, 8(r3)`.
---

# Inner offsets add up

Nest a struct inside a struct and you don't get a pointer to the inner one. Its
fields sit inline, part of the same memory block. The compiler sums the offsets.
The types:

```c
typedef struct { f32 x; f32 y; f32 z; } Vec3;
typedef struct { int id; Vec3 pos; } Entity;
```

`id` takes offset 0. `pos` starts at 4, right after that `int`. The three `Vec3`
fields are 4 bytes each, so `x` is +0, `y` is +4, `z` is +8. A field's real offset
into `Entity` is its local offset plus where `pos` starts.

Two hops in one expression don't cost two instructions. Say you read `e->pos.z`. It
turns into one load at offset 12:

```asm
lfs  f1, 12(r3)
blr
```

12 because `offsetof(Entity, pos) + offsetof(Vec3, z) = 4 + 8 = 12`. That sum is the
trick for every nested access. A single `lfs` at an offset you can't immediately
place is a hint to look for a nested struct. Count the bytes and the offset explains
itself.

## Your task

With the structs above, write `func_803ddc10` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_803ddc10(Entity* e) {
    return e->pos.y;
}
```

<!-- context -->
```c
typedef struct { f32 x; f32 y; f32 z; } Vec3;
typedef struct { int id; Vec3 pos; } Entity;
```
