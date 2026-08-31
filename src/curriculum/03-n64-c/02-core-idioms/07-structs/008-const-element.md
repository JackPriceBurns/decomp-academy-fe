---
id: 5546752b-3c43-4a52-8e9b-6c58040663e3
slug: structs-const-element
title: "A Constant Element Folds Away"
difficulty: 3
concepts:
  - structs
  - arrays
  - offsets
  - rmw
symbol: func_801519d4
hints:
  - "One offset, used by both the load and the store: decompose it as
    element × 20 + field before writing anything."
  - "The middle of the sandwich is a register `addu` with the second argument — a compound assignment on one element's field."
---

# element × sizeof + field, precomputed

Index an array of structs with a *constant*, and the whole multiply
chain from last lesson vanishes — the compiler does
`index × sizeof + field offset` at compile time and bakes the total
into a single instruction offset:

```c
typedef struct {
    s32 x;    // offset 0
    s32 y;    // offset 4
    s32 z;    // offset 8
} Vec3;      // sizeof = 12

s32 second_z(Vec3 *arr) {
    return arr[1].z;
}
```

```asm
lw    v0, 20(a0)    # 1*12 + 8 — element 1, field z
jr    ra
nop
```

One `lw` again — this is the third C shape you've seen compile to a
lone load with an offset (`v[5]`, `p->field`, now `arr[k].field`). The
assembly genuinely cannot tell you which one the original source was;
only the declared type of the pointer decides how the offset reads
back. On a `Vec3 *`, offset 20 *must* mean `[1].z`, because you
decompose against the struct's size first: 20 ÷ 12 = element 1,
remainder 8 = `z`.

That decomposition habit matters most for big offsets on struct-array
pointers in real code — `76(a0)` looks opaque until you divide by the
struct size and it falls apart into "element 3, second word".

The target updates one field of one fixed element of a `Mob` array
(20 bytes each, context below) — the RMW sandwich wearing a folded
offset. Decompose it, then write the compound assignment.

## Your task

Write `func_801519d4` to reproduce the target assembly.

<!-- solution -->
```c
void func_801519d4(Mob *list, s32 amount) {
    list[2].hp += amount;
}
```

<!-- context -->
```c
typedef struct {
    s32 id;
    s32 hp;
    s32 x;
    s32 y;
    s32 anim;
} Mob;
```
