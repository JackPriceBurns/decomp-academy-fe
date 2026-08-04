---
id: 7f8eefa9-8b91-57a6-a203-05bd82fd47f9
slug: structs-struct-of-structs
title: Combining Fields Across Nested Structs
difficulty: 2
concepts:
  - structs
  - nested
  - offsets
  - chaining
symbol: func_803e3bbc
hints:
  - Both loads use the same base; one field lives in the first inner struct, the
    other in the second, so their offsets are a whole inner-struct apart.
  - Add `offsetof(outer, member) + offsetof(inner, field)` for each access, then
    combine the two loads.
---

# Reaching into two inner structs

You just saw a `.a.b` access boil down to one offset. Two of them isn't any harder,
even when each lives in a separate inner struct of the same outer struct. The field
you want still has exactly one absolute offset: inner struct start plus field
offset inside it. After that the two loads combine like any other pair of fields.

Put two of the same inner type back to back and the second starts a whole
inner-struct later. Here's a range built out of two `Pair`s:

```c
typedef struct { int a; int b; } Pair;
typedef struct { Pair lo; Pair hi; } Range;

int Range_sumB(Range* r) {
    return r->lo.b + r->hi.b;
}
```

`lo` starts at offset 0. `hi` comes right after at offset 8, past the 8-byte `Pair`.
And `b` is always +4 into a `Pair`, so `lo.b` is 4 and `hi.b` is `8 + 4 = 12`:

```asm
lwz   r4, 4(r3)     # r->lo.b   (0 + 4)
lwz   r0, 12(r3)    # r->hi.b   (8 + 4)
add   r3, r4, r0
blr
```

The two displacements are `sizeof(Pair)` apart — that's the giveaway. It's one
field, read from two inner structs sitting side by side. To take a pair of loads
apart, peel each offset into the inner struct it picks and the field it lands on.

Your target pulls a field from each inner struct and joins them with a different
operation. Peel each offset into outer plus inner, then put the combine back
together.

## Your task

With the structs above, write `func_803e3bbc` to reproduce the assembly above.

<!-- solution -->
```c
int func_803e3bbc(AABB* b) {
    return b->max.x - b->min.x;
}
```

<!-- context -->
```c
typedef struct { int x; int y; } Point;
typedef struct { Point min; Point max; } AABB;
```
