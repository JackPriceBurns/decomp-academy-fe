---
id: structs-padding
title: Alignment Padding Shifts an Offset
difficulty: 2
concepts:
  - structs
  - alignment
  - padding
  - offsets
symbol: S_getCount
hints:
  - A `u16` must be 2-byte aligned, so a pad byte sits between `tag` and `count`.
  - "`count` is at offset 2, so the load is `lhz r3, 2(r3)` — not `1(r3)`."
---

# A hidden byte changes the math

The previous lesson noted it in passing; now you'll match it. A field can't sit
at *any* offset — its type forces **alignment**. A `u16` must start on an even
address.

Consider a struct with a `u8` followed by a `u16`:

```c
typedef struct { u8 kind; u16 value; } Item;
```

`kind` is at offset 0. You might expect `value` to follow at offset 1, but `u16`
requires 2-byte alignment. The compiler inserts a **pad byte** at offset 1, so
`value` lands at offset **2**. Reading `i->value` produces:

```asm
lhz  r3, 2(r3)
blr
```

Now apply that rule to the task's struct:

```c
typedef struct { u8 tag; u16 count; } S;
```

Count the bytes the same way. If you assume the `u16` sits immediately after the
`u8` (at offset 1), the load would read `1(r3)` — but it won't match. The
alignment gap is invisible in the C source, but it shifts every offset that
follows a narrow field.

## Your task

With the `S` struct above, write `S_getCount` so it compiles to the `lhz` in the target assembly.

<!-- starter -->
```c
u16 S_getCount(S* s) {
    return 0;
}
```

<!-- solution -->
```c
u16 S_getCount(S* s) {
    return s->count;
}
```

<!-- context -->
```c
typedef struct { u8 tag; u16 count; } S;
```
