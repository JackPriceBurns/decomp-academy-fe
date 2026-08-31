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
symbol: func_80179c60
hints:
  - The array's base is the field's own offset; element `i` adds `i * elemSize`
    on top, so a constant index folds into a single fixed displacement.
  - Two loads at two fixed offsets, then one combine — no `mulli`, because the
    indices are constants the compiler precomputes.
---

# A member array is just more offset

Last time, scaling a runtime index took a `mulli`. Here's the easy cousin: an
array inside a struct, indexed by a constant, needs no multiply. Whatever
offset the element works out to, the compiler folds it into the load. The array
opens at the field's offset in the struct; element `i` adds
`i * sizeof(element)` — and all of that is known at compile time.

Picture a struct that parks an array after a scalar field:

```c
typedef struct { int tag; int data[8]; } Buffer;

int Buffer_lastPair(Buffer* b) {
    return b->data[6] + b->data[7];
}
```

Offset 0 is `tag`, so `data` opens at offset 4. With 4-byte `int` elements,
`data[6]` is `4 + 6*4 = 28` and `data[7]` is `4 + 7*4 = 32`:

```asm
lwz   r4, 28(r3)    # b->data[6]   (4 + 24)
lwz   r0, 32(r3)    # b->data[7]   (4 + 28)
add   r3, r4, r0
blr
```

No `mulli`, no `lwzx` — constant indices let the compiler bake each element to
a fixed displacement. Reversing it: peel the array's base offset off the load's
displacement, divide the leftover by the element size, and out comes the index.
Evenly spaced loads off a single base? Something is walking a member array.

Your target reads two elements from a member array and joins them. Recover the
array's base offset from whatever fields come before it, turn each displacement
back into an index, then assemble the combine.

## Your task

Using the `Record` struct provided, write `func_80179c60` to reproduce the
target assembly.

<!-- solution -->
```c
int func_80179c60(Record* r) {
    return r->scores[0] + r->scores[1];
}
```

<!-- context -->
```c
typedef struct { int id; int scores[4]; } Record;
```
