---
id: d2486f4b-d5f4-5b7b-9762-3644e3f4562b
slug: structs-array-index
title: "Arrays of Structs: Scaling the Index"
difficulty: 3
concepts:
  - structs
  - arrays
  - address-arithmetic
symbol: func_800921bc
hints:
  - The element is 12 bytes, so the index is scaled by `mulli r0, r4, 12`.
  - After `add r3, r3, r0`, load `.z` at offset 8 with `lwz r3, 8(r3)`.
---

# The signature idiom: index × sizeof

Of all the patterns in GameCube decompilation, this is probably the one you'll
recognize first. When the code says `a[i].field`, the compiler builds the element
address as `base + i * sizeof(element)` and then adds the field's own offset.
Here's the element type:

```c
typedef struct { int x; int y; int z; } Vec3i;   // sizeof == 12
```

Getting to an element means scaling the index by the struct size. The first field
sits at offset 0, so once the multiply is done there's nothing left to add. An
indexed `lwzx` reads it directly:

```asm
mulli  r0, r4, 12   # i * sizeof(Vec3i)
lwzx   r3, r3, r0   # load field at offset 0 of &a[i]
blr
```

When the multiply is `mulli` and the constant isn't a power of two, you're almost
certainly looking at an array of structs. (A power-of-two size, like 8, would get
`slwi` instead, e.g. `slwi r0, r4, 3`.) Anytime a `mulli` or `slwi` feeds an `add`
that feeds a load, treat the multiplier as the element's `sizeof`, and let the
load's displacement tell you which field inside the element got read.

## Your task

With `Vec3i` above, write `func_800921bc` to match the target.

<!-- solution -->
```c
int func_800921bc(Vec3i* a, int i) {
    return a[i].z;
}
```

<!-- context -->
```c
typedef struct { int x; int y; int z; } Vec3i;
```
