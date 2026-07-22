---
id: 60deb600-2c17-5ec3-a051-1a677656475a
slug: pointers-computed-offset
title: Indexing Neighbors From a Computed Offset
difficulty: 3
concepts:
  - loads
  - indexed-addressing
  - arrays
  - chaining
symbol: pair_at
hints:
  - The scaled offset `i*4` is computed once; one access uses it with `lwzx`, the
    other reuses it as a base for a displacement load.
  - "Look for `slwi` then `add r?, r3, r0` to form `&p[i]`, then a `lwz` at a
    constant displacement off that new base."
---

# One scale, two nearby elements

When a function reads `p[i]` and a *neighbor* like `p[i + 1]`, the compiler does
not scale the index twice. It scales `i` once with `slwi`, then reaches both
elements from that single computation: one element via the indexed load `lwzx`
(base `+` scaled offset), and the neighbor by forming the address `&p[i]` with an
`add` and then using an ordinary displacement load for the small constant step.

That displacement is the *neighbor distance* times the element size — the same
divide-by-element-size reading you already know, just measured from `p[i]`
instead of from `p[0]`.

Consider `spread(q, j)`, which reads `q[j]` and `q[j + 3]` and subtracts:

```asm
slwi r0, r4, 2     # j * 4
add  r4, r3, r0    # r4 = &q[j]
lwzx r0, r3, r0    # q[j]   (base + scaled offset)
lwz  r3, 12(r4)    # q[j+3] (12 / 4 = 3 elements past q[j])
subf r3, r3, r0    # r0 - q[j+3]
blr
```

The single `slwi` scales `j`; `lwzx` reads `q[j]` directly while the `add` builds
the base `&q[j]` so the neighbor is a plain `lwz` at displacement `12` — three
elements further on. The target assembly uses the same one-scale-two-neighbors
shape; read the neighbor displacement to find the step and the combining
instruction to find the operation.

## Your task

Write `pair_at` to reproduce the assembly above.

<!-- solution -->
```c
int pair_at(int* p, int i) {
    return p[i] + p[i + 1];
}
```
