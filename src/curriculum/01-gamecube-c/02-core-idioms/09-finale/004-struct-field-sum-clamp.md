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
symbol: total_hp
hints:
  - The `mulli` constant *is* `sizeof` the element; the displacement on the `lwz`
    *is* the field's offset within it.
  - "Two stages share the function: a loop that accumulates, then a single
    `cmpwi`/`bgtlr-` cap applied to the finished total."
---

# Walking an array of structs, then capping the result

This is the array-of-structs idiom from the structs chapter, run inside a loop,
with a clamp bolted onto the tail. Nothing here is unfamiliar; it's three shapes
you've met before, sitting on top of each other.

The first is element addressing. `&a[i]` is just `base + i * sizeof(element)`, and
a struct size that isn't a power of two surfaces as `mulli r0, r4, <size>`. The
field you want is then a displacement load, `lwz <offset>(...)`. Next is the loop
skeleton, walking `i` from 0 up to `n` and adding the field as it goes. Last is
the one-sided clamp, capping the finished sum with a `cmpwi`/`bgtlr-` pair.

Picture an 8-byte element. Here's `total_weight(it, count)`, summing one field
across the array and keeping the result under 255:

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

The index scale gives you the element size, the load displacement the field.
Here, `×8` and offset `4` together say "the second `int` of an 8-byte pair." Once
the loop drains, that `cmpwi`/`bgtlr-` is the same clamp you've written before,
now chewing on the accumulated total.

`total_hp` walks a *different* struct, with its own size and its own field offset
to read off the load. Since that size isn't a power of two, the scale comes
through as `mulli` rather than the `slwi` above. Pull `sizeof` from the index
multiplier, the field from the load offset, and the cap from the final compare.

## Your task

With the `Unit` struct below, write `total_hp` to reproduce the target assembly.

<!-- starter -->
```c
#pragma optimization_level 1
// define total_hp to match the target
```

<!-- solution -->
```c
#pragma optimization_level 1
int total_hp(Unit *u, int n) {
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
