---
id: 75e7181d-1a9b-59fe-abaa-57cdb88cfe82
slug: structs-array-field
title: An Array Inside a Struct
difficulty: 2
concepts:
  - structs
  - arrays
  - offsets
  - chaining
symbol: Record_combineScores
hints:
  - The array's base is the field's own offset; element `i` adds `i * elemSize`
    on top, so a constant index folds into a single fixed displacement.
  - Two loads at two fixed offsets, then one combine — no `mulli`, because the
    indices are constants the compiler precomputes.
---

# A member array is just more offset

Last time, scaling a runtime index took a `mulli`. Here's the easy cousin. An
array living inside a struct, indexed by a constant, needs no multiply whatsoever.
Whatever offset the element works out to, the compiler folds it straight into the
load. Its array opens at the field's offset in the struct, then element `i` piles
`i * sizeof(element)` on top, and all of that is nailed down at compile time.

Picture a struct that parks an array right after a scalar field:

```c
typedef struct { int tag; int data[8]; } Buffer;

int Buffer_lastPair(Buffer* b) {
    return b->data[6] + b->data[7];
}
```

Offset 0 belongs to `tag`, so `data` opens at offset 4. With 4-byte `int`
elements, `data[6]` works out to `4 + 6*4 = 28` and `data[7]` to `4 + 7*4 = 32`:

```asm
lwz   r4, 28(r3)    # b->data[6]   (4 + 24)
lwz   r0, 32(r3)    # b->data[7]   (4 + 28)
add   r3, r4, r0
blr
```

Nowhere do you see a `mulli` or an `lwzx`. Constant indices let the compiler bake
each element down to a fixed displacement. Reversing that is easy enough: peel the
array's base offset off a load's displacement, divide the leftover by the element
size, and out comes the index. Evenly spaced loads marching off a single base?
Something is walking a member array.

Two elements get read from a member array in your target and joined together.
Recover the array's base offset from whatever fields come before it, turn each
displacement back into an index, then assemble the combine.

## Your task

With the `Record` struct above, write `Record_combineScores` to reproduce the
assembly above.

<!-- solution -->
```c
int Record_combineScores(Record* r) {
    return r->scores[0] + r->scores[1];
}
```

<!-- context -->
```c
typedef struct { int id; int scores[4]; } Record;
```
