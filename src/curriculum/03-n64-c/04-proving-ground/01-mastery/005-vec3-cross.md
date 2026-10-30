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
  - "Work through one `swc1` at a time. The two `mul.s` above it are that component's two products. The left operand of each `mul.s` comes from the load listed first."
  - "Every component has the same shape: \"something minus something\". The left operand of `sub.s` is the product whose loads came from `y`/`z`-style crossed offsets. Write all three statements, and keep them in store order."
---

# Three subtractions with the same shape

The cross product is used for surface normals, for camera banking, and to test
"which side of this edge am I on". The version in this game writes three
components. Each one is a difference of two products of *crossed* fields.

The assembly is longer than any float code you have matched so far, but it is
the same block of eight instructions repeated three times. Here is the 2D
version of one block, `vec2Cross`, which computes a single crossed difference:

```asm
lwc1  ft0, 0(a0)      # a->x
lwc1  ft1, 4(a1)      # b->y   (note: crossed offsets, x with y)
lwc1  ft3, 4(a0)      # a->y
lwc1  ft4, 0(a1)      # b->x
mul.s ft2, ft0, ft1   # a->x * b->y
nop
mul.s ft5, ft3, ft4   # a->y * b->x
sub.s fv0, ft2, ft5   # the product computed FIRST is the minuend
jr    ra
nop
```

How to read the full function:

- **Split it at the stores.** Each `swc1` to `0(a2)`, `4(a2)`, `8(a2)` ends one
  component. Everything between two stores belongs to the next component, plus
  a load or two that the scheduler moved up early.
- **Identify each load by its offset.** `4(a0)` is `v1->y` whichever `ft`
  register it lands in. Registers are reused a lot here, but the offsets are
  always reliable.
- **`sub.s` order matters.** Cross products are antisymmetric. If you swap the
  minuend and the subtrahend, you get a different function: the negation of the
  correct one. The diff will show the mismatch even if you miss it.

The function has twelve loads, six multiplies, three subtracts and three
stores. Label every load with its field, and you can then write the three C
statements.

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
