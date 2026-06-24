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

Storing at a constant index works exactly like loading at a constant index: the
compiler multiplies the index by the element size at compile time and folds the
result into the displacement field of `stw`. No runtime add is needed.

Here is a function that writes to the fifth element:

```c
void set_fifth(int* p, int v) {
    p[4] = v;
}
```

```asm
stw  r4, 16(r3)   # write v to p + 16 bytes
blr
```

`sizeof(int)` is 4, so index `4` scales to `16` bytes. To read this in reverse:
a `stw` with displacement `16` on an `int*` means index `4`, the fifth element.

Whenever you see a store (or load) with a non-zero constant displacement that is
a clean multiple of the element size, suspect an array or struct-field access in
the original C — not a hand-written pointer offset. Apply the same divide-by-element-size
rule you used for the load lesson.

Now look at the target assembly for `set_third`. What displacement does the
`stw` use, and which index does that correspond to?

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
