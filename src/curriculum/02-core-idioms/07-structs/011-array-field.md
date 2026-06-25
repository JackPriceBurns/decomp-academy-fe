---
id: structs-array-field
title: An Array Inside a Struct
difficulty: 2
concepts:
  - structs
  - arrays
  - offsets
  - chaining
symbol: Record_sumFirstTwo
hints:
  - The array's base is the field's own offset; element `i` adds `i * elemSize`
    on top, so a constant index folds into a single fixed displacement.
  - Two loads at two fixed offsets, then one combine — no `mulli`, because the
    indices are constants the compiler precomputes.
---

# A member array is just more offset

The array-of-structs lesson scaled a *runtime* index with `mulli`. An array that
lives **inside** a struct, indexed by a *constant*, needs no multiply at all: the
compiler folds the element offset straight into the load displacement. The
field's array starts at its own offset within the struct, and element `i` adds
`i * sizeof(element)` on top — all resolved at compile time.

Consider a struct whose array follows a scalar field:

```c
typedef struct { int tag; int data[8]; } Buffer;

int Buffer_lastPair(Buffer* b) {
    return b->data[6] + b->data[7];
}
```

`tag` occupies offset 0, so `data` begins at offset 4. Each `int` element is 4
bytes, so `data[6]` is at `4 + 6*4 = 28` and `data[7]` at `4 + 7*4 = 32`:

```asm
lwz   r4, 28(r3)    # b->data[6]   (4 + 24)
lwz   r0, 32(r3)    # b->data[7]   (4 + 28)
add   r3, r4, r0
blr
```

No `mulli` or `lwzx` appears — both indices are constants, so each element is
just a fixed displacement. To recover the access, subtract the array's base
offset from the load displacement, then divide by the element size to get the
index. A run of evenly-spaced loads from one base is the signature of stepping
through a member array.

The target reads two elements of a member array and combines them. Work out the
array's base offset from the fields ahead of it, convert each displacement to an
index, then reproduce the combine.

## Your task

With the `Record` struct above, write `Record_sumFirstTwo` to reproduce the
assembly above.

<!-- starter -->
```c
int Record_sumFirstTwo(Record* r) {
    return 0;
}
```

<!-- solution -->
```c
int Record_sumFirstTwo(Record* r) {
    return r->scores[0] + r->scores[1];
}
```

<!-- context -->
```c
typedef struct { int id; int scores[4]; } Record;
```
