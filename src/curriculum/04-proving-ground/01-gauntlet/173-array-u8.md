---
id: gauntlet-array-u8
title: Index a u8 array
difficulty: 3
concepts:
  - pointers
  - arrays
  - u8
symbol: at
hints:
  - A u8 element uses lbzx (scale 1).
  - Write `a[i]`.
---

# Indexed load from a `u8` array

When an array element is accessed through a variable index, the compiler must scale the index by the element's size at runtime and then issue an *indexed* load rather than a displacement load.

For a 1-byte element (`u8`), the scale factor is 1 — no shift instruction is needed. The compiler goes straight to **`lbzx`**, which adds the base register and the (unshifted) index register together to form the effective address. Compare this with, say, a `u16` array where a `slwi` by 1 would appear before the load.

Consider a `u8` buffer lookup:

```c
u8 fetch(u8* buf, int n) {
    return buf[n];
}
```

```asm
fetch:
  lbzx    r3,r3,r4
  blr
```

No shift, just the indexed load — because each element is exactly one byte.

## Your task
Write `at` to match the target.

<!-- starter -->
```c
u8 at(u8* a, int i) {
    return 0;
}
```

<!-- solution -->
```c
u8 at(u8* a, int i) {
    return a[i];
}
```
