---
id: 885a7140-4b07-4f6e-b80c-b55c2fe3548f
slug: floats-vec-structs
title: "Floats in Structs: The Vec Pattern"
difficulty: 3
concepts:
  - floats
  - structs
  - pointers
symbol: func_802169c4
hints:
  - "Four loads before any math, two offsets from each pointer. Pair them up by offset before reading the multiplies."
  - "Same shape as the worked example, but each product multiplies a field of one struct by a field of the other."
---

# v->x, v->y

Positions, velocities and scales: game math is full of small structs of
floats. The code reaches their fields with struct offset addressing, and
`lwc1` does the loading. This is `vecLenSq(v)`, the squared length of a 2D
vector:

```c
typedef struct { f32 x, y; } Vec2;

f32 vecLenSq(Vec2 *v) {
    return v->x * v->x + v->y * v->y;
}
```

```asm
 0:  lwc1  fv1, 0(a0)     # v->x
 4:  lwc1  fa0, 4(a0)     # v->y
 8:  mul.s ft0, fv1, fv1  # x²
 c:  nop
10:  mul.s ft1, fa0, fa0  # y²
14:  add.s fv0, ft0, ft1
18:  jr    ra
1c:  nop
```

You already know everything here. Offsets 0 and 4 name the fields, the chain
reads from the bottom up, and the extra `nop` is the multiply padding. One
thing is new: the *loads* write to `fv1` and even `fa0`. This function's
argument is a pointer, which arrives on the integer side, so the float
argument registers are empty. IDO uses them as scratch. On the FPU, as
everywhere else, **the data flow matters more than the register names**.

This is worth thinking about, because it is the last change in thinking that
float code asks of you. A `Vec2 *` function is *integer* at its edges (the
pointer in `a0`) and *float* in the middle. The boundary is wherever the
`lwc1`s are. Structs, offsets and pointer loops all behave exactly as they
did in the previous chapters. The FPU only changes which registers hold the
loaded values.

In the target, note which base register each `lwc1` uses (`a0`, `a1`, …) as
well as its offset. Pair the loads up before you read the multiplies, then
follow the products into the sum.

## Your task

Write `func_802169c4` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_802169c4(Vec2 *a, Vec2 *b) {
    return a->x * b->x + a->y * b->y;
}
```

<!-- context -->
```c
typedef struct {
    f32 x, y;
} Vec2;
```
