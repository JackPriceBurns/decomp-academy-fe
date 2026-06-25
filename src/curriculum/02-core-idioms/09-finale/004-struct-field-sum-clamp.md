---
id: finale-struct-field-sum-clamp
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

This is the array-of-structs idiom from the structs chapter, driven by a loop,
with a clamp stapled on the end. Three shapes you already know, stacked:

- **Element addressing**: `&a[i]` is `base + i * sizeof(element)`. A
  non-power-of-two struct size shows up as `mulli r0, r4, <size>`; the field is
  then a displacement load, `lwz <offset>(...)`.
- **The loop skeleton** drives `i` from 0 to `n`, accumulating the field.
- **A one-sided clamp** caps the finished sum with `cmpwi`/`bgtlr-`.

Consider an 8-byte element and a function `total_weight(it, count)` that sums one
field across the array and holds the result under 255:

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

Read the element size off the index scale and the field off the load
displacement: here `×8` and offset `4` say "the second `int` of an 8-byte pair."
After the loop, the `cmpwi`/`bgtlr-` is the same clamp shape from earlier
lessons, now applied to the accumulated total.

Your `total_hp` walks a *different* struct — its size and the field offset both
differ, and because the size isn't a power of two you'll see `mulli` where the
example had `slwi`. Recover `sizeof` from the index multiplier, the field from
the load offset, and the cap from the final compare.

## Your task

With the `Unit` struct below, write `total_hp` to reproduce the target assembly.

<!-- starter -->
```c
#pragma optimization_level 1
int total_hp(Unit *u, int n) {
    int i, s = 0;
    // sum one field across the array, then cap the total
    return s;
}
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
