---
id: 13402503-ca03-5fe7-a0c9-0961edc7cd89
slug: structs-combine-fields
title: Computing Across Three Fields
difficulty: 2
concepts:
  - structs
  - load
  - offsets
  - chaining
symbol: func_800d0094
hints:
  - Three loads (offsets 0, 4, 8), then two arithmetic instructions that thread
    the running result through a scratch register.
  - The last field loaded reuses `r3` as its destination, then the final
    combining instruction writes the return value back into `r3`.
---

# A field chain is an arithmetic chain

Once more than two fields are involved, a struct function looks like the arithmetic
chains from earlier — except every operand is a `lwz` from the base pointer instead
of an argument register. Load each field, then fold them together one operation at a
time. The compiler often loads the final field directly into `r3` (overwriting the
base pointer, which it no longer needs) so the closing instruction can leave the
result in place.

Consider a box struct combining three fields with a multiply and a subtract:

```c
typedef struct { int width; int height; int margin; } Box;

int Box_area(Box* b) {
    return b->width * b->height - b->margin;
}
```

```asm
lwz    r4, 0(r3)    # r4 = width   (offset 0)
lwz    r0, 4(r3)    # r0 = height  (offset 4)
lwz    r3, 8(r3)    # r3 = margin  (offset 8)
mullw  r0, r4, r0   # r0 = width * height
subf   r3, r3, r0   # r3 = r0 - margin
blr
```

Three loads gather the fields, then `mullw` and `subf` combine them in expression
order. Notice `margin` is loaded into `r3` itself: the base pointer is spent once
the last field is read. The displacements (0, 4, 8) name the three fields; the two
arithmetic instructions tell you how they're woven together.

The target reads three fields and joins them with a different mix of operations.
Identify each field from its load offset, then trace the two combining instructions
to recover the expression.

## Your task

With the `Stats` struct above, write `func_800d0094` to reproduce the assembly
above.

<!-- solution -->
```c
int func_800d0094(Stats* s) {
    return s->base + s->bonus - s->penalty;
}
```

<!-- context -->
```c
typedef struct { int base; int bonus; int penalty; } Stats;
```
