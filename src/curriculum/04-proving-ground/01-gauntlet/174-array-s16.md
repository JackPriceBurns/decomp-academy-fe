---
id: gauntlet-array-s16
title: Index a s16 array
difficulty: 3
concepts:
  - pointers
  - arrays
  - s16
symbol: at
hints:
  - A s16 element uses lhax (scale 2).
  - Write `a[i]`.
---

# Indexed load from a `s16` array

When an array element is accessed through a variable index, the compiler must scale the index by the element's size at runtime and then issue an *indexed* load. For multi-byte elements MWCC emits a `slwi` (shift-left-word-immediate) before the load — the shift amount equals `log2(sizeof(element))`.

For a signed 2-byte element, the shift is by 1 (i.e. `× 2`), followed by **`lhax`** (indexed signed half-word load).

Consider a signed short buffer lookup:

```c
s16 fetch(s16* buf, int n) {
    return buf[n];
}
```

```asm
fetch:
  slwi    r0,r4,1
  lhax    r3,r3,r0
  blr
```

The `slwi` by 1 doubles the index to turn element-count into byte-offset. `lhax` then sign-extends the 16-bit value into a 32-bit register.

## Your task
Write `at` to match the target.

<!-- starter -->
```c
s16 at(s16* a, int i) {
    return 0;
}
```

<!-- solution -->
```c
s16 at(s16* a, int i) {
    return a[i];
}
```
