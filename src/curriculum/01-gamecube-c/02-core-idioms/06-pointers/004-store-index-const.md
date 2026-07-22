---
id: 59f2d7eb-3474-5b6c-bf85-3aa52aec5294
slug: pointers-store-index-const
title: Writing at a Constant Index
difficulty: 2
concepts:
  - stores
  - addressing
  - arrays
symbol: setElemAt
hints:
  - Same displacement trick as the load, but writing.
  - "`p[2] = v` compiles to `stw r4, 8(r3)`."
---

# Displacement stores

Writing at a constant index is just the load run backwards. The compiler knows
the index up front, multiplies it by the element size, and bakes that number into
the displacement of `stw`. Nothing gets added at runtime.

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

An `int` is 4 bytes. Index `4` times 4 is `16`, which is the offset you see. Read
it the other way and a `stw` of `16` through an `int*` can only be index `4`, the
fifth slot.

The tell is a non-zero constant displacement that's an exact multiple of the
element size. When that shows up, the C almost certainly indexed an array or
touched a struct field. People don't hand-roll offsets like `16`. Divide it out
and the index falls right out.

Now check `setElemAt`. What displacement is on its `stw`, and what index does that
work out to?

## Your task

Write `setElemAt` to match the target assembly above.

<!-- solution -->
```c
void setElemAt(int* p, int v) {
    p[2] = v;
}
```
