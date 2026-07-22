---
id: d2486f4b-d5f4-5b7b-9762-3644e3f4562b
slug: structs-array-index
title: "Arrays of Structs: Scaling the Index"
difficulty: 3
concepts:
  - structs
  - arrays
  - address-arithmetic
symbol: getZ
hints:
  - The element is 12 bytes, so the index is scaled by `mulli r0, r4, 12`.
  - After `add r3, r3, r0`, load `.z` at offset 8 with `lwz r3, 8(r3)`.
---

# The signature idiom: index × sizeof

Of all the patterns in GameCube decompilation, this is probably the one you'll
learn to recognize first. When the code says `a[i].field`, the compiler builds
the element's address as `base + i * sizeof(element)` and then adds the field's
own offset to land on the value. Here's the element type we'll use:

```c
typedef struct { int x; int y; int z; } Vec3i;   // sizeof == 12
```

Getting to an element comes down to scaling the index by the size of the struct.
The first field sits at offset 0, so once the multiply is done there's nothing
left to add. An indexed `lwzx` reads it directly, no displacement involved:

```asm
mulli  r0, r4, 12   # i * sizeof(Vec3i)
lwzx   r3, r3, r0   # load field at offset 0 of &a[i]
blr
```

When that multiply is a `mulli` and the constant isn't a power of two, you're
almost certainly looking at an array of structs. (A power-of-two size, 8 for
instance, would have the compiler emit `slwi` instead, like `slwi r0, r4, 3`.)
Anytime a `mulli` or `slwi` feeds an `add` that feeds a load, take the multiplier
at face value as the element's `sizeof`, and let the load's displacement tell you
which field inside the element got read.

## Your task

With `Vec3i` above, write `getZ` to match the target.

<!-- solution -->
```c
int getZ(Vec3i* a, int i) {
    return a[i].z;
}
```

<!-- context -->
```c
typedef struct { int x; int y; int z; } Vec3i;
```
