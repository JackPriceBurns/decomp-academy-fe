---
id: 23b6b4d7-fac6-4bdd-b13e-129bcdef3417
slug: mastery-vec3-cross
title: The Cross Product
difficulty: 3
concepts:
  - real-code
  - floats
  - structs
symbol: func_800edad0
hints:
  - "Work one `swc1` at a time. The two `mul.s` above it are that component's two products; each `mul.s`'s left operand comes from the load listed first."
  - "Every component is \"something minus something\" with the same shape — `sub.s`'s left operand is the product whose loads came from `y`/`z`-style crossed offsets. Write all three statements, keep their store order."
---

# Three subtractions, one rhythm

Surface normals, camera banking, "which side of this edge am I on" — the
cross product builds them all. The version in this game writes three
components, each one a difference of two products of *crossed* fields.

The assembly is longer than anything float-flavored you've matched so far, but
it's the same eight bars repeated three times. Here's the 2D version of one
bar — `vec2Cross`, a single crossed difference:

```asm
lwc1  ft0, 0(a0)      # a->x
lwc1  ft1, 4(a1)      # b->y   — note: crossed offsets, x with y
lwc1  ft3, 4(a0)      # a->y
lwc1  ft4, 0(a1)      # b->x
mul.s ft2, ft0, ft1   # a->x * b->y
nop
mul.s ft5, ft3, ft4   # a->y * b->x
sub.s fv0, ft2, ft5   # the product computed FIRST is the minuend
jr    ra
nop
```

Reading technique for the big one:

- **Segment by store.** Each `swc1` to `0(a2)`, `4(a2)`, `8(a2)` closes one
  component. Everything between two stores (plus a load or two the scheduler
  pulled up early) belongs to the next component.
- **Decode loads by offset, not register.** `4(a0)` is `v1->y` no matter which
  `ft` register it lands in. Registers get reused aggressively here; offsets
  never lie.
- **`sub.s` order is meaning.** Cross products are antisymmetric — get the
  minuend and subtrahend backwards and you've written a different function
  that happens to be the negation. The diff will notice even if you don't.

Twelve loads, six multiplies, three subtracts, three stores. Label every load
with its field, and the three C statements fall out.

## Your task

Write `func_800edad0` to reproduce the target assembly.

<!-- solution -->
```c
void func_800edad0(Vec3f *v1, Vec3f *v2, Vec3f *result) {
    result->x = v1->y * v2->z - v1->z * v2->y;
    result->y = v1->z * v2->x - v1->x * v2->z;
    result->z = v1->x * v2->y - v1->y * v2->x;
}
```

<!-- context -->
```c
typedef struct {
    f32 x;
    f32 y;
    f32 z;
} Vec3f;
```
