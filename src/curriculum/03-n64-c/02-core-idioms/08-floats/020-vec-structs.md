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
  - "Four loads before any math — two offsets from each pointer. Pair them up by offset before reading the multiplies."
  - "Same shape as the worked example, but every product crosses between the two structs."
---

# v->x, v->y

Positions, velocities, scales — game math lives in little structs of
floats, and the access pattern is struct-offset addressing with
`lwc1` doing the loading. Here's `vecLenSq(v)`, the squared length
of a 2D vector:

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

Everything here is a reflex you already own: offsets 0 and 4 name
the fields, the chain reads bottom-up, the stray `nop` is the mul
pad. One new sight: the *loads* target `fv1` and even `fa0`. This
function's arguments are a pointer (integer side!), so the float
argument registers sit empty — and IDO happily uses them as scratch.
On the FPU, as everywhere, **dataflow outranks register names**.

That's worth dwelling on, because it's the last mental adjustment
float code asks of you: a `Vec2 *` function is *integer* at its
edges (the pointer in `a0`) and *float* in its middle, and the
boundary is wherever the `lwc1`s are. Structs, offsets, and pointer
walking all behave exactly as they did in the previous chapters —
the FPU only changes who holds the loaded values.

The target combines *two* vectors — one pointer in `a0`, one in
`a1` — multiplying matching fields across the structs and summing.
A dot product, by its assembly.

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
