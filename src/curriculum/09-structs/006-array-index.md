---
id: structs-array-index
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

This is one of the most recognizable shapes in all of GameCube decompilation.
To find `a[i].field`, the compiler computes the element address as
`base + i * sizeof(element)`, then loads the field's offset on top. Given:

```c
typedef struct { int x; int y; int z; } Vec3i;   // sizeof == 12
```

`a[i].z` becomes "multiply the index by 12, add to the base, then load at
offset 8":

```asm
mulli r0, r4, 12   # i * sizeof(Vec3i)
add   r3, r3, r0   # &a[i]
lwz   r3, 8(r3)    # .z
blr
```

That **`mulli` by a non-power-of-two struct size is a dead giveaway** for an array
of structs. (If the struct size were a power of two — say 8 — you'd see `slwi`
instead, e.g. `slwi r0, r4, 3`.) When you spot a `mulli`/`slwi` feeding an
`add` then a load, reconstruct the element type from the multiplier: the constant
*is* `sizeof`.

## Your task

With `Vec3i` above, write `getZ` to match the target.

<!-- starter -->
```c
int getZ(Vec3i* a, int i) {
    return 0;
}
```

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
