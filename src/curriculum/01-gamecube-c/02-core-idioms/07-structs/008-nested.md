---
id: cf77041c-beef-5d36-9cf5-6c1b8605c959
slug: structs-nested
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

Nest a struct inside a struct and you don't get a pointer to the inner one. Its
fields are just sitting there inline, part of the same block of memory. So the
compiler does the obvious thing and sums the offsets. The types:

```c
typedef struct { f32 x; f32 y; f32 z; } Vec3;
typedef struct { int id; Vec3 pos; } Entity;
```

`id` eats offset 0. `pos` therefore starts at 4, right after that one `int`. The
three `Vec3` fields are 4 bytes each, landing `x` at +0, `y` at +4, `z` at +8.
Whatever field you want, its real offset into `Entity` is that local number plus
where `pos` starts.

And two hops in a single expression don't cost two instructions. Say you read
`e->pos.z`. The whole thing turns into one load at offset 12:

```asm
lfs  f1, 12(r3)
blr
```

12 because `offsetof(Entity, pos) + offsetof(Vec3, z) = 4 + 8 = 12`. That sum is
the trick for every nested access you'll meet. So a single `lfs` hanging off some
offset you can't immediately place is your hint to go looking for a nested struct.
Count the bytes and the offset explains itself.

## Your task

With the structs above, write `Entity_getPosY` to reproduce the target assembly.

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
