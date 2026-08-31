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
  - "Three products, two adds. Follow which product lands on the LEFT of the final `add.s` — that term is written first in the C, and the other two sit in parentheses."
  - "For the product fed by `8(a1)` and `8(a0)`, check which load supplies the left operand of its `mul.s` — the C multiplies in that order too."
---

# Float math keeps the author's parentheses

The dot product is everywhere in 3D code — every "is this in front of me?" and
"how aligned are these?" question funnels through it. The math is symmetric:
`xx + yy + zz`, any order, same answer. The *assembly* is not symmetric, and
that's today's point.

IDO does not reassociate floating-point arithmetic. However the original
programmer grouped the adds — and whichever operand they wrote on which side
of each `*` — that exact tree is what compiles. Matching a float function
means recovering not just the formula but *the way it was typed*. Here's
`vec2Dot`, typed the boring left-to-right way:

```asm
lwc1  ft0, 0(a0)      # a->x
lwc1  ft1, 0(a1)      # b->x
lwc1  ft3, 4(a0)      # a->y
lwc1  ft4, 4(a1)      # b->y
mul.s ft2, ft0, ft1   # a->x * b->x — operands in source order
nop
mul.s ft5, ft3, ft4   # a->y * b->y
add.s fv0, ft2, ft5   # xx + yy — the term written first is on the left
jr    ra
nop
```

Two things to trust here:

- **`mul.s` operand order follows the C.** `a->x * b->x` puts `a->x` on the
  left. Flip the C and the operands flip — and the diff will call it a
  mismatch, because the encodings differ even though the math doesn't.
- **`add.s` order reveals the grouping.** The left operand of each add is the
  term that came first in the source expression.

The target is the 3D version, and the original author did *not* write it
left-to-right: one term leads, and the other two are bracketed together. Trace
each `mul.s` back to its loads, note which product enters the add tree where,
and reconstruct the expression with its parentheses — and its operand orders —
intact.

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
