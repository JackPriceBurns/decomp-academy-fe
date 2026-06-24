---
id: pointers-store-index-const
title: Writing at a Constant Index
difficulty: 2
concepts:
  - stores
  - addressing
  - arrays
symbol: set_third
hints:
  - Same displacement trick as the load, but writing.
  - "`p[2] = v` compiles to `stw r4, 8(r3)`."
---

# Displacement stores

Storing at a constant index works exactly like the load did — the index scales
into a displacement, and a `stw` writes there. With `p` in `r3` and `v` in
`r4`, writing `p[2]` targets byte offset `8`:

```asm
stw  r4, 8(r3)    # p[2] = v
blr
```

Whenever you see a store (or load) with a non-zero constant displacement that's
a clean multiple of the element size, suspect an array or struct-field access in
the original C — *not* a hand-written pointer offset. The displacement `8` here
reads back as "the third `int`".

## Your task

Write `set_third` to match the target assembly above.

<!-- starter -->
```c
void set_third(int* p, int v) {
}
```

<!-- solution -->
```c
void set_third(int* p, int v) {
    p[2] = v;
}
```
