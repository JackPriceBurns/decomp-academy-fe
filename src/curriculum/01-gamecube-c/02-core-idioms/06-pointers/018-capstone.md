---
id: 98ec1eb6-662e-5428-a38c-daa35bef0607
slug: pointers-capstone
title: "Capstone: Several Dereferences in One Expression"
difficulty: 3
concepts:
  - loads
  - indexed-addressing
  - arrays
  - multiplication
  - chaining
symbol: capstone
hints:
  - Three reads share one scaled index — a fixed element via `lwz 0(r3)`, the
    indexed element via `lwzx`, and a neighbor via a displacement load off the
    computed base.
  - Trace each loaded register to its combine; the multiply is `mullw` (two
    loaded values) and the final step is `subf`.
---

# Putting the chapter together

By now you've met every move in this function separately. It loads an element at
a fixed index, loads another at a variable index with `lwzx`, grabs a neighbor
off the computed base, multiplies two loaded values together
register-to-register, and subtracts at the end. So nothing here is unfamiliar.
The earlier lessons have just been bolted together into one routine.

The efficiency worth catching is that the variable index only gets scaled
**once**, by `slwi`. After that, the same offset does two jobs. It drives the
indexed `lwzx`, and it also locates the neighbor, whose base falls out of an
`add` before a displacement load finishes the read. The element at index 0 never
goes near that path, since a plain `lwz 0(r3)` reaches it directly.

`mix(q, j)` blends the first element with the product of two neighbors:

```asm
slwi r0, r4, 2     # j * 4
lwz  r5, 0(r3)     # q[0]
add  r4, r3, r0    # r4 = &q[j]
lwzx r3, r3, r0    # q[j]
lwz  r0, 4(r4)     # q[j+1]  (4 / 4 = 1 element past q[j])
mullw r0, r3, r0   # q[j] * q[j+1]
add  r3, r5, r0    # q[0] + q[j]*q[j+1]
blr
```

Here the single `slwi` is what powers both the `lwzx` and the `add`-built base,
and because the multiply takes two *loaded* values it comes out as `mullw` rather
than `mulli`, with the fixed element joining only at the close. Your target is
built from the same parts, but it puts the multiply and the subtract in different
places. So work each loaded register forward from its load to whatever consumes
it, recover the indices from the displacements, and the expression reassembles
itself.

## Your task

Write `capstone` to reproduce the assembly above.

<!-- solution -->
```c
int capstone(int* p, int i) {
    return p[i] * p[0] - p[i + 2];
}
```
