---
id: 73bced17-7c24-4e78-a787-57ed708a9a26
slug: structs-field-store
title: "Filling In Fields"
difficulty: 1
concepts:
  - structs
  - stores
symbol: func_800ef3b4
hints:
  - "Three stores, three fields, offsets 0, 4, 8. One of them stores the `zero` register — a field set to 0."
  - "The other two stores push the *same* argument register — one parameter initializing two different fields."
---

# Initializers are store runs

Writing fields is the mirror image of reading them: one store per
field, each with that field's offset. Functions that set up a struct —
constructors in spirit — compile to a tidy run of stores against one
base register:

```c
typedef struct {
    s32 x;    // offset 0
    s32 y;    // offset 4
} Point;

void move_to(Point *p, s32 nx, s32 ny) {
    p->x = nx;
    p->y = ny;
}
```

```asm
sw    a1, 0(a0)     # p->x = nx
sw    a2, 4(a0)     # p->y = ny
jr    ra
nop
```

Nothing new mechanically — this is the out-parameter pattern from the
pointers chapter with named offsets. The reading skill is the
*inventory*: list every store's offset, map each to a field, and note
what register it stores. Arguments map to parameters; `zero` maps to
`= 0`; a scratch register means a computed value, so trace it upward.

One habit that pays off: when several consecutive fields get stored in
one function, that function is probably an init or reset helper, and
the field order in the stores usually tracks the declaration order.
Seeing the *shape* ("this initializes a Gauge") gets you to the C
faster than decoding line by line.

The target initializes all three fields of the `Gauge` below — read
carefully which register lands where.

## Your task

Write `func_800ef3b4` to reproduce the target assembly.

<!-- solution -->
```c
void func_800ef3b4(Gauge *g, s32 top) {
    g->min = 0;
    g->max = top;
    g->cur = top;
}
```

<!-- context -->
```c
typedef struct {
    s32 min;
    s32 max;
    s32 cur;
} Gauge;
```
