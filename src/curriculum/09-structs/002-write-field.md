---
id: structs-write-field
title: Writing a Struct Field
difficulty: 1
concepts:
  - structs
  - store
  - offsets
symbol: Point_setY
hints:
  - The value `v` arrives in r4; the struct base is in r3.
  - "`p->y = v;` compiles to `stw r4, 4(r3)`."
---

# Storing into a field

Writing a field mirrors reading it: a **store at the field's offset**. The store
instruction `stw rS, off(rA)` writes `rS` to `rA + off`. With:

```c
typedef struct { int x; int y; } Point;
```

the value to store arrives in `r4` (the second argument) and the struct base in
`r3`. Setting `p->y = v` is:

```asm
stw  r4, 4(r3)   # p->y = v
blr
```

No load is needed — we overwrite the whole field. The order of operands in
`stw` is **source first, then address**, the opposite mental model from `lwz`.

## Your task

Write `Point_setY` that stores `v` into `p->y`.

<!-- starter -->
```c
void Point_setY(Point* p, int v) {
}
```

<!-- solution -->
```c
void Point_setY(Point* p, int v) {
    p->y = v;
}
```

<!-- context -->
```c
typedef struct { int x; int y; } Point;
```
