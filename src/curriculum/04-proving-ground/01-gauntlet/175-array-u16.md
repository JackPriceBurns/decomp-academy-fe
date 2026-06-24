---
id: gauntlet-array-u16
title: Index a u16 array
difficulty: 3
concepts:
  - pointers
  - arrays
  - u16
symbol: at
hints:
  - A u16 element uses lhzx (scale 2).
  - Write `a[i]`.
---

# Indexed load from a `u16` array

When an array element is accessed through a variable index, the compiler must scale the index by the element's size at runtime and then issue an *indexed* load. For multi-byte elements MWCC emits a `slwi` (shift-left-word-immediate) before the load — the shift amount equals `log2(sizeof(element))`.

For an unsigned 2-byte element the shift is by 1 (i.e. `× 2`), followed by **`lhzx`** (indexed zero-extending half-word load). This is the unsigned counterpart to `lhax`: no sign extension, so the upper bits are zeroed.

Consider an unsigned short buffer lookup:

```c
u16 fetch(u16* buf, int n) {
    return buf[n];
}
```

```asm
fetch:
  slwi    r0,r4,1
  lhzx    r3,r3,r0
  blr
```

Same shift as the signed case, but the opcode changes to `lhzx` because the element type is unsigned.

## Your task
Write `at` to match the target.

<!-- starter -->
```c
u16 at(u16* a, int i) {
    return 0;
}
```

<!-- solution -->
```c
u16 at(u16* a, int i) {
    return a[i];
}
```
