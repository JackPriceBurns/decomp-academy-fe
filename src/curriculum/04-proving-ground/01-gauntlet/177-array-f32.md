---
id: gauntlet-array-f32
title: Index a f32 array
difficulty: 3
concepts:
  - pointers
  - arrays
  - f32
symbol: at
hints:
  - A f32 element uses lfsx (scale 4).
  - Write `a[i]`.
---

# Indexed load from a `f32` array

When a float array element is accessed through a variable index, the compiler scales the index by the element's size and issues a floating-point indexed load. For a 4-byte `f32` element, MWCC emits a `slwi` by 2 (to multiply by 4), then **`lfsx`** (indexed single-precision float load into an FPR).

This is analogous to `lwzx` for integers at the same element size, but the destination is a floating-point register and the opcode family is `lfs`/`lfsx`.

Consider a float buffer lookup:

```c
f32 fetch(f32* buf, int n) {
    return buf[n];
}
```

```asm
fetch:
  slwi    r0,r4,2
  lfsx    f1,r3,r0
  blr
```

The `slwi` by 2 converts element index to byte offset; `lfsx` loads the single-precision value into a float register.

## Your task
Write `at` to match the target.

<!-- starter -->
```c
f32 at(f32* a, int i) {
    return 0;
}
```

<!-- solution -->
```c
f32 at(f32* a, int i) {
    return a[i];
}
```
