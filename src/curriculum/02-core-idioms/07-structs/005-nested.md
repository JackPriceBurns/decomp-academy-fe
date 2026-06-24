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

`id` is at offset 0, so `pos` begins at offset 4 (past the 4-byte `int`). Inside
`Vec3`, each field is 4 bytes: `x` at +0, `y` at +4, `z` at +8. Add those to
the start of `pos` to get the absolute offsets inside `Entity`.

Two field accesses (e.g. `.pos` then `.z`) collapse into a **single** load with
one displacement. For instance, accessing `e->pos.z` loads from offset 12:

```asm
lfs  f1, 12(r3)
blr
```

The arithmetic is `offsetof(Entity, pos) + offsetof(Vec3, z) = 4 + 8 = 12`.
Run that addition on any nested struct access and the "weird" offset stops being a
mystery. When you see one `lfs` with a non-trivial offset, suspect a nested
struct rather than a flat one — count the bytes to confirm.

## Your task

With the structs above, write `Entity_getPosY` to reproduce the target assembly.

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
