---
id: gauntlet-array-s32
title: Index a s32 array
difficulty: 3
concepts:
  - pointers
  - arrays
  - s32
symbol: at
hints:
  - A s32 element uses lwzx (scale 4).
  - Write `a[i]`.
---

# Indexed load from a `s32` array

When an array element is accessed through a variable index, the compiler must scale the index by the element's size at runtime and then issue an *indexed* load. For multi-byte elements MWCC emits a `slwi` (shift-left-word-immediate) before the load — the shift amount equals `log2(sizeof(element))`.

For a 4-byte element the shift is by 2 (i.e. `× 4`), followed by **`lwzx`** (indexed word load, zero-extending). Even though the C type is signed, the word load itself is `lwzx` — full 32-bit words fill the register exactly, so sign extension is moot.

Consider a 32-bit integer buffer lookup:

```c
s32 fetch(s32* buf, int n) {
    return buf[n];
}
```

```asm
fetch:
  slwi    r0,r4,2
  lwzx    r3,r3,r0
  blr
```

The `slwi` by 2 multiplies the index by 4 (bytes per word). `lwzx` then loads the full word.

## Your task
Write `at` to match the target.

<!-- starter -->
```c
s32 at(s32* a, int i) {
    return 0;
}
```

<!-- solution -->
```c
s32 at(s32* a, int i) {
    return a[i];
}
```
