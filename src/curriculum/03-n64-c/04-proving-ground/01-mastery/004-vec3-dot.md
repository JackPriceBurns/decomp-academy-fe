---
id: 7f6a1c35-76ec-4431-9b2d-dfd16ffc0634
slug: mastery-vec3-dot
title: "The Dot Product, As They Wrote It"
difficulty: 2
concepts:
  - real-code
  - floats
  - fpu
  - operand-order
symbol: func_803da870
hints:
  - "There are three products and two adds. Find the product on the LEFT of the final `add.s`. That term is written first in the C, and the other two go together in parentheses."
  - "For the product that uses `8(a1)` and `8(a0)`, check which load supplies the left operand of its `mul.s`. The C multiplies in that order too."
---

# Float math keeps the author's parentheses

The dot product is used all over 3D code. Questions like "is this in front of
me?" and "how aligned are these?" both come down to it. The math is symmetric:
`xx + yy + zz` gives the same answer in any order. The *assembly* is not
symmetric, and that is the point of this lesson.

IDO does not reassociate floating-point arithmetic. It compiles the exact
expression tree that the original programmer wrote: how they grouped the adds,
and which operand they put on each side of each `*`. To match a float
function, you must recover the formula and also *the way it was typed*. Here
is `vec2Dot`, written in plain left-to-right order:

```asm
lwc1  ft0, 0(a0)      # a->x
lwc1  ft1, 0(a1)      # b->x
lwc1  ft3, 4(a0)      # a->y
lwc1  ft4, 4(a1)      # b->y
mul.s ft2, ft0, ft1   # a->x * b->x, operands in source order
nop
mul.s ft5, ft3, ft4   # a->y * b->y
add.s fv0, ft2, ft5   # xx + yy: the term written first is on the left
jr    ra
nop
```

You can rely on two rules here:

- **`mul.s` operand order follows the C.** `a->x * b->x` puts `a->x` on the
  left. If you swap the operands in the C, they swap in the instruction too.
  The diff then shows a mismatch, because the encodings differ even though the
  math gives the same result.
- **`add.s` order shows the grouping.** The left operand of each add is the
  term that came first in the source expression.

The target is the 3D version, and the original author did *not* write it left
to right. One term comes first, and the other two are grouped in parentheses.
Trace each `mul.s` back to its loads and note where each product enters the
add tree. Then rebuild the expression, keeping its parentheses and its operand
order.

## Your task

Write `func_803da870` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_803da870(Vec3f *v1, Vec3f *v2) {
    return v2->z * v1->z + (v1->x * v2->x + v1->y * v2->y);
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
