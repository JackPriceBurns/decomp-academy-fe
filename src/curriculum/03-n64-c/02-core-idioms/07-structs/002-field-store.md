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
  - "There are three stores for three fields, at offsets 0, 4, 8. One of them stores the `zero` register, which sets a field to 0."
  - "The other two stores write the *same* argument register. One parameter sets two different fields."
---

# Initializers are store runs

Writing fields works like reading them, with stores in place of loads. There
is one store per field, and each store uses that field's offset. A function
that sets up a struct (much like a constructor) compiles to a run of stores
that all use one base register:

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

The instructions are not new. This is the out-parameter pattern from the
pointers chapter, with named offsets. What you need here is an *inventory* of
the stores. List each store's offset, match it to a field, and note which
register it stores. An argument register means a parameter. `zero` means
`= 0`. A scratch register means a computed value, so look further up to see
where it came from.

A useful habit: when one function stores several consecutive fields, it is
probably an init or reset helper. The stores usually follow the declaration
order of the fields. If you recognize the *shape* ("this initializes a
Gauge"), you reach the C faster than by decoding line by line.

The target initializes all three fields of the `Gauge` below. Check carefully
which register goes into which field.

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
