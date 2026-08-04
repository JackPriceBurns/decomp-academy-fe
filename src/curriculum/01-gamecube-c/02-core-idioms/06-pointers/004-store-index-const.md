---
id: 59f2d7eb-3474-5b6c-bf85-3aa52aec5294
slug: pointers-store-index-const
title: Writing at a Constant Index
difficulty: 2
concepts:
  - stores
  - addressing
  - arrays
symbol: func_8027cb5c
hints:
  - Same displacement trick as the load, but writing.
  - "`p[2] = v` compiles to `stw r4, 8(r3)`."
---

# Displacement stores

Writing at a constant index is the same idea as loading, just in reverse. The
compiler knows the index up front, multiplies by element size, and bakes the offset
into `stw`. No runtime add.

Here, the function pokes element five:

```c
void set_fifth(int* p, int v) {
    p[4] = v;
}
```

```asm
stw  r4, 16(r3)   # write v to p + 16 bytes
blr
```

An `int` is 4 bytes. Index 4 times 4 is 16. Read it backward: an `stw` offset of 16
through an `int*` means index 4, the fifth slot.

The tell is a non-zero constant displacement that's an exact multiple of the element
size. When you see that, the C almost certainly indexed an array or touched a struct
field. Divide it out and the index falls out.

Now check `func_8027cb5c`. What displacement is on its `stw`, and what index does
that work out to?

## Your task

Write `func_8027cb5c` to match the target assembly above.

<!-- solution -->
```c
void func_8027cb5c(int* p, int v) {
    p[2] = v;
}
```
