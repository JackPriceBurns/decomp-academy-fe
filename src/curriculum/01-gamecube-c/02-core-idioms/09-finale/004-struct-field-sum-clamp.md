---
id: ca24d658-87a9-5a9f-a7ff-aa728cdb38dd
slug: finale-struct-field-sum-clamp
title: "Sum a Struct Field, Then Clamp"
difficulty: 3
concepts:
  - finale
  - structs
  - arrays
  - loops
  - clamp
symbol: func_80289358
hints:
  - The `mulli` constant *is* `sizeof` the element; the displacement on the `lwz`
    *is* the field's offset within it.
  - "Two stages share the function: a loop that accumulates, then a single
    `cmpwi`/`bgtlr-` cap applied to the finished total."
---

# Walking an array of structs, then capping the result

This is the array-of-structs idiom from the structs chapter, inside a loop, with a
clamp on the tail. Nothing unfamiliar — three shapes you've met before, stacked.

First is element addressing. `&a[i]` is `base + i * sizeof(element)`. A struct size
that isn't a power of two surfaces as `mulli r0, r4, <size>`. The field you want is
a displacement load, `lwz <offset>(...)`. Next is the loop skeleton, walking `i`
from 0 to `n` and adding the field. Last is the one-sided clamp, capping the
finished sum with `cmpwi`/`bgtlr-`.

Picture an 8-byte element. Here's `total_weight(it, count)`, summing one field and
keeping the result under 255:

```c
typedef struct { int kind; int weight; } Item;   // sizeof == 8
```

```asm
body:
slwi  r0,r6,3      # i * 8   (size is a power of two -> slwi, not mulli)
addi  r6,r6,1      # i++
add   r5,r3,r0     # &it[i]
lwz   r0,4(r5)     # .weight  (offset 4 within the element)
add   r7,r7,r0     # accumulate
test:
cmpw  r6,r4
blt+  body
cmpwi r7,255       # finished sum: over the cap?
li    r3,255
bgtlr-             # yes -> 255
mr    r3,r7        # no  -> the sum
blr
```

The index scale gives the element size; the load displacement gives the field.
Here, ×8 and offset 4 say "the second `int` of an 8-byte pair." Once the loop
drains, `cmpwi`/`bgtlr-` is the same clamp as before, now on the accumulated total.

`func_80289358` walks a different struct, with its own size and field offset. Since
that size isn't a power of two, the scale comes through as `mulli` rather than
`slwi`. Pull `sizeof` from the index multiplier, the field from the load offset,
and the cap from the final compare.

## Your task

With the `Unit` struct below, write `func_80289358` to reproduce the target
assembly.

<!-- starter -->
```c
#pragma optimization_level 1
// define func_80289358 to match the target
```

<!-- solution -->
```c
#pragma optimization_level 1
int func_80289358(Unit *u, int n) {
    int i, s = 0;
    for (i = 0; i < n; i++) {
        s += u[i].hp;
    }
    if (s > 999) return 999;
    return s;
}
```

<!-- context -->
```c
typedef struct { int id; int hp; int mp; } Unit;
```
